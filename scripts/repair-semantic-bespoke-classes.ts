#!/usr/bin/env bun
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { splitClassTokens } from "./semantic-class-utils.ts";

const REPO_ROOT = resolve(import.meta.dir, "..");
const GENERATED_CSS = join(
  REPO_ROOT,
  "packages/design-system/src/styles/semantic-generated.css",
);
const SCAN_ROOTS = [
  join(REPO_ROOT, "packages/app/src"),
  join(REPO_ROOT, "packages/landing/src"),
];

const bespokeByClass = new Map<string, string[]>();
const css = readFileSync(GENERATED_CSS, "utf8");

const repairedCss = css.replace(
  /\.(ui-[a-f0-9]{8})\s*\{\s*@apply\s+([^;]+);/g,
  (full, className: string, applyValue: string) => {
    const { bespoke, utilities } = splitClassTokens(applyValue);
    if (bespoke.length === 0) {
      return full;
    }
    bespokeByClass.set(className, bespoke);
    if (utilities.length === 0) {
      return `.${className} {\n    /* bespoke-only: ${bespoke.join(" ")} */\n  }`;
    }
    return `.${className} {\n    @apply ${utilities.join(" ")};`;
  },
);

writeFileSync(GENERATED_CSS, repairedCss, "utf8");

function prependBespoke(classValue: string, bespoke: string[]): string {
  const tokens = classValue.split(/\s+/).filter(Boolean);
  const missing = bespoke.filter((token) => !tokens.includes(token));
  if (missing.length === 0) {
    return classValue;
  }
  return [...missing, ...tokens].join(" ");
}

function patchContent(content: string): string {
  let next = content;
  for (const [className, bespoke] of bespokeByClass) {
    const combined = prependBespoke(className, bespoke);
    next = next.replaceAll(
      `className="${className}"`,
      `className="${combined}"`,
    );
    next = next.replaceAll(
      `className='${className}'`,
      `className='${combined}'`,
    );
    next = next.replaceAll(`class="${className}"`, `class="${combined}"`);
    next = next.replaceAll(`"${className}"`, `"${combined}"`);
  }
  return next;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (/\.(tsx|astro|html)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

let filesPatched = 0;
for (const root of SCAN_ROOTS) {
  for (const file of walk(root)) {
    const original = readFileSync(file, "utf8");
    const next = patchContent(original);
    if (next !== original) {
      writeFileSync(file, next, "utf8");
      filesPatched += 1;
    }
  }
}

console.log(
  `Repaired ${bespokeByClass.size} semantic classes in CSS; patched ${filesPatched} source files.`,
);
