import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";

import {
  DOMAIN_TAGS,
  ROLE_TAGS,
  SPEC_TAGS,
  SURFACE_TAGS,
} from "@/lib/architecture/tags";

const REPO_ROOT = resolve(__dirname, "..", "..");
const MODEL_DIR = join(REPO_ROOT, "architecture");
const LIKEC4_BIN = resolve(REPO_ROOT, "node_modules", ".bin", "likec4");

interface LikeC4Element {
  id: string;
  kind?: string;
  title?: string;
  tags?: string[];
  shape?: string;
  children?: LikeC4Element[];
  metadata?: Record<string, string | string[]>;
}

interface LikeC4Model {
  elements: Record<string, LikeC4Element>;
  deployments?: { elements: Record<string, LikeC4Element> };
  views?: unknown;
}

let tempDir = "";
let dumpPath = "";
let model: LikeC4Model;

function runLikec4(args: string[]): {
  ok: boolean;
  stdout: string;
  stderr: string;
} {
  if (!existsSync(LIKEC4_BIN)) {
    return {
      ok: false,
      stdout: "",
      stderr: `likec4 binary not found at ${LIKEC4_BIN}`,
    };
  }
  const result = spawnSync(LIKEC4_BIN, args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function flattenElements(
  elements: LikeC4Element[] | undefined,
): LikeC4Element[] {
  if (!elements) return [];
  const out: LikeC4Element[] = [];
  const walk = (e: LikeC4Element) => {
    out.push(e);
    for (const child of e.children ?? []) walk(child);
  };
  for (const e of elements) walk(e);
  return out;
}

describe("LikeC4 model", () => {
  beforeAll(() => {
    tempDir = mkdtempSync(join(tmpdir(), "likec4-model-test-"));
    dumpPath = join(tempDir, "model.json");

    const dump = runLikec4(["export", "json", "-o", dumpPath]);
    if (!dump.ok) {
      throw new Error(
        `likec4 export json failed.\nstdout: ${dump.stdout}\nstderr: ${dump.stderr}\n` +
          "Run `bun install` to ensure the likec4 dependency is present.",
      );
    }
    model = JSON.parse(readFileSync(dumpPath, "utf8")) as LikeC4Model;
  });

  afterAll(() => {
    if (tempDir) {
      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch (_e) {
        // best-effort cleanup
      }
    }
  });

  test("model sources exist", () => {
    expect(existsSync(MODEL_DIR)).toBe(true);
    const files = readdirSync(MODEL_DIR);
    expect(files).toContain("specification.likec4");
    expect(files).toContain("model.likec4");
    expect(files).toContain("views.likec4");
    expect(files).toContain("deployment.likec4");
  });

  test("model.likec4 parses to a non-empty model", () => {
    const elements = flattenElements(Object.values(model.elements));
    expect(elements.length).toBeGreaterThan(0);
  });

  test("every element carries the four required tag prefixes", () => {
    const elements = flattenElements(Object.values(model.elements));
    const violations: string[] = [];
    for (const el of elements) {
      const tags = el.tags ?? [];
      for (const prefix of ["role", "surface", "domain", "spec"] as const) {
        const hasPrefix = tags.some((t) => t.startsWith(`${prefix}-`));
        if (!hasPrefix) {
          violations.push(`${el.id} is missing #${prefix}-… tag`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  test("tag values come from the closed enums", () => {
    const elements = flattenElements(Object.values(model.elements));
    const violations: string[] = [];
    for (const el of elements) {
      for (const tag of el.tags ?? []) {
        const dashIdx = tag.indexOf("-");
        if (dashIdx === -1) continue;
        const prefix = tag.slice(0, dashIdx);
        const value = tag.slice(dashIdx + 1);
        if (!value) continue;
        if (prefix === "role" && !ROLE_TAGS.includes(value as never)) {
          violations.push(`${el.id}: unknown #role-${value}`);
        }
        if (prefix === "surface" && !SURFACE_TAGS.includes(value as never)) {
          violations.push(`${el.id}: unknown #surface-${value}`);
        }
        if (prefix === "domain" && !DOMAIN_TAGS.includes(value as never)) {
          violations.push(`${el.id}: unknown #domain-${value}`);
        }
        if (prefix === "spec" && !SPEC_TAGS.includes(value as never)) {
          violations.push(`${el.id}: unknown #spec-${value}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  test("L1–L5 surfaces are present", () => {
    const elements = flattenElements(Object.values(model.elements));
    const ids = new Set(elements.map((e) => e.id));
    // L1 actors/system/external
    expect(ids.has("guest")).toBe(true);
    expect(ids.has("member")).toBe(true);
    expect(ids.has("partner")).toBe(true);
    expect(ids.has("admin")).toBe(true);
    expect(ids.has("unveiled")).toBe(true);
    // L2 containers/stores
    expect(ids.has("astroWorker")).toBe(true);
    expect(ids.has("reactIslands")).toBe(true);
    expect(ids.has("pglite")).toBe(true);
    expect(ids.has("neon")).toBe(true);
    // L3 components
    expect(ids.has("publicDiscover")).toBe(true);
    expect(ids.has("memberApp")).toBe(true);
    expect(ids.has("adminPanel")).toBe(true);
    expect(ids.has("partnerPortal")).toBe(true);
    expect(ids.has("astroActions")).toBe(true);
    expect(ids.has("drizzleRepos")).toBe(true);
    expect(ids.has("betterAuth")).toBe(true);
  });

  test("L4 deployment nodes are present", () => {
    const dep = flattenElements(
      Object.values(model.deployments?.elements ?? {}),
    );
    const ids = new Set(dep.map((e) => e.id));
    expect(ids.has("local")).toBe(true);
    expect(ids.has("preview")).toBe(true);
    expect(ids.has("prod")).toBe(true);
  });

  test("L5 booking lifecycle view is defined", () => {
    // likec4 export json flattens views into a single map keyed by view id.
    const views = (model.views ?? {}) as Record<string, { _type?: string }>;
    const bookingView = views["bookingLifecycle"];
    expect(bookingView).toBeDefined();
    if (bookingView) {
      expect(bookingView._type).toBe("dynamic");
    }
  });

  test("at least one element references a real file via metadata.path", () => {
    const elements = flattenElements([
      ...Object.values(model.elements),
      ...Object.values(model.deployments?.elements ?? {}),
    ]);
    const realPaths: string[] = [];
    for (const el of elements) {
      const path = el.metadata?.path;
      const rel = Array.isArray(path) ? path[0] : path;
      if (typeof rel === "string" && rel && existsSync(join(REPO_ROOT, rel))) {
        realPaths.push(rel);
      }
    }
    expect(realPaths.length).toBeGreaterThan(0);
    for (const rel of realPaths) {
      const stat = statSync(join(REPO_ROOT, rel));
      expect(stat.isFile() || stat.isDirectory()).toBe(true);
      // Sanity: every realPath is inside the repo.
      expect(relative(REPO_ROOT, join(REPO_ROOT, rel))).not.toMatch(/^\.\./);
    }
  });
});
