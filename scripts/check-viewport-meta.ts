#!/usr/bin/env bun
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const PAGES_DIR = join(ROOT, "packages/app/src/pages");
const LAYOUT_FILE = join(ROOT, "packages/app/src/layouts/base-layout.astro");
const CANONICAL_CONTENT = "width=device-width, initial-scale=1";

type Finding = { file: string; issue: string };

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) walk(full, acc);
    else if (entry.endsWith(".astro")) acc.push(full);
  }
  return acc;
}

const findings: Finding[] = [];
const files = walk(PAGES_DIR);

const layoutSource = readFileSync(LAYOUT_FILE, "utf8");
if (!layoutSource.includes(CANONICAL_CONTENT)) {
  findings.push({
    file: "packages/app/src/layouts/base-layout.astro",
    issue: `does not emit canonical viewport content "${CANONICAL_CONTENT}"`,
  });
}

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const rel = relative(ROOT, file);

  if (rel === "packages/app/src/pages/index.astro") continue;

  const importsBaseLayout = source.includes(
    'import BaseLayout from "~/layouts/base-layout.astro"',
  );

  if (!importsBaseLayout) {
    findings.push({
      file: rel,
      issue:
        "does not import BaseLayout (and does not declare the canonical viewport meta directly)",
    });
    continue;
  }
}

if (findings.length > 0) {
  console.error("Viewport meta audit FAILED:");
  for (const finding of findings) {
    console.error(`  - ${finding.file}: ${finding.issue}`);
  }
  process.exit(1);
}

console.log(
  `Viewport meta audit passed (${files.length} page(s) audited, canonical content "${CANONICAL_CONTENT}").`,
);
