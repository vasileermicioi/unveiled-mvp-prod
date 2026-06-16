/**
 * Drift check: regenerates the design tokens output and compares against the committed files.
 *
 * Exits non-zero if either src/styles/generated/tokens.css or src/lib/design-tokens.types.ts
 * is out of sync with design-tokens.json. Wired into `bun run check`.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "..");
const TARGETS = [
  join(REPO_ROOT, "src/styles/generated/tokens.css"),
  join(REPO_ROOT, "src/lib/design-tokens.types.ts"),
];

function regen(): string {
  const result = spawnSync(
    "bun",
    ["run", "scripts/generate-design-tokens.ts"],
    {
      cwd: REPO_ROOT,
      encoding: "utf8",
    },
  );
  if (result.status !== 0) {
    process.stderr.write(result.stderr ?? "");
    throw new Error("tokens:gen failed; cannot perform drift check");
  }
  return result.stdout ?? "";
}

function readTargets(): Map<string, string> {
  const out = new Map<string, string>();
  for (const path of TARGETS) {
    out.set(path, readFileSync(path, "utf8"));
  }
  return out;
}

function main(): void {
  const before = readTargets();
  regen();
  const after = readTargets();
  const drifted: string[] = [];
  for (const [path, beforeContent] of before) {
    const afterContent = after.get(path);
    if (afterContent !== beforeContent) {
      drifted.push(path);
    }
  }
  if (drifted.length > 0) {
    process.stderr.write(
      "\nDesign tokens drift detected. The following committed files are out of sync with design-tokens.json:\n",
    );
    for (const path of drifted) {
      process.stderr.write(`  - ${path}\n`);
    }
    process.stderr.write(
      "\nRun `bun run tokens:gen` and commit the updated generated files.\n",
    );
    process.exit(1);
  }
  console.log("Design tokens are in sync.");
}

main();
