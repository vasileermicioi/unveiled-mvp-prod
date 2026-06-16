/**
 * Asserts that no production file reaches a module under
 * `src/components/ui/mantine-replica/`. The replica is a Ladle-only
 * proof; if any file under `src/components/`, `src/pages/`, or
 * `src/layouts/` (outside the replica folder) imports from it, the
 * test fails.
 *
 * The test walks the import graph from every production entry point
 * (Astro pages, React components, layouts) and asserts the replica
 * folder is never reached.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";

const REPLICA_DIR = "src/components/ui/mantine-replica";
const PRODUCTION_ROOTS = ["src/components", "src/pages", "src/layouts"];
const SCAN_EXTS = new Set([".ts", ".tsx", ".astro"]);
const SKIP_DIRS = new Set(["node_modules", "dist", ".astro", ".wrangler"]);

interface ImportEdge {
  from: string;
  to: string;
  specifier: string;
}

function walk(root: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(root);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(root, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, out);
    } else if (SCAN_EXTS.has(extname(full))) {
      out.push(full);
    }
  }
  return out;
}

function normalizeSpecifier(from: string, specifier: string): string | null {
  if (!specifier.startsWith(".")) return null;
  const dir = from.split(sep).slice(0, -1).join(sep);
  const resolved = join(dir, specifier);
  return relative(".", resolved).split(sep).join("/");
}

function collectImports(): ImportEdge[] {
  const edges: ImportEdge[] = [];
  for (const root of PRODUCTION_ROOTS) {
    for (const file of walk(root)) {
      if (file.includes(`${sep}mantine-replica${sep}`)) continue;
      const source = readFileSync(file, "utf8");
      const re =
        /(?:import\s+(?:[^"';]+?\s+from\s+)?|import\(|require\(|from\s+)(["'])([^"']+)\1/g;
      let match: RegExpExecArray | null;
      while (true) {
        match = re.exec(source);
        if (!match) break;
        const specifier = match[2];
        const resolved = normalizeSpecifier(file, specifier);
        if (!resolved) continue;
        edges.push({ from: file, to: resolved, specifier });
      }
    }
  }
  return edges;
}

function expandToFile(path: string): string {
  if (
    path.endsWith(".ts") ||
    path.endsWith(".tsx") ||
    path.endsWith(".astro")
  ) {
    return path;
  }
  for (const ext of [".ts", ".tsx", "/index.ts", "/index.tsx"]) {
    try {
      if (statSync(path + ext).isFile()) return path + ext;
    } catch {
      // continue
    }
  }
  return path;
}

function findReplicaLeaks(): Array<{ from: string; to: string }> {
  const edges = collectImports();
  const reached = new Set<string>();
  const queue: string[] = [...edges.map((edge) => edge.to)];
  while (queue.length > 0) {
    const current = queue.shift() as string;
    if (reached.has(current)) continue;
    reached.add(current);
    const file = expandToFile(current);
    if (file.startsWith(REPLICA_DIR)) {
      const original = edges.find((edge) => edge.to === current);
      return [
        {
          from: original?.from ?? "<entry>",
          to: file,
        },
      ];
    }
    let source: string;
    try {
      source = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const re =
      /(?:import\s+(?:[^"';]+?\s+from\s+)?|import\(|require\(|from\s+)(["'])([^"']+)\1/g;
    let match: RegExpExecArray | null;
    while (true) {
      match = re.exec(source);
      if (!match) break;
      const specifier = match[2];
      const resolved = normalizeSpecifier(file, specifier);
      if (!resolved) continue;
      queue.push(resolved);
    }
  }
  return [];
}

function main(): void {
  const leaks = findReplicaLeaks();
  if (leaks.length > 0) {
    console.error(
      "[replica-not-imported] FAILED — the Mantine replica is reachable from production:",
    );
    for (const leak of leaks) {
      console.error(`  - ${leak.from} -> ${leak.to}`);
    }
    process.exit(1);
  }
  console.log(
    "[replica-not-imported] OK — no production file imports the Mantine replica",
  );
}

main();
