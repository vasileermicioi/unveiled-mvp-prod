import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const PRODUCTION_ENTRY_POINTS = [
  "packages/app/src/components/unveiled",
  "packages/app/src/components/payments",
  "packages/app/src/components/providers",
  "packages/app/src/pages",
  "packages/app/src/layouts",
  "packages/app/src/actions/index.ts",
  "packages/landing/src/components/unveiled",
  "packages/landing/src/components/payments",
  "packages/landing/src/components/providers",
  "packages/landing/src/pages",
  "packages/landing/src/layouts",
  "src/components/ui/button.tsx",
  "src/components/ui/unveiled-primitives.tsx",
  "src/components/ui/safe-image.tsx",
  "src/components/ui/modal.tsx",
  "src/components/ui/drawer.tsx",
  "src/components/ui/tabs.tsx",
  "src/components/ui/menu.tsx",
  "src/components/ui/toast.tsx",
];

const REPLICA_IMPORT_RE =
  /["']@\/components\/ui\/[^"']*-replica\/[^"']+["']|["']~\/components\/ui\/[^"']*-replica\/[^"']+["']|["']packages\/design-system\/src\/[^"']*-replica\/[^"']+["']|["']@unveiled\/design-system\/[^"']*-replica\/[^"']+["']/g;
const LOCAL_REPLICA_IMPORT_RE = /["']\.{1,2}\/[^"']*-replica\/[^"']+["']/g;

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
    let st: import("node:fs").Stats;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

describe("Ladle-only replica folders are unreachable from production", () => {
  const files = collectFiles(PRODUCTION_ENTRY_POINTS);

  it("has production entry points to scan", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    const rel = relative(".", file);
    it(`${rel} does not import a *-replica/ folder`, () => {
      const source = readFileSync(file, "utf8");
      const matches = [
        ...source.matchAll(REPLICA_IMPORT_RE),
        ...source.matchAll(LOCAL_REPLICA_IMPORT_RE),
      ];
      expect(matches).toEqual([]);
    });
  }
});
