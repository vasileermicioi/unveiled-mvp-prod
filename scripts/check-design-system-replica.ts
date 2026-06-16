#!/usr/bin/env bun
/**
 * Design-system replica check.
 *
 * Asserts:
 *   1. Every `Mantine<Name>.tsx` in `src/components/ui/mantine-replica/`
 *      has a co-located `Mantine<Name>.ladle.tsx` file.
 *   2. Every `Mantine<Name>.tsx` has a `// @ladle-only` header on its
 *      first non-blank line.
 *   3. No file under `src/components/ui/mantine-replica/` introduces
 *      a new hex literal (`/#[0-9a-fA-F]{3,8}\b/`). The replica must
 *      read brand colors from `design-tokens.json` exclusively.
 *   4. `theme.ts` registers a `theme.components` override for every
 *      required primitive (Button, Badge, TextInput, Textarea, Select,
 *      Card, Paper, Divider, Modal, Drawer, Popover, Tabs, Menu,
 *      Notification) and a `theme.colors` entry for every brand color
 *      (yellow, cream, grey, dark, white, error, success).
 *   5. Every `Mantine<Name>.tsx` appears (by exported name) in
 *      `design-system-overview.ladle.tsx` so the visual contract is
 *      exhaustive.
 *   6. `INVENTORY.md` lists every primitive in `src/components/ui/`
 *      outside the replica folder.
 *
 * Exits non-zero on any failure. Wired into `bun run check:replica`
 * and CI.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const REPLICA_DIR = "src/components/ui/mantine-replica";
const UI_DIR = "src/components/ui";
const INVENTORY_PATH =
  ".development-plan/10-iteration/features/improvements/mantine-design-system-replica/INVENTORY.md";
const OVERVIEW_PATH =
  "src/components/ui/mantine-replica/design-system-overview.ladle.tsx";
const THEME_PATH = "src/components/ui/mantine-replica/theme.ts";
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
const REPLICA_FILE_RE = /^Mantine[A-Z][A-Za-z0-9]*\.tsx$/;
const REPLICA_LADLE_RE = /^Mantine[A-Z][A-Za-z0-9]*\.ladle\.tsx$/;
const REQUIRED_THEME_PRIMITIVES = [
  "Button",
  "Badge",
  "TextInput",
  "Textarea",
  "Select",
  "Card",
  "Paper",
  "Divider",
  "Modal",
  "Drawer",
  "Popover",
  "Tabs",
  "Menu",
  "Notification",
];
const REQUIRED_THEME_COLORS = [
  "brandYellow",
  "brandCream",
  "brandGrey",
  "brandDark",
  "brandWhite",
  "brandError",
  "brandSuccess",
];

interface Failure {
  message: string;
}

const failures: Failure[] = [];

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function listReplicaFiles(): string[] {
  return readdirSync(REPLICA_DIR).filter((entry) => entry.endsWith(".tsx"));
}

function listPrimitiveFiles(): string[] {
  return readdirSync(UI_DIR)
    .filter((entry) => entry.endsWith(".tsx"))
    .filter((entry) => !entry.includes("mantine-replica"))
    .filter((entry) => !entry.endsWith(".test.tsx"));
}

function pushFailure(message: string): void {
  failures.push({ message });
}

function checkLadleOnlyHeader(file: string): void {
  const source = read(join(REPLICA_DIR, file));
  const firstNonBlank = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  if (firstNonBlank !== "// @ladle-only") {
    pushFailure(
      `${REPLICA_DIR}/${file}: missing "// @ladle-only" header (first non-blank line: ${firstNonBlank ?? "<empty>"})`,
    );
  }
}

function checkCoLocation(replicaFiles: string[]): void {
  for (const file of replicaFiles) {
    if (file === "design-system-overview.ladle.tsx") continue;
    if (REPLICA_LADLE_RE.test(file)) continue;
    if (REPLICA_FILE_RE.test(file)) {
      const ladle = file.replace(/\.tsx$/, ".ladle.tsx");
      if (!replicaFiles.includes(ladle)) {
        pushFailure(`${REPLICA_DIR}/${file}: expected co-located ${ladle}`);
      }
    }
  }
}

function checkNoHexLiterals(replicaFiles: string[]): void {
  for (const file of replicaFiles) {
    const source = read(join(REPLICA_DIR, file));
    const matches = source.match(HEX_RE);
    if (matches && matches.length > 0) {
      pushFailure(
        `${REPLICA_DIR}/${file}: introduces hex literal(s) ${matches.join(", ")} — replica must read from design-tokens.json`,
      );
    }
  }
}

function checkTheme(): void {
  if (!exists(THEME_PATH)) {
    pushFailure(`${THEME_PATH}: missing`);
    return;
  }
  const source = read(THEME_PATH);
  for (const primitive of REQUIRED_THEME_PRIMITIVES) {
    const re = new RegExp(`\\b${primitive}\\s*:`);
    if (!re.test(source)) {
      pushFailure(
        `${THEME_PATH}: missing theme.components override for ${primitive}`,
      );
    }
  }
  for (const color of REQUIRED_THEME_COLORS) {
    const re = new RegExp(`\\b${color}\\b`);
    if (!re.test(source)) {
      pushFailure(`${THEME_PATH}: missing theme.colors entry for ${color}`);
    }
  }
}

function checkOverview(replicaFiles: string[]): void {
  if (!exists(OVERVIEW_PATH)) {
    pushFailure(`${OVERVIEW_PATH}: missing`);
    return;
  }
  const source = read(OVERVIEW_PATH);
  const components = replicaFiles
    .filter((file) => REPLICA_FILE_RE.test(file))
    .map((file) => file.replace(/\.tsx$/, ""))
    .filter((name) => name !== "MantineReplicaProvider");
  for (const name of components) {
    if (!source.includes(name)) {
      pushFailure(
        `${OVERVIEW_PATH}: does not render ${name}; the visual contract is incomplete`,
      );
    }
  }
  if (!/<main[^>]*\brole="main"[\s>]/.test(source)) {
    pushFailure(`${OVERVIEW_PATH}: missing <main role="main"> landmark`);
  }
  if (
    !/<h1[^>]*>\s*Unveiled Design System \(Mantine replica\)\s*<\/h1>/.test(
      source,
    )
  ) {
    pushFailure(
      `${OVERVIEW_PATH}: missing <h1> heading "Unveiled Design System (Mantine replica)"`,
    );
  }
  if (!/<nav[\s>]/.test(source)) {
    pushFailure(`${OVERVIEW_PATH}: missing <nav> element`);
  }
  const navMatch = source.match(/<nav[\s\S]*?<\/nav>/);
  if (navMatch && !/href=\{?["'`][^"'`]*#/.test(navMatch[0])) {
    pushFailure(`${OVERVIEW_PATH}: <nav> element has no anchor links`);
  }
}

function checkInventory(): void {
  if (!exists(INVENTORY_PATH)) {
    pushFailure(`${INVENTORY_PATH}: missing`);
    return;
  }
  const inventory = read(INVENTORY_PATH);
  const primitives = listPrimitiveFiles();
  for (const primitive of primitives) {
    if (!inventory.includes(primitive)) {
      pushFailure(`${INVENTORY_PATH}: missing row for ${UI_DIR}/${primitive}`);
    }
  }
}

function exists(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function main(): void {
  const replicaFiles = listReplicaFiles();
  if (replicaFiles.length === 0) {
    pushFailure(`${REPLICA_DIR}: no .tsx files found`);
    console.error(
      "[design-system-replica:check] FAILED — replica folder is empty",
    );
    process.exit(1);
  }
  for (const file of replicaFiles) {
    checkLadleOnlyHeader(file);
  }
  checkCoLocation(replicaFiles);
  checkNoHexLiterals(replicaFiles);
  checkTheme();
  checkOverview(replicaFiles);
  checkInventory();

  if (failures.length > 0) {
    console.error(
      `[design-system-replica:check] FAILED — ${failures.length} drift item(s):`,
    );
    for (const failure of failures) {
      console.error(`  - ${failure.message}`);
    }
    process.exit(1);
  }
  const storyCount = replicaFiles.filter((file) =>
    file.endsWith(".ladle.tsx"),
  ).length;
  console.log(
    `[design-system-replica:check] OK — ${replicaFiles.length} replica files, ${storyCount} story files`,
  );
}

main();
