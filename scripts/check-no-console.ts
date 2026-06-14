#!/usr/bin/env bun
/**
 * Fails if any `console.log`, `console.info`, `console.warn`, or
 * `console.error` call remains in the server-side surface under
 * `src/`, excluding test files, storybook stories, the logger
 * module itself, and browser-side React components. Run as part of
 * `bun run check`.
 *
 * Exit codes:
 *   0  no offending matches
 *   1  at least one match found
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "..");
const SCAN_ROOT = resolve(REPO_ROOT, "src");

const ALLOWED_FILE_SUFFIXES = new Set([
  ".test.ts",
  ".integration.test.ts",
  ".stories.tsx",
  ".stories.ts",
]);

const ALLOWED_PATH_FRAGMENTS = ["src/lib/logger.ts", "src/lib/logger.test.ts"];

const ALLOWED_PATH_DIRS = ["src/components/", "src/layouts/"];

const FORBIDDEN = /console\s*\.\s*(log|info|warn|error)\s*\(/;

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

function isAllowed(path: string): boolean {
  for (const suffix of ALLOWED_FILE_SUFFIXES) {
    if (path.endsWith(suffix)) return true;
  }
  const rel = relative(REPO_ROOT, path);
  for (const fragment of ALLOWED_PATH_FRAGMENTS) {
    if (rel === fragment) return true;
  }
  for (const dir of ALLOWED_PATH_DIRS) {
    if (rel.startsWith(dir)) return true;
  }
  return false;
}

function scanFile(path: string): Offender[] {
  if (isAllowed(path)) return [];
  if (!/\.(?:[cm]?ts|tsx|astro|js|mjs|cjs)$/.test(path)) return [];
  const text = readFileSync(path, "utf8");
  const lines = text.split("\n");
  const offenders: Offender[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (FORBIDDEN.test(line)) {
      offenders.push({ path, line: i + 1, text: line.trim() });
    }
  }
  return offenders;
}

const files = walk(SCAN_ROOT);
const offenders: Offender[] = [];
for (const file of files) {
  offenders.push(...scanFile(file));
}

if (offenders.length === 0) {
  console.log(
    `[no-console] OK — no ad-hoc server console calls under ${relative(REPO_ROOT, SCAN_ROOT)}/`,
  );
  process.exit(0);
}

console.error(
  `[no-console] FAIL — ${offenders.length} ad-hoc server console call(s) found:`,
);
for (const offender of offenders) {
  console.error(
    `  ${relative(REPO_ROOT, offender.path)}:${offender.line}  ${offender.text}`,
  );
}
console.error("");
console.error(
  "Use the application logger from `@/lib/logger` instead of console.*",
);
process.exit(1);
