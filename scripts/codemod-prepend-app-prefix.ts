#!/usr/bin/env bun

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "..");

const FEATURE_ROOT = join(REPO_ROOT, "tests/features");

const STEP_KEYWORDS = ["Given", "When", "Then", "And", "But"];

type Mode = "apply" | "verify";

const mode: Mode = process.argv.includes("--verify") ? "verify" : "apply";

let rewrites = 0;
let violations = 0;

function* walk(root: string): Generator<string> {
  if (!existsSync(root)) return;
  const entries = readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && entry.name.endsWith(".feature")) {
      yield full;
    }
  }
}

function rewriteUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("/app")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/_")) return url;
  if (url.startsWith("/api/")) return url;
  if (!url.startsWith("/")) return url;
  return `/app${url}`;
}

const PATTERN_RE = new RegExp(
  `^(\\s*)(${STEP_KEYWORDS.join("|")})\\b(.*)$`,
  "i",
);

for (const file of walk(FEATURE_ROOT)) {
  const original = readFileSync(file, "utf8");
  const lines = original.split("\n");
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(PATTERN_RE);
    if (!m) continue;
    const indent = m[1];
    const keyword = m[2];
    const rest = m[3];
    const replaced = rest.replace(/(\/[a-z][\w./?=&%-]*)/gi, (match) => {
      const next = rewriteUrl(match);
      if (next !== match) {
        changed = true;
      }
      return next;
    });
    if (changed) {
      lines[i] = `${indent}${keyword}${replaced}`;
    }
  }
  if (changed) {
    if (mode === "apply") {
      writeFileSync(file, lines.join("\n"), "utf8");
      rewrites += 1;
    } else {
      violations += 1;
      console.error(`un-prepended URL in: ${relative(REPO_ROOT, file)}`);
    }
  }
}

if (mode === "apply") {
  console.log(`codemod-prepend-app-prefix: rewrote ${rewrites} feature files.`);
} else {
  if (violations > 0) {
    console.error(
      `codemod-prepend-app-prefix: ${violations} feature files still have un-prepended URLs.`,
    );
    process.exit(1);
  }
  console.log(
    "codemod-prepend-app-prefix: all feature URLs are prefixed with /app.",
  );
}
