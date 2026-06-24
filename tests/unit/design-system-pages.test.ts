import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "../..");
const PAGES_DIR = join(REPO_ROOT, "packages/design-system/src/pages");

const PAGE_FILE_RE = /\.page\.ladle\.tsx$/;
const MOCK_IMPORT_RE = /from\s+["'][^"']*\.mock["']/;

function walk(dir: string, out: string[] = []): string[] {
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
      walk(full, out);
    } else if (entry.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

function listPageFiles(): string[] {
  return walk(PAGES_DIR);
}

describe("design-system pages folder", () => {
  const files = listPageFiles();

  it("contains only Ladle-only page files", () => {
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const relative = file.replace(`${PAGES_DIR}/`, "");
      expect(
        PAGE_FILE_RE.test(file),
        `${relative} MUST end in ".page.ladle.tsx"`,
      ).toBe(true);
    }
  });

  it("every page imports a mock fixture", () => {
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      const relative = file.replace(`${PAGES_DIR}/`, "");
      expect(
        MOCK_IMPORT_RE.test(source),
        `${relative} MUST import at least one "*.mock" helper`,
      ).toBe(true);
    }
  });
});
