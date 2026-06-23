#!/usr/bin/env bun
/**
 * Drift gate: fails if any tracked file references `mantine`, `shadcn`,
 * or a `*-replica/` folder. Wired into `bun run check` so a future
 * contributor who reintroduces a Mantine/shadcn import or a Ladle-only
 * replica folder breaks the build.
 *
 * Scan roots: `tests/`, `docs/`, `openspec/`, `AGENTS.md`,
 * `CONTRIBUTING.md`, and `components.json` (when present).
 *
 * Allowed exceptions:
 *   - this script's own path
 *   - the `openspec/changes/heroui-parity-and-docs/` change folder
 *     (its proposal/design/spec intentionally name the legacy libraries
 *     so reviewers can read the audit context)
 *   - the `openspec/changes/allowlist-heroui-replica-references/` change
 *     folder (its proposal/design/spec intentionally name the legacy
 *     libraries to describe what the gate itself forbids)
 *   - the `openspec/changes/archive/` tree (historical records)
 *   - the `tests/unit/no-ladle-replica-in-production.test.ts` import-graph
 *     guard (the regexes it carries must name the legacy libraries to
 *     detect them)
 *   - the `openspec/specs/heroui-ladle-design-system/` spec folder (its
 *     requirements legitimately describe the `heroui-replica/` boundary
 *     as part of the isolation contract)
 *   - the `openspec/specs/ui-system-heroui-parity/` spec folder (its
 *     requirements legitimately reference `heroui-replica` and
 *     `mantine-replica` for parity audit context)
 *   - the `openspec/specs/design-system-package/` spec folder (its
 *     requirements legitimately describe the `heroui-replica/` boundary
 *     as part of the isolation contract)
 *
 * Exit codes:
 *   0  no offending matches
 *   1  at least one match found
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "..");
const FORBIDDEN_RE = /(?:mantine|shadcn)|\/[^"'`\s]*-replica\//gi;

const NEGATION_CUE_RE =
  /(?:(?:^|[\s([])(?:no|not|never|(?:must|shall|do|does|don|don\u2019t)\s+not)(?=[\s.!?])|(?:mantine|shadcn|-replica(?:\/|\b))[^.\n]{0,120}(?:^|[\s([])(?:no|not|never|(?:must|shall|do|does|don|don\u2019t)\s+not)(?=[\s.!?])|@ladle-only[^.\n]{0,120}replica|exception[^.\n]{0,80}replica|replica[^.\n]{0,40}enforced)/is;

const SCAN_ROOTS = [
  "tests",
  "docs",
  "openspec",
  "AGENTS.md",
  "CONTRIBUTING.md",
  "components.json",
];

const ALLOWED_PATH_FRAGMENTS = [
  "scripts/check-legacy-ui-references.ts",
  "tests/unit/no-ladle-replica-in-production.test.ts",
  "openspec/changes/archive/",
  "openspec/changes/heroui-parity-and-docs/",
  "openspec/changes/allowlist-heroui-replica-references/",
  "openspec/specs/heroui-ladle-design-system/",
  "openspec/specs/ui-system-heroui-parity/",
  "openspec/specs/design-system-package/",
];

const SCAN_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".astro",
  ".js",
  ".mjs",
  ".cjs",
  ".md",
  ".feature",
  ".json",
]);

type Offender = { path: string; line: number; text: string };

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, out);
      continue;
    }
    out.push(full);
  }
  return out;
}

function collectFiles(paths: string[]): string[] {
  const out: string[] = [];
  for (const p of paths) {
    const full = resolve(REPO_ROOT, p);
    if (!existsSync(full)) continue;
    const stat = statSync(full);
    if (stat.isDirectory()) {
      for (const file of walk(full)) {
        if (
          SCAN_EXTENSIONS.has(file.slice(file.lastIndexOf(".")) || "") ||
          !file.includes(".")
        ) {
          out.push(file);
        }
      }
    } else {
      out.push(full);
    }
  }
  return out;
}

function isAllowed(rel: string): boolean {
  for (const fragment of ALLOWED_PATH_FRAGMENTS) {
    if (rel === fragment || rel.startsWith(fragment)) return true;
  }
  return false;
}

function scanFile(path: string): Offender[] {
  const rel = relative(REPO_ROOT, path);
  if (isAllowed(rel)) return [];
  const text = readFileSync(path, "utf8");
  const lines = text.split("\n");
  const offenders: Offender[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!FORBIDDEN_RE.test(line)) continue;
    if (NEGATION_CUE_RE.test(line)) continue;
    offenders.push({ path, line: i + 1, text: line.trim() });
  }
  return offenders;
}

const files = collectFiles(SCAN_ROOTS);
const offenders: Offender[] = [];
for (const file of files) {
  offenders.push(...scanFile(file));
}

if (offenders.length === 0) {
  console.log(
    "[legacy-ui-refs] OK — no mantine/shadcn/replica references in tracked files",
  );
  process.exit(0);
}

console.error(
  `[legacy-ui-refs] FAIL — ${offenders.length} reference(s) to mantine/shadcn/*-replica/ in tracked files:`,
);
for (const offender of offenders) {
  console.error(
    `  ${relative(REPO_ROOT, offender.path)}:${offender.line}  ${offender.text}`,
  );
}
console.error("");
console.error(
  "Remove the legacy reference, or update the allowlist in scripts/check-legacy-ui-references.ts if it is intentional.",
);
process.exit(1);
