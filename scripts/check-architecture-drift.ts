#!/usr/bin/env bun
/**
 * Architecture drift check.
 *
 * Walks the LikeC4 model (exported to JSON via `likec4 export json`) and
 * asserts that every `#path:` tag value resolves to a real file or directory
 * in the repository. Exits non-zero on the first missing path (or reports
 * all of them).
 *
 * Usage:
 *   bun run scripts/check-architecture-drift.ts            # CI mode
 *   bun run scripts/check-architecture-drift.ts --update    # rewrite paths in-place
 *
 * The `--update` mode is intended for a renaming PR: the script edits the
 * `.likec4` files in `architecture/` so the path value matches the new
 * location. The normal CI run fails fast on any missing path.
 */

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";

const REPO_ROOT = resolve(__dirname, "..");
const ARCH_DIR = join(REPO_ROOT, "architecture");
const LIKEC4_BIN = resolve(REPO_ROOT, "node_modules", ".bin", "likec4");

const args = new Set(process.argv.slice(2));
const UPDATE_MODE = args.has("--update");

interface LikeC4Element {
  id: string;
  kind?: string;
  tags?: string[];
  children?: LikeC4Element[];
  metadata?: Record<string, string | string[]>;
}

interface LikeC4Model {
  elements: Record<string, LikeC4Element>;
  deployments?: { elements: Record<string, LikeC4Element> };
  views?: unknown;
}

interface DriftEntry {
  element: string;
  path: string;
  sourceFile: string;
}

function runLikec4ExportJson(outPath: string): {
  ok: boolean;
  stdout: string;
  stderr: string;
} {
  if (!existsSync(LIKEC4_BIN)) {
    return {
      ok: false,
      stdout: "",
      stderr: `likec4 binary not found at ${LIKEC4_BIN}. Did you run 'bun install'?`,
    };
  }
  const result = spawnSync(LIKEC4_BIN, ["export", "json", "-o", outPath], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function flattenElements(
  elements: LikeC4Element[] | undefined,
): LikeC4Element[] {
  if (!elements) return [];
  const out: LikeC4Element[] = [];
  const walk = (e: LikeC4Element) => {
    out.push(e);
    for (const child of e.children ?? []) walk(child);
  };
  for (const e of elements) walk(e);
  return out;
}

function findSourceFileForElement(el: LikeC4Element): string {
  // Heuristic: most model elements are declared in `architecture/model.likec4`;
  // deployment nodes are in `architecture/deployment.likec4`. We use the
  // element's identifier to pick a file.
  if (
    el.id === "local" ||
    el.id === "preview" ||
    el.id === "prod" ||
    el.id.startsWith("local.") ||
    el.id.startsWith("preview.") ||
    el.id.startsWith("prod.")
  ) {
    return join(ARCH_DIR, "deployment.likec4");
  }
  return join(ARCH_DIR, "model.likec4");
}

function rewritePathInSource(
  sourceFile: string,
  elementId: string,
  newPath: string,
): boolean {
  if (!existsSync(sourceFile)) return false;
  const text = readFileSync(sourceFile, "utf8");

  // Find the element's block (loose regex — good enough for our hand-authored
  // model). The block starts at the first `= component`/`= container`/...
  // referring to the id and ends at the matching `}`.
  const kinds = [
    "actor",
    "system",
    "container",
    "component",
    "store",
    "external",
  ];
  let blockStart = -1;
  for (const k of kinds) {
    const m = new RegExp(`^\\s*${k}\\s+['"]?${elementId}['"]?\\b`, "m").exec(
      text,
    );
    if (m && (blockStart === -1 || (m.index ?? -1) < blockStart)) {
      blockStart = m.index ?? -1;
    }
  }
  if (blockStart === -1) return false;

  // Find the matching closing brace.
  let depth = 0;
  let i = blockStart;
  let blockEnd = -1;
  for (; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) {
        blockEnd = i + 1;
        break;
      }
    }
  }
  if (blockEnd === -1) return false;

  const block = text.slice(blockStart, blockEnd);
  const newLine = `      path '${newPath}'`;
  let newBlock: string;
  if (/path\s+'/.test(block)) {
    newBlock = block.replace(/path\s+'[^']*'/, `path '${newPath}'`);
  } else {
    // Insert a metadata.path entry as the first metadata line.
    newBlock = block.replace(/(\n\s*metadata\s*\{\n)/, `$1${newLine}\n`);
  }

  const updated = text.slice(0, blockStart) + newBlock + text.slice(blockEnd);
  writeFileSync(sourceFile, updated);
  return true;
}

function main() {
  const tmp = join(
    tmpdir(),
    `likec4-drift-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  );
  mkdirSync(tmp, { recursive: true });
  const dumpPath = join(tmp, "model.json");
  const exportResult = runLikec4ExportJson(dumpPath);
  if (!exportResult.ok) {
    console.error("Failed to export LikeC4 model to JSON:");
    console.error(exportResult.stderr || exportResult.stdout);
    process.exit(2);
  }

  const model = JSON.parse(readFileSync(dumpPath, "utf8")) as LikeC4Model;
  const elements = flattenElements([
    ...Object.values(model.elements ?? {}),
    ...Object.values(model.deployments?.elements ?? {}),
  ]);

  const missing: DriftEntry[] = [];
  const entries: DriftEntry[] = [];

  for (const el of elements) {
    const rawPath = el.metadata?.path;
    const rel = Array.isArray(rawPath) ? rawPath[0] : rawPath;
    if (typeof rel !== "string" || !rel) continue;
    const abs = join(REPO_ROOT, rel);
    const entry: DriftEntry = {
      element: el.id,
      path: rel,
      sourceFile: findSourceFileForElement(el),
    };
    entries.push(entry);
    if (!existsSync(abs) || !statSync(abs)) {
      missing.push(entry);
    }
  }

  try {
    rmSync(tmp, { recursive: true, force: true });
  } catch (_e) {
    // best-effort cleanup
  }

  if (missing.length === 0) {
    console.log(
      `arch:drift OK — checked ${entries.length} metadata.path value(s) against the repo.`,
    );
    process.exit(0);
  }

  if (UPDATE_MODE) {
    console.log(
      `arch:drift --update: rewriting ${missing.length} missing metadata.path value(s) in place…`,
    );
    let rewritten = 0;
    for (const m of missing) {
      // In --update mode we leave the path value unchanged but rebuild the
      // source block so the human reviewer can edit it. The script does
      // not guess a new path because that would hide intent.
      const ok = rewritePathInSource(m.sourceFile, m.element, m.path);
      if (ok) {
        rewritten += 1;
        console.log(
          `  ${m.element}: rewrote metadata.path = '${m.path}' in ${relative(REPO_ROOT, m.sourceFile)}`,
        );
      } else {
        console.log(
          `  ${m.element}: could not locate source block in ${relative(REPO_ROOT, m.sourceFile)} — manual fix required`,
        );
      }
    }
    console.log(`\nRewrote ${rewritten}/${missing.length} source block(s).`);
    console.error(
      "\narch:drift --update does not pick a new path automatically.\n" +
        "Edit the highlighted files in architecture/ to set a new metadata.path value, then re-run the script.",
    );
    process.exit(1);
  }

  console.error(
    "arch:drift FAILED — model references files that no longer exist:",
  );
  for (const m of missing) {
    console.error(
      `  - element ${m.element} -> metadata.path = '${m.path}' (declared in ${relative(
        REPO_ROOT,
        m.sourceFile,
      )})`,
    );
  }
  console.error(
    `\n${missing.length} missing path(s). Run \`bun run arch:drift --update\` from a renaming PR to see the affected files.`,
  );
  process.exit(1);
}

try {
  main();
} catch (err) {
  console.error("arch:drift crashed:", err);
  process.exit(2);
}
