#!/usr/bin/env bun
// Atomic-layers gate. Walks every `.tsx` under
// `packages/design-system/src/{atoms,molecules,organisms,layouts,pages}/`
// and asserts the per-layer rules codified by the design-system-atoms-layer
// and design-system-molecules-layer OpenSpec changes.
//
// Rules:
//   1. Atoms MAY import only from allowed sources (lib, react, @nextui-org/react,
//      tokens.css, relative paths within the same atom folder).
//      Atoms MUST NOT import from `./molecules/...`, `./organisms/...`,
//      `./layouts/...`, `./pages/...`, `./heroui-replica/...`, or any
//      non-HeroUI third-party UI library (`@radix-ui/*`, `@headlessui/*`,
//      `react-aria`, `@mui/*`, `@chakra-ui/*`). The `./heroui-replica/...`
//      rule is a forward-looking guard — the directory was deleted in
//      change `retire-heroui-replica`; the regex still rejects any
//      re-introduction because the path is not on the atoms allow-list.
//
//   2. Every atom `<atom>.tsx` MUST contain a `from "@nextui-org/react"`
//      import OR carry the `// @atoms-re-export` pass-through marker.
//
//   3. Molecules / organisms / layouts / pages MUST NOT import from
//      `@nextui-org/react` or `@heroui/*` directly. They consume atoms.
//
//   4. Molecules MUST NOT import from sibling molecules, from
//      `./organisms/...`, `./layouts/...`, or `./pages/...`. Molecules
//      compose atoms; the atoms wrap HeroUI.
//
//   5. Molecules MUST NOT import from `lucide-react` (the design system
//      has no `Icon` molecule; consumers inline `<svg>` directly).
//
//   6. Every atom folder MUST contain a `<atom>.ladle.tsx` or
//      `<atom>.test.tsx` companion file. Every molecule folder MUST
//      contain a `<molecule>.ladle.tsx` or `<molecule>.test.tsx` companion
//      file.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const SRC_ROOT = join(REPO_ROOT, "packages/design-system/src");
const LAYERS = ["atoms", "molecules", "organisms", "layouts", "pages"] as const;

type Layer = (typeof LAYERS)[number];

const HEROUI_BASE_RE = /from\s+["'](@nextui-org\/react|@heroui\/[^"']+)["']/;
const FORBIDDEN_THIRD_PARTY_RE =
  /from\s+["'](@radix-ui\/[^"']+|@headlessui\/[^"']+|react-aria[^"']*|@mui\/[^"']+|@chakra-ui\/[^"']+)["']/;
const LUCIDE_RE = /from\s+["']lucide-react["']/;
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

function checkLayoutsLayer(files: string[]) {
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const imports = extractImports(source);

    const pageImport = imports.find((imp) =>
      /from\s+["'][^"']*\.\.?\/(\.\.\/)?pages\//.test(imp),
    );
    if (pageImport) {
      fail(
        file,
        `layouts file MUST NOT import from "./pages/..." — pages are Ladle demos only`,
      );
    }
  }
}

function checkPagesLayer(files: string[]) {
  const PAGE_FILE_RE = /\.page\.ladle\.tsx$/;
  const MOCK_IMPORT_RE = /from\s+["'][^"']*\.mock["']/;

  for (const file of files) {
    if (!PAGE_FILE_RE.test(file)) {
      fail(
        file,
        `pages file MUST end in ".page.ladle.tsx" — pages are Ladle demos only`,
      );
      continue;
    }

    const source = readFileSync(file, "utf8");
    const imports = extractImports(source);
    const hasMockImport = imports.some((imp) => MOCK_IMPORT_RE.test(imp));
    if (!hasMockImport) {
      fail(
        file,
        `pages file MUST import at least one "*.mock" helper — demo pages must use mock data`,
      );
    }
  }
}

function checkMoleculesLayer(files: string[]) {
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const imports = extractImports(source);

    const forbiddenMolecule = imports.find((imp) =>
      /from\s+["']\.\.\/molecules\//.test(imp),
    );
    if (forbiddenMolecule) {
      fail(
        file,
        `molecules file imports a sibling molecule: ${forbiddenMolecule}`,
      );
    }

    const forbiddenAboveLayer = imports.find((imp) =>
      /from\s+["']\.\.?\/(\.\.\/)?(organisms|layouts|pages)\//.test(imp),
    );
    if (forbiddenAboveLayer) {
      fail(
        file,
        `molecules file imports a higher layer: ${forbiddenAboveLayer}`,
      );
    }

    const lucide = imports.find((imp) => LUCIDE_RE.test(imp));
    if (lucide) {
      fail(
        file,
        `molecules file imports lucide-react — the design system has no Icon molecule; inline <svg> at the call site with a // source: lucide-static comment`,
      );
    }
  }
}

function checkCompanionFiles(
  layer: Layer,
  files: string[],
  excludedDirs: Set<string>,
) {
  const roots = new Set<string>();
  for (const file of files) {
    const rel = relative(SRC_ROOT, file);
    const topDir = rel.split("/")[1];
    if (excludedDirs.has(topDir)) continue;
    roots.add(join(SRC_ROOT, rel.split("/").slice(0, 2).join("/")));
  }
  for (const root of roots) {
    const entries = readdirSync(root);
    const tsxFiles = entries.filter((f) => f.endsWith(".tsx"));
    const folderName = root.split("/").pop() ?? "";
    const hasMain = tsxFiles.includes(`${folderName}.tsx`);
    if (!hasMain) continue;
    const hasLadle = tsxFiles.some((f) => f === `${folderName}.ladle.tsx`);
    const hasTest = tsxFiles.some((f) => f === `${folderName}.test.tsx`);
    if (!hasLadle && !hasTest) {
      fail(
        root,
        `${layer} folder "${folderName}/" MUST have a sibling <${folderName}>.ladle.tsx or <${folderName}>.test.tsx companion`,
      );
    }
  }
}

function checkOrganismsLayer(files: string[]) {
  const DOMAIN_DIRS = new Set([
    "_shared",
    "shell",
    "auth",
    "discovery",
    "members",
    "bookings",
    "admin",
    "partner-portal",
    "payments",
    "landing",
  ]);
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const imports = extractImports(source);

    const lucide = imports.find((imp) => LUCIDE_RE.test(imp));
    if (lucide) {
      fail(
        file,
        `organisms file imports lucide-react — the design system has no Icon molecule; inline <svg> at the call site with a // source: lucide-static comment`,
      );
    }

    const rel = relative(SRC_ROOT, file);
    const parts = rel.split("/");
    const currentDomain = parts[1] === "_shared" ? "_shared" : parts[1];
    const crossDomain = imports.find((imp) => {
      const match = imp.match(
        /from\s+["']\.\.\/\.\.\/(?:organisms\/)?([^"']+)(\/[^"']*)?["']/,
      );
      if (!match) return false;
      const target = match[1];
      if (!target || !DOMAIN_DIRS.has(target)) return false;
      return target !== currentDomain;
    });
    if (crossDomain) {
      fail(
        file,
        `organisms file imports across domain boundaries (${currentDomain} → ${crossDomain}); cross-domain pieces MUST live in _shared/`,
      );
    }
  }
}

const EXCLUDED_ATOM_DIRS = new Set(["__overview__", "backdrop"]);
const EXCLUDED_MOLECULE_DIRS = new Set(["__overview__"]);
const EXCLUDED_ORGANISM_DIRS = new Set(["__overview__"]);

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
  checkLayoutsLayer(layouts);
  checkPagesLayer(pages);
  checkMoleculesLayer(molecules);
  checkOrganismsLayer(organisms);
  checkCompanionFiles("atoms", atoms, EXCLUDED_ATOM_DIRS);
  checkCompanionFiles("molecules", molecules, EXCLUDED_MOLECULE_DIRS);
  checkCompanionFiles("organisms", organisms, EXCLUDED_ORGANISM_DIRS);

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
