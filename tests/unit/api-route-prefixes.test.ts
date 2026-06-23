import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROUTES_ROOT = "packages/api/src/routes";

interface ExtractedRoute {
  readonly file: string;
  readonly line: number;
  readonly path: string;
}

function listRouteFiles(dir: string, acc: string[] = []): string[] {
  const absolute = join(process.cwd(), dir);
  for (const entry of readdirSync(absolute)) {
    const entryPath = join(dir, entry);
    const absolutePath = join(absolute, entry);
    const stat = statSync(absolutePath);
    if (stat.isDirectory()) {
      listRouteFiles(entryPath, acc);
    } else if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
      acc.push(entryPath);
    }
  }
  return acc;
}

function extractPaths(source: string, filePath: string): ExtractedRoute[] {
  const matches: ExtractedRoute[] = [];
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i] ?? "";
    if (!lineText.includes("createRoute")) continue;
    let blockText = lineText;
    let blockStart = i;
    let braceDepth = 0;
    for (let j = i; j < lines.length && j < i + 80; j++) {
      const segment = lines[j] ?? "";
      blockText = j === i ? segment : `${blockText}\n${segment}`;
      for (const char of segment) {
        if (char === "{") braceDepth++;
        else if (char === "}") braceDepth--;
      }
      if (braceDepth > 0 && j > i) {
        blockStart = i;
      }
      if (braceDepth <= 0 && j > i) {
        break;
      }
    }
    const pathMatch = blockText.match(/path\s*:\s*"([^"]+)"/);
    if (!pathMatch) continue;
    const pathValue = pathMatch[1];
    if (!pathValue) continue;
    matches.push({
      file: filePath,
      line: blockStart + 1,
      path: pathValue,
    });
  }
  return matches;
}

function loadAllRoutes(): ExtractedRoute[] {
  const files = listRouteFiles(ROUTES_ROOT);
  const routes: ExtractedRoute[] = [];
  for (const file of files) {
    const source = readFileSync(join(process.cwd(), file), "utf8");
    routes.push(...extractPaths(source, file));
  }
  return routes;
}

describe("Hono route /api/ prefix discipline", () => {
  const routes = loadAllRoutes();

  it("discovers at least one route registered under packages/api/src/routes", () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  it("every createRoute({ path }) value begins with /api/", () => {
    const offenders = routes.filter((route) => !route.path.startsWith("/api/"));
    if (offenders.length > 0) {
      const summary = offenders
        .map((route) => `  - ${route.file}:${route.line}  path: ${route.path}`)
        .join("\n");
      throw new Error(
        `Found Hono routes registered without the /api/ prefix. The orchestrator forwards /api/* to the API Worker without stripping the prefix, so every route MUST be declared with the prefix intact:\n${summary}`,
      );
    }
    expect(offenders).toEqual([]);
  });

  it("the four system routes are registered at /api/health.json, /api/readiness.json, /api/openapi.yaml, and /api/openapi.json", () => {
    const systemFile = "packages/api/src/routes/system/index.ts";
    const systemRoutes = routes.filter((route) => route.file === systemFile);
    const allPaths = new Set(systemRoutes.map((route) => route.path));
    expect(allPaths.has("/api/health.json")).toBe(true);
    expect(allPaths.has("/api/readiness.json")).toBe(true);
    expect(allPaths.has("/api/openapi.yaml")).toBe(true);
    expect(allPaths.has("/api/openapi.json")).toBe(true);
  });
});
