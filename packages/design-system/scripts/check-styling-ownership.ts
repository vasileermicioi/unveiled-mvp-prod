#!/usr/bin/env bun
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import {
  isForbiddenToken,
  isTwAnimateElementClass,
  normalizeUtilityString,
} from "../../../scripts/semantic-class-utils.ts";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const APP_SRC = join(REPO_ROOT, "packages/app/src");
const LANDING_SRC = join(REPO_ROOT, "packages/landing/src");
const DESIGN_SYSTEM_STYLES = join(
  REPO_ROOT,
  "packages/design-system/src/styles",
);

const ALLOWED_LEGACY = new Set([
  "unveiled-border",
  "unveiled-border-lg",
  "unveiled-shadow",
  "unveiled-shadow-lg",
  "unveiled-card-hover",
  "unveiled-meta",
  "headline-xl",
  "headline-lg",
  "headline-md",
  "page-shell",
  "content-shell",
  "display-font",
  "grid-shell",
]);

const SEMANTIC_BASES = new Set([
  "app-page",
  "app-page-header",
  "app-page-toolbar",
  "form-shell",
  "auth-page",
  "auth-card",
  "auth-stack",
  "discover-layout",
  "discover-sidebar",
  "discover-main",
  "member-feed-list",
  "member-feed-row",
  "member-feed-empty",
  "admin-panel-grid",
  "admin-panel-section",
  "admin-panel-stats",
  "admin-panel-row",
  "admin-panel-table",
  "landing-page",
  "landing-section",
  "landing-footer-grid",
]);

interface Failure {
  rule: string;
  file: string;
  detail: string;
}

const failures: Failure[] = [];

function fail(rule: string, file: string, detail: string) {
  failures.push({ rule, file, detail });
}

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

function isAllowedToken(token: string): boolean {
  if (!token) {
    return true;
  }
  if (ALLOWED_LEGACY.has(token)) {
    return true;
  }
  if (SEMANTIC_BASES.has(token)) {
    return true;
  }
  if (/^ui-[a-f0-9]{8}$/.test(token)) {
    return true;
  }
  if (isTwAnimateElementClass(token)) {
    return true;
  }
  const modifierMatch =
    /^([\w-]+)--(interactive|loading|error|empty|success|disabled)$/.exec(
      token,
    );
  if (modifierMatch) {
    const base = modifierMatch[1] ?? "";
    return (
      SEMANTIC_BASES.has(base) ||
      /^ui-[a-f0-9]{8}$/.test(base) ||
      ALLOWED_LEGACY.has(base)
    );
  }
  return !isForbiddenToken(token);
}

function extractClassStrings(
  content: string,
): { value: string; index: number }[] {
  const found: { value: string; index: number }[] = [];
  const patterns = [
    /className="([^"]*)"/g,
    /className='([^']*)'/g,
    /class="([^"]*)"/g,
  ];
  for (const re of patterns) {
    for (const match of content.matchAll(re)) {
      found.push({ value: match[1] ?? "", index: match.index ?? 0 });
    }
  }
  for (const cnMatch of content.matchAll(/\bcn\s*\(/g)) {
    const openParen = (cnMatch.index ?? 0) + cnMatch[0].length - 1;
    let depth = 1;
    let i = openParen + 1;
    while (i < content.length && depth > 0) {
      const ch = content[i];
      if (ch === "(") {
        depth += 1;
      } else if (ch === ")") {
        depth -= 1;
      }
      i += 1;
    }
    const body = content.slice(openParen + 1, i - 1);
    for (const strMatch of body.matchAll(/(["'])((?:\\.|(?!\1).)*)\1/g)) {
      found.push({ value: strMatch[2] ?? "", index: cnMatch.index ?? 0 });
    }
  }
  return found;
}

function checkConsumerStyles(pkg: "app" | "landing") {
  const stylesDir = join(REPO_ROOT, `packages/${pkg}/src/styles`);
  const entries = readdirSync(stylesDir);
  for (const entry of entries) {
    if (entry !== "global.css") {
      fail(
        "R-CONSUMER-STYLES-ONLY-GLOBAL",
        join(stylesDir, entry),
        "consumer src/styles must contain only global.css",
      );
    }
  }
  const globalPath = join(stylesDir, "global.css");
  const globalCss = readFileSync(globalPath, "utf8").trim();
  const lines = globalCss
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (
    lines.length !== 1 ||
    lines[0] !== '@import "@unveiled/design-system/styles/global.css";'
  ) {
    fail(
      "R-CONSUMER-GLOBAL-IMPORT",
      globalPath,
      'global.css must contain only @import "@unveiled/design-system/styles/global.css";',
    );
  }
}

function checkReverseImports() {
  for (const file of walk(DESIGN_SYSTEM_STYLES, new Set([".css"]))) {
    const content = readFileSync(file, "utf8");
    if (/packages\/(app|landing)\//.test(content)) {
      fail(
        "R-NO-REVERSE-IMPORT",
        file,
        "design-system styles must not import from app or landing packages",
      );
    }
  }
}

function checkConsumerSource(root: string) {
  const extensions = new Set([".tsx", ".astro", ".html"]);
  for (const file of walk(root, extensions)) {
    const content = readFileSync(file, "utf8");
    const rel = relative(REPO_ROOT, file);
    for (const { value } of extractClassStrings(content)) {
      const normalized = normalizeUtilityString(value);
      if (!normalized) {
        continue;
      }
      const tokens = normalized.split(/\s+/).filter(Boolean);
      for (const token of tokens) {
        if (!isAllowedToken(token)) {
          fail(
            "R-NO-RAW-TAILWIND",
            rel,
            `forbidden utility token "${token}" in class string "${normalized}"`,
          );
        }
      }
    }
  }
}

function checkCnImportPath(root: string) {
  const extensions = new Set([".ts", ".tsx", ".astro"]);
  for (const file of walk(root, extensions)) {
    const content = readFileSync(file, "utf8");
    if (/from\s+["']@unveiled\/design-system\/lib\/utils["']/.test(content)) {
      const rel = relative(REPO_ROOT, file);
      fail(
        "R-CN-IMPORT-PATH",
        rel,
        'cn must be imported from "@unveiled/design-system", not "@unveiled/design-system/lib/utils"',
      );
    }
  }
}

function checkLandingNoLocalUi() {
  const extensions = new Set([".ts", ".tsx", ".astro"]);
  for (const file of walk(LANDING_SRC, extensions)) {
    const content = readFileSync(file, "utf8");
    if (/from\s+["'][^"']*components\/landing\//.test(content)) {
      const rel = relative(REPO_ROOT, file);
      fail(
        "R-LANDING-NO-LOCAL-UI",
        rel,
        'landing package must not import from "../components/landing/..."; import UI from "@unveiled/design-system" instead',
      );
    }
  }
}

checkConsumerStyles("app");
checkConsumerStyles("landing");
checkReverseImports();
checkConsumerSource(APP_SRC);
checkConsumerSource(LANDING_SRC);
checkCnImportPath(APP_SRC);
checkCnImportPath(LANDING_SRC);
checkLandingNoLocalUi();

if (import.meta.main) {
  if (failures.length > 0) {
    console.error("check:styling-ownership failed:\n");
    for (const failure of failures) {
      console.error(`  [${failure.rule}] ${failure.file}`);
      console.error(`    ${failure.detail}`);
    }
    process.exit(1);
  }

  console.log("check:styling-ownership passed");
}
