#!/usr/bin/env bun
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { appCopy } from "@unveiled/api/i18n";

const REPO_ROOT = resolve(import.meta.dir, "..");
const SCAN_ROOTS = [
  join(REPO_ROOT, "packages", "app", "src"),
  join(REPO_ROOT, "packages", "landing", "src"),
];
const EXCLUDED_DIRS = new Set([
  "node_modules",
  ".git",
  ".ladle",
  "dist",
  ".astro",
  ".next",
  ".data",
  ".wrangler",
]);
const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".astro"]);
const COPYFOR_PATTERN = /copyFor\(\s*[^)]+\s*\)\.([a-zA-Z_][a-zA-Z0-9_.]*)/g;

export type Reference = { path: string; file: string; line: number };

export type PathBucket = { leaves: Set<string>; branches: Set<string> };

export function isLeaf(value: unknown): value is string {
  return typeof value === "string";
}

export function collectAllPaths(
  node: unknown,
  prefix: string,
  out: PathBucket,
): void {
  if (isLeaf(node)) {
    out.leaves.add(prefix);
    return;
  }
  if (node && typeof node === "object") {
    if (prefix) out.branches.add(prefix);
    for (const [key, child] of Object.entries(node)) {
      const next = prefix ? `${prefix}.${key}` : key;
      collectAllPaths(child, next, out);
    }
  }
}

export function collectDefinedPaths(
  source: Record<string, unknown> = appCopy as unknown as Record<
    string,
    unknown
  >,
): Map<string, PathBucket> {
  const defined = new Map<string, PathBucket>();
  for (const lang of ["DE", "EN"] as const) {
    const bucket: PathBucket = { leaves: new Set(), branches: new Set() };
    collectAllPaths(source[lang], "", bucket);
    defined.set(lang, bucket);
  }
  return defined;
}

export function walk(dir: string, out: string[] = []): string[] {
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let st: ReturnType<typeof statSync>;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry)) continue;
      walk(full, out);
    } else if (SCAN_EXTENSIONS.has(extname(entry))) {
      out.push(full);
    }
  }
  return out;
}

export function collectReferences(
  roots: string[] = SCAN_ROOTS,
  repoRoot: string = REPO_ROOT,
): Reference[] {
  const files: string[] = [];
  for (const root of roots) {
    walk(root, files);
  }
  const references: Reference[] = [];
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const lines = source.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const match of line.matchAll(COPYFOR_PATTERN)) {
        references.push({
          path: match[1],
          file: relative(repoRoot, file),
          line: i + 1,
        });
      }
    }
  }
  return references;
}

export type CoverageResult = {
  failures: string[];
  leafCount: number;
  referencedPathCount: number;
};

export function evaluateCoverage(
  defined: Map<string, PathBucket>,
  references: Reference[],
): CoverageResult {
  const grouped = new Map<string, Reference[]>();
  for (const ref of references) {
    const bucket = grouped.get(ref.path);
    if (bucket) {
      bucket.push(ref);
    } else {
      grouped.set(ref.path, [ref]);
    }
  }

  const failures: string[] = [];
  let leafCount = 0;
  for (const [path, refs] of grouped) {
    const isKnown = (lang: "DE" | "EN") => {
      const bucket = defined.get(lang);
      if (!bucket) return false;
      return bucket.leaves.has(path) || bucket.branches.has(path);
    };
    if (isKnown("DE") && isKnown("EN")) {
      const deBucket = defined.get("DE");
      if (deBucket?.leaves.has(path)) leafCount += 1;
      continue;
    }
    for (const lang of ["DE", "EN"] as const) {
      if (!isKnown(lang)) {
        const sample = refs[0];
        const otherRefs = refs
          .slice(1)
          .map((r) => `    referenced by ${r.file}:${r.line}`)
          .join("\n");
        failures.push(
          `i18n.coverage: missing key '${path}' in ${lang} (referenced by ${sample.file}:${sample.line})${otherRefs ? `\n${otherRefs}` : ""}`,
        );
      }
    }
  }

  return { failures, leafCount, referencedPathCount: grouped.size };
}

export function main(): number {
  const defined = collectDefinedPaths();
  const references = collectReferences();
  const result = evaluateCoverage(defined, references);

  if (result.failures.length > 0) {
    process.stderr.write(
      `${result.failures.join("\n")}\ni18n.coverage: ${result.failures.length} missing-key ${result.failures.length === 1 ? "issue" : "issues"} across ${result.referencedPathCount} referenced paths.\n`,
    );
    return 1;
  }

  process.stdout.write(
    `i18n.coverage: ok — ${result.leafCount} leaf path${result.leafCount === 1 ? "" : "s"} present in both DE and EN.\n`,
  );
  return 0;
}

if (import.meta.main) {
  process.exit(main());
}
