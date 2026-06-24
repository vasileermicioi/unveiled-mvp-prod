import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dir, "..", "..");
const LEGACY_LADLE = join(REPO_ROOT, ".ladle");
const LEGACY_LADLE_CONFIG = join(LEGACY_LADLE, "config.mjs");

const SKIP_DIRS = new Set(["node_modules", "dist", ".astro", ".data"]);

function walk(root: string, ext: RegExp, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(root);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(root, entry);
    if (statSync(full).isDirectory()) {
      walk(full, ext, out);
    } else if (ext.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

describe("legacy root .ladle/ folder is gone", () => {
  it(".ladle/config.mjs does not exist at the repo root", () => {
    expect(existsSync(LEGACY_LADLE_CONFIG)).toBe(false);
  });

  it("no .ladle directory exists at the repo root", () => {
    expect(existsSync(LEGACY_LADLE)).toBe(false);
  });

  it("no workspace file references the legacy config path", () => {
    const offenders: string[] = [];
    const searchRoots = ["packages", "scripts", "tests"];
    for (const root of searchRoots) {
      const abs = join(REPO_ROOT, root);
      for (const file of walk(abs, /\.(ts|tsx|js|mjs)$/)) {
        if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) continue;
        const source = readFileSync(file, "utf8");
        if (source.includes(".ladle/config.mjs")) {
          offenders.push(file);
        }
      }
    }
    if (offenders.length > 0) {
      throw new Error(
        `Found references to the legacy .ladle/config.mjs path:\n${offenders.join("\n")}`,
      );
    }
    expect(offenders).toEqual([]);
  });

  it("no root package.json or workspace package.json references the legacy config path", () => {
    const offenders: string[] = [];
    const jsonFiles: string[] = [
      join(REPO_ROOT, "package.json"),
      ...walk(join(REPO_ROOT, "packages"), /^package\.json$/),
    ];
    for (const file of jsonFiles) {
      const source = readFileSync(file, "utf8");
      if (source.includes(".ladle/config.mjs")) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });
});
