#!/usr/bin/env bun
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "../..");
const APP_SRC = join(REPO_ROOT, "packages/app/src");

const FORBIDDEN_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  {
    pattern: /from\s+["']@unveiled\/design-system\/lib\//,
    reason: "deep imports into design-system internals",
  },
  {
    pattern: /from\s+["']@unveiled\/design-system\/atoms\//,
    reason: "deep imports into design-system atoms",
  },
  {
    pattern: /from\s+["']@unveiled\/design-system\/molecules\//,
    reason: "deep imports into design-system molecules",
  },
  {
    pattern: /from\s+["']@unveiled\/design-system\/organisms\//,
    reason: "deep imports into design-system organisms",
  },
  {
    pattern: /from\s+["']@unveiled\/design-system\/layouts\//,
    reason: "deep imports into design-system layouts",
  },
  {
    pattern: /from\s+["']@unveiled\/design-system\/pages\//,
    reason: "deep imports into design-system pages",
  },
  {
    pattern: /from\s+["']@unveiled\/design-system\/heroui-replica\//,
    reason: "Ladle-only replica must not be imported in production",
  },
  {
    pattern: /from\s+["']@nextui-org\//,
    reason: "third-party UI library import",
  },
  { pattern: /from\s+["']@heroui\//, reason: "third-party UI library import" },
  {
    pattern: /from\s+["']@radix-ui\//,
    reason: "third-party UI library import",
  },
  {
    pattern: /from\s+["']@headlessui\//,
    reason: "third-party UI library import",
  },
  { pattern: /from\s+["']react-aria/, reason: "third-party UI library import" },
  { pattern: /from\s+["']@mui\//, reason: "third-party UI library import" },
  {
    pattern: /from\s+["']@chakra-ui\//,
    reason: "third-party UI library import",
  },
];

const ALLOWED_LUCIDE_COMMENT = /\/\/\s*source:\s*lucide-(react|static)/;
const FILE_ALLOW_LIST = new Set<string>([]);

function walk(
  dir: string,
  extensions: Set<string>,
  out: string[] = [],
): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, extensions, out);
    } else {
      const ext = entry.slice(entry.lastIndexOf("."));
      if (extensions.has(ext)) {
        out.push(full);
      }
    }
  }
  return out;
}

const failures: Array<{ file: string; reason: string; line: number }> = [];
const extensions = new Set([".ts", ".tsx", ".astro"]);
const files = walk(APP_SRC, extensions);

for (const file of files) {
  const rel = relative(REPO_ROOT, file);
  if (FILE_ALLOW_LIST.has(rel)) {
    continue;
  }
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    for (const { pattern, reason } of FORBIDDEN_PATTERNS) {
      if (pattern.test(line)) {
        if (
          pattern.source.includes("lucide-react") &&
          ALLOWED_LUCIDE_COMMENT.test(line)
        ) {
          continue;
        }
        failures.push({
          file: relative(REPO_ROOT, file),
          reason,
          line: i + 1,
        });
      }
    }
  }
}

if (failures.length > 0) {
  console.error("app-design-system-import-boundary failed:");
  for (const failure of failures) {
    console.error(`  ${failure.file}:${failure.line} — ${failure.reason}`);
  }
  process.exit(1);
}

console.log(`app-design-system-import-boundary passed (${files.length} files)`);
