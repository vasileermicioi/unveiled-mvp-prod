#!/usr/bin/env bun
// @ladle-only
// HeroUI design-system replica gate. Asserts co-location, theme coverage
// (sourced from the production module), no new hex literals, overview
// completeness, and import isolation.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const REPLICA_DIR = join(
  REPO_ROOT,
  "packages/design-system/src/heroui-replica",
);
const THEME_PATH = join(
  REPO_ROOT,
  "packages/design-system/src/lib/heroui-theme.ts",
);
const PRODUCTION_ROOTS = [
  join(REPO_ROOT, "packages/design-system/src"),
  join(REPO_ROOT, "packages/app/src"),
  join(REPO_ROOT, "packages/landing/src"),
  join(REPO_ROOT, "src/components"),
  join(REPO_ROOT, "src/pages"),
  join(REPO_ROOT, "src/layouts"),
  join(REPO_ROOT, "src/actions"),
];
const REPLICA_IMPORT_RE =
  /["']packages\/design-system\/src\/heroui-replica\/[^"']+["']|["']@unveiled\/design-system\/heroui-replica\/[^"']+["']|["']@\/components\/ui\/heroui-replica\/[^"']+["']/g;
const LOCAL_REPLICA_IMPORT_RE =
  /["']\.\/heroui-replica\/[^"']+["']|["']\.\.\/heroui-replica\/[^"']+["']/g;
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
const TOKEN_IMPORT_RE =
  /from\s+["']@\/lib\/design-tokens["']|from\s+["']\.\.\/lib\/design-tokens["']|from\s+["']\.\.\/\.\.\/lib\/design-tokens["']|from\s+["']@unveiled\/design-system\/lib\/design-tokens["']/;

interface Failure {
  message: string;
}

const failures: Failure[] = [];

function fail(message: string) {
  failures.push({ message });
}

function walk(root: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(root);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(root, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, out);
    } else if (/\.(ts|tsx|astro|mjs|js)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function checkLadleOnlyHeaders() {
  const files: string[] = [];
  for (const entry of readdirSync(REPLICA_DIR)) {
    const full = join(REPLICA_DIR, entry);
    if (statSync(full).isFile() && /\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const trimmed = source.trimStart();
    if (!trimmed.startsWith("// @ladle-only")) {
      fail(`${relative(".", file)} is missing // @ladle-only header`);
    }
  }
}

function checkProductionImports() {
  for (const root of PRODUCTION_ROOTS) {
    const files = walk(resolve(root));
    for (const file of files) {
      if (file.includes("/heroui-replica/")) continue;
      const source = readFileSync(file, "utf8");
      const matches = [
        ...source.matchAll(REPLICA_IMPORT_RE),
        ...source.matchAll(LOCAL_REPLICA_IMPORT_RE),
      ];
      for (const match of matches) {
        fail(`${relative(".", file)} imports heroui-replica: ${match[0]}`);
      }
    }
  }
}

function checkHexLiterals() {
  const files: string[] = [];
  for (const entry of readdirSync(REPLICA_DIR)) {
    const full = join(REPLICA_DIR, entry);
    if (statSync(full).isFile() && /\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    if (HEX_RE.test(source) && !TOKEN_IMPORT_RE.test(source)) {
      fail(
        `${relative(".", file)} contains hex literal(s) but does not import from @/lib/design-tokens`,
      );
    }
  }
}

function checkThemeCoverage() {
  const source = readFileSync(THEME_PATH, "utf8");
  const requiredColors = [
    "yellow",
    "cream",
    "grey",
    "dark",
    "white",
    "error",
    "success",
  ];
  for (const color of requiredColors) {
    if (!source.includes(color)) {
      fail(`theme.ts is missing color entry: ${color}`);
    }
  }
  const requiredCategories = [
    "typography",
    "radius",
    "border",
    "shadow",
    "motion",
  ];
  for (const category of requiredCategories) {
    if (!source.includes(category)) {
      fail(`theme.ts is missing token category: ${category}`);
    }
  }
}

function checkOverview() {
  const overviewPath = join(REPLICA_DIR, "design-system-overview.ladle.tsx");
  try {
    statSync(overviewPath);
  } catch {
    fail("design-system-overview.ladle.tsx is missing");
    return;
  }
  const source = readFileSync(overviewPath, "utf8");
  if (!source.includes("<main") && !source.includes('role="main"')) {
    fail("design-system-overview.ladle.tsx is missing main role=main");
  }
  if (!source.includes("Unveiled Design System (HeroUI)")) {
    fail("design-system-overview.ladle.tsx is missing exact h1 text");
  }
  if (!source.includes("<nav")) {
    fail("design-system-overview.ladle.tsx is missing nav element");
  }

  const wrapperFiles = readdirSync(REPLICA_DIR).filter(
    (f) =>
      f.startsWith("Hero") &&
      f.endsWith(".tsx") &&
      !f.endsWith(".ladle.tsx") &&
      f !== "provider.tsx" &&
      f !== "story-backdrop.tsx" &&
      f !== "index.ts",
  );
  for (const wrapper of wrapperFiles) {
    const name = wrapper.replace(/\.tsx$/, "");
    if (!source.includes(name)) {
      fail(`design-system-overview.ladle.tsx omits ${name}`);
    }
  }
}

function checkColocatedStories() {
  const wrapperFiles = readdirSync(REPLICA_DIR).filter(
    (f) =>
      f.startsWith("Hero") &&
      f.endsWith(".tsx") &&
      !f.endsWith(".ladle.tsx") &&
      f !== "provider.tsx" &&
      f !== "story-backdrop.tsx" &&
      f !== "index.ts",
  );
  for (const wrapper of wrapperFiles) {
    const storyName = wrapper.replace(/\.tsx$/, ".ladle.tsx");
    const storyPath = join(REPLICA_DIR, storyName);
    try {
      statSync(storyPath);
    } catch {
      fail(`${wrapper} is missing co-located story ${storyName}`);
    }
  }
}

function main() {
  checkLadleOnlyHeaders();
  checkProductionImports();
  checkHexLiterals();
  checkThemeCoverage();
  checkOverview();
  checkColocatedStories();

  if (failures.length === 0) {
    console.log("[heroui-design-system-replica:check] OK");
    process.exit(0);
  }
  console.error(
    `[heroui-design-system-replica:check] FAILED — ${failures.length} issue(s):`,
  );
  for (const { message } of failures) {
    console.error(`  - ${message}`);
  }
  process.exit(1);
}

main();
