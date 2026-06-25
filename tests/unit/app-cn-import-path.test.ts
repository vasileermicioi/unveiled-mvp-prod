#!/usr/bin/env bun
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "../..");
const APP_SRC = join(REPO_ROOT, "packages/app/src");

const FORBIDDEN_PATH = /from\s+["']@unveiled\/design-system\/lib\/utils["']/;

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

const failures: Array<{ file: string; line: number }> = [];
const files = walk(APP_SRC, new Set([".ts", ".tsx", ".astro"]));

for (const file of files) {
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (FORBIDDEN_PATH.test(lines[i] ?? "")) {
      failures.push({ file: relative(REPO_ROOT, file), line: i + 1 });
    }
  }
}

if (failures.length > 0) {
  console.error("app-cn-import-path failed:");
  for (const failure of failures) {
    console.error(`  ${failure.file}:${failure.line}`);
  }
  process.exit(1);
}

console.log(`app-cn-import-path passed (${files.length} files)`);
