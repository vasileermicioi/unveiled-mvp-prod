// @ladle-only
import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const _REPLICA_DIR = resolve("src/components/ui/heroui-replica");
const ENTRY_POINTS = [
  "src/pages",
  "src/layouts",
  "src/actions/index.ts",
  "src/components/ui/button.tsx",
  "src/components/ui/unveiled-primitives.tsx",
  "src/components/ui/safe-image.tsx",
];

const REPLICA_IMPORT_RE = /["']@\/components\/ui\/heroui-replica\/[^"']+["']/g;
const LOCAL_REPLICA_IMPORT_RE =
  /["']\.\/heroui-replica\/[^"']+["']|\.\.\/heroui-replica\/[^"']+["']/g;

function walk(root: string, out: string[] = []): string[] {
  const entries = readdirSync(root);
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

function collectFiles(paths: string[]): string[] {
  const out: string[] = [];
  for (const p of paths) {
    const full = resolve(p);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

describe("heroui-replica is unreachable from production", () => {
  const files = collectFiles(ENTRY_POINTS);

  it("has production entry points to scan", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    const rel = relative(".", file);
    it(`${rel} does not import heroui-replica`, () => {
      const source = readFileSync(file, "utf8");
      const matches = [
        ...source.matchAll(REPLICA_IMPORT_RE),
        ...source.matchAll(LOCAL_REPLICA_IMPORT_RE),
      ];
      expect(matches).toEqual([]);
    });
  }
});
