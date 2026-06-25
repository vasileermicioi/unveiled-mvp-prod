import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  isForbiddenToken,
  isTwAnimateElementClass,
  normalizeUtilityString,
} from "../../scripts/semantic-class-utils.ts";

const REPO_ROOT = join(import.meta.dir, "../..");
const SCAN_ROOTS = [
  join(REPO_ROOT, "packages/app/src"),
  join(REPO_ROOT, "packages/landing/src"),
];

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
  "landing-page",
  "landing-section",
  "landing-footer-grid",
]);

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

function extractClassStrings(content: string): string[] {
  const found: string[] = [];
  const patterns = [
    /className="([^"]*)"/g,
    /className='([^']*)'/g,
    /class="([^"]*)"/g,
  ];
  for (const re of patterns) {
    for (const match of content.matchAll(re)) {
      found.push(match[1] ?? "");
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
      found.push(strMatch[2] ?? "");
    }
  }
  return found;
}

describe("app and landing forbid raw Tailwind utilities", () => {
  it("has no forbidden utility tokens in className strings", () => {
    const extensions = new Set([".tsx", ".astro", ".html"]);
    const violations: string[] = [];

    for (const root of SCAN_ROOTS) {
      for (const file of walk(root, extensions)) {
        const content = readFileSync(file, "utf8");
        const rel = relative(REPO_ROOT, file);
        for (const value of extractClassStrings(content)) {
          const normalized = normalizeUtilityString(value);
          if (!normalized) {
            continue;
          }
          for (const token of normalized.split(/\s+/).filter(Boolean)) {
            if (!isAllowedToken(token)) {
              violations.push(`${rel}: "${token}" in "${normalized}"`);
            }
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
