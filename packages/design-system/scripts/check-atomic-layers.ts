#!/usr/bin/env bun
// Atomic-layers gate. Walks every `.tsx` under
// `packages/design-system/src/{atoms,molecules,organisms,layouts,pages}/`
// and asserts the per-layer rules codified by the design-system-atoms-layer
// OpenSpec change.
//
// Rules:
//   1. Atoms MAY import only from allowed sources (lib, react, @nextui-org/react,
//      tokens.css, relative paths within the same atom folder).
//      Atoms MUST NOT import from `./molecules/...`, `./organisms/...`,
//      `./layouts/...`, `./pages/...`, `./heroui-replica/...`, or any
//      non-HeroUI third-party UI library (`@radix-ui/*`, `@headlessui/*`,
//      `react-aria`, `@mui/*`, `@chakra-ui/*`).
//
//   2. Every atom `<atom>.tsx` MUST contain a `from "@nextui-org/react"`
//      import OR carry the `// @atoms-re-export` pass-through marker.
//
//   3. Molecules / organisms / layouts / pages MUST NOT import from
//      `@nextui-org/react` or `@heroui/*` directly. They consume atoms.
//
//   4. Every atom folder MUST contain a `<atom>.ladle.tsx` or
//      `<atom>.test.tsx` companion file.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const SRC_ROOT = join(REPO_ROOT, "packages/design-system/src");
const LAYERS = ["atoms", "molecules", "organisms", "layouts", "pages"] as const;

type Layer = (typeof LAYERS)[number];

const HEROUI_BASE_RE = /from\s+["'](@nextui-org\/react|@heroui\/[^"']+)["']/;
const FORBIDDEN_THIRD_PARTY_RE =
  /from\s+["'](@radix-ui\/[^"']+|@headlessui\/[^"']+|react-aria[^"']*|@mui\/[^"']+|@chakra-ui\/[^"']+)["']/;
const ATOMS_RE_EXPORT_MARKER = "// @atoms-re-export";

interface Failure {
  file: string;
  message: string;
}

const failures: Failure[] = [];

function fail(file: string, message: string) {
  failures.push({ file, message });
}

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

function listLayer(layer: Layer): string[] {
  return walk(join(SRC_ROOT, layer));
}

function extractImports(source: string): string[] {
  const lines = source.split(/\r?\n/);
  const imports: string[] = [];
  let inImportBlock = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("import ")) {
      inImportBlock = trimmed.includes("{");
      imports.push(trimmed);
      continue;
    }
    if (inImportBlock) {
      imports.push(trimmed);
      if (trimmed.includes("}")) inImportBlock = false;
    }
  }
  return imports;
}

function checkAtomsLayer(files: string[]) {
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const imports = extractImports(source);

    const forbiddenHigherLayer = imports.find((imp) =>
      /from\s+["']\.\.?\/(\.\.\/)?(molecules|organisms|layouts|pages)\//.test(
        imp,
      ),
    );
    if (forbiddenHigherLayer) {
      fail(file, `atoms file imports a higher layer: ${forbiddenHigherLayer}`);
    }

    const replicaImport = imports.find((imp) =>
      /from\s+["'][^"']*heroui-replica\//.test(imp),
    );
    if (replicaImport) {
      fail(file, `atoms file imports heroui-replica: ${replicaImport}`);
    }

    const forbiddenThirdParty = imports.find((imp) =>
      FORBIDDEN_THIRD_PARTY_RE.test(imp),
    );
    if (forbiddenThirdParty) {
      fail(
        file,
        `atoms file imports a non-HeroUI third-party UI library: ${forbiddenThirdParty}`,
      );
    }

    const hasHeroUI = HEROUI_BASE_RE.test(source);
    const hasReExportMarker = source.includes(ATOMS_RE_EXPORT_MARKER);
    if (!hasHeroUI && !hasReExportMarker) {
      fail(
        file,
        `atoms file MUST import from "@nextui-org/react" or carry the "// @atoms-re-export" pass-through marker`,
      );
    }
  }
}

function checkHigherLayersDoNotImportHeroUI(layer: Layer, files: string[]) {
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    if (HEROUI_BASE_RE.test(source)) {
      fail(
        file,
        `${layer} file MUST NOT import from "@nextui-org/react" or "@heroui/*" directly — consume atoms instead`,
      );
    }
  }
}

function checkCompanionFiles(atomFiles: string[]) {
  const atomRoots = new Set<string>();
  // Folders that look like atoms but are actually utility/shared files
  // (e.g. `backdrop/` is the shared Ladle story backdrop; `__overview__/`
  // is the atoms overview story). They do not need a `.ladle.tsx` or
  // `.test.tsx` companion.
  const EXCLUDED_ATOM_DIRS = new Set(["__overview__", "backdrop"]);
  for (const file of atomFiles) {
    const rel = relative(SRC_ROOT, file);
    const topDir = rel.split("/")[1];
    if (EXCLUDED_ATOM_DIRS.has(topDir)) continue;
    atomRoots.add(join(SRC_ROOT, rel.split("/").slice(0, 2).join("/")));
  }
  for (const root of atomRoots) {
    const files = readdirSync(root);
    const tsxFiles = files.filter((f) => f.endsWith(".tsx"));
    const hasMain = tsxFiles.includes(`${root.split("/").pop()}.tsx`);
    if (!hasMain) continue;
    const hasLadle = tsxFiles.some(
      (f) => f === `${root.split("/").pop()}.ladle.tsx`,
    );
    const hasTest = tsxFiles.some(
      (f) => f === `${root.split("/").pop()}.test.tsx`,
    );
    if (!hasLadle && !hasTest) {
      fail(
        root,
        `atom folder "${root.split("/").pop()}/" MUST have a sibling <atom>.ladle.tsx or <atom>.test.tsx companion`,
      );
    }
  }
}

function main() {
  const atoms = listLayer("atoms");
  const molecules = listLayer("molecules");
  const organisms = listLayer("organisms");
  const layouts = listLayer("layouts");
  const pages = listLayer("pages");

  checkAtomsLayer(atoms);
  checkHigherLayersDoNotImportHeroUI("molecules", molecules);
  checkHigherLayersDoNotImportHeroUI("organisms", organisms);
  checkHigherLayersDoNotImportHeroUI("layouts", layouts);
  checkHigherLayersDoNotImportHeroUI("pages", pages);
  checkCompanionFiles(atoms);

  if (failures.length === 0) {
    console.log(
      `[check:atomic-layers] OK — ${atoms.length} atom files, ${molecules.length} molecule files, ${organisms.length} organism files, ${layouts.length} layout files, ${pages.length} page files`,
    );
    process.exit(0);
  }
  console.error(`[check:atomic-layers] FAILED — ${failures.length} issue(s):`);
  for (const { file, message } of failures) {
    console.error(`  - ${relative(REPO_ROOT, file)}: ${message}`);
  }
  process.exit(1);
}

main();
