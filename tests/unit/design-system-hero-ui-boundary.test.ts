#!/usr/bin/env bun
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "../..");
const SELF_FILE = relative(REPO_ROOT, import.meta.filename);

const EXCLUDED_DIRS = new Set([
  "node_modules",
  ".git",
  ".ladle",
  "dist",
  ".astro",
  ".next",
  ".data",
  ".wrangler",
  ".changeset",
  "public",
]);

const DESIGN_SYSTEM_PREFIX = "packages/design-system/";

const FORBIDDEN_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  {
    pattern: /from\s+["']@nextui-org\/react["']/,
    reason: "@nextui-org/react is private to packages/design-system",
  },
  {
    pattern: /from\s+["']@nextui-org\//,
    reason: "@nextui-org/* is private to packages/design-system",
  },
  {
    pattern: /from\s+["']@heroui\//,
    reason: "@heroui/* is private to packages/design-system",
  },
];

const extensions = new Set([".ts", ".tsx", ".astro"]);

function walk(dir: string, out: string[] = []): string[] {
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
      if (EXCLUDED_DIRS.has(entry)) {
        continue;
      }
      walk(full, out);
    } else {
      const dot = entry.lastIndexOf(".");
      if (dot === -1) continue;
      const ext = entry.slice(dot);
      if (!extensions.has(ext)) continue;
      out.push(full);
    }
  }
  return out;
}

const failures: Array<{ file: string; reason: string; line: number }> = [];
const files = walk(REPO_ROOT);

for (const file of files) {
  const rel = relative(REPO_ROOT, file);
  if (rel === SELF_FILE) continue;
  if (rel.startsWith(DESIGN_SYSTEM_PREFIX)) continue;
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    for (const { pattern, reason } of FORBIDDEN_PATTERNS) {
      if (pattern.test(line)) {
        failures.push({ file: rel, reason, line: i + 1 });
      }
    }
  }
}

if (failures.length > 0) {
  console.error("design-system-hero-ui-boundary failed:");
  for (const failure of failures) {
    console.error(`  ${failure.file}:${failure.line} — ${failure.reason}`);
  }
  process.exit(1);
}

console.log(
  `design-system-hero-ui-boundary passed (${files.length} files scanned)`,
);
