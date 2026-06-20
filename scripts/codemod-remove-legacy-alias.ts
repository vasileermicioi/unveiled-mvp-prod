#!/usr/bin/env bun

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "..");

const SCAN_ROOTS = [
  join(REPO_ROOT, "packages/app/src"),
  join(REPO_ROOT, "packages/api/src"),
];

const LEGACY_ALIAS_RE = /(["'])(@\/[^"']+)\1/g;

const FILE_RE = /\.(ts|tsx|astro|mjs|js)$/;

function* walk(root: string): Generator<string> {
  if (!existsSync(root)) return;
  const entries = readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && FILE_RE.test(entry.name)) {
      yield full;
    }
  }
}

type Mode = "apply" | "verify";

const mode: Mode = process.argv.includes("--verify") ? "verify" : "apply";

let violations = 0;
let rewrites = 0;

for (const root of SCAN_ROOTS) {
  for (const file of walk(root)) {
    const original = readFileSync(file, "utf8");
    const replaced = original.replace(
      LEGACY_ALIAS_RE,
      (_, quote, specifier: string) => {
        const rest = specifier.slice(2);
        return `${quote}~/${rest}${quote}`;
      },
    );
    if (replaced !== original) {
      if (mode === "apply") {
        writeFileSync(file, replaced, "utf8");
        rewrites += 1;
      } else {
        violations += 1;
        const displayPath = relative(REPO_ROOT, file);
        console.error(`legacy @/ import remains: ${displayPath}`);
      }
    }
  }
}

if (mode === "apply") {
  console.log(`codemod-remove-legacy-alias: rewrote ${rewrites} files.`);
} else {
  if (violations > 0) {
    console.error(
      `codemod-remove-legacy-alias: ${violations} files still use the legacy @/ alias.`,
    );
    process.exit(1);
  }
  console.log("codemod-remove-legacy-alias: no legacy @/ imports remain.");
}
