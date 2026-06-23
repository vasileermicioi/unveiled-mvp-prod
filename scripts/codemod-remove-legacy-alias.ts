#!/usr/bin/env bun

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "..");

const EXCLUDED_DIRS = new Set([
  "node_modules",
  "dist",
  ".astro",
  "_old_app",
  ".data",
  ".bun",
  ".git",
  ".opencode",
]);

const API_ONLY_PREFIXES = [
  "/lib/auth-account-actions",
  "/lib/auth-profile",
  "/lib/auth-forms",
  "/lib/data-access/",
  "/lib/unveiled-view-models",
  "/lib/admin-operations",
  "/lib/forms/",
  "/lib/payments/",
  "/lib/middleware/",
  "/lib/handlers/",
  "/lib/assets/",
  "/lib/i18n",
  "/lib/env",
];

const LEGACY_ALIAS_RE = /(["'])(@\/[^"']+)\1/g;
const FILE_RE = /\.(ts|tsx|astro|mjs|js)$/;

function* walk(root: string): Generator<string> {
  if (!existsSync(root)) return;
  const entries = readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const full = join(root, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && FILE_RE.test(entry.name)) {
      yield full;
    }
  }
}

function rewriteTarget(specifier: string): string {
  for (const prefix of API_ONLY_PREFIXES) {
    const boundary = prefix.endsWith("/") ? prefix : `${prefix}/`;
    if (specifier === `@${prefix}` || specifier.startsWith(`@${boundary}`)) {
      return specifier.replace(/^@\/lib\//, "@unveiled/api/");
    }
  }
  return specifier.replace(/^@\//, "@unveiled/app/");
}

type Mode = "apply" | "verify";

const mode: Mode = process.argv.includes("--verify") ? "verify" : "apply";

let violations = 0;
let rewrites = 0;

for (const file of walk(REPO_ROOT)) {
  const original = readFileSync(file, "utf8");
  const replaced = original.replace(
    LEGACY_ALIAS_RE,
    (_, quote, specifier: string) => {
      const target = rewriteTarget(specifier);
      return `${quote}${target}${quote}`;
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
