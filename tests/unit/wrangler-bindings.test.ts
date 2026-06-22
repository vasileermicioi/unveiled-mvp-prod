import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

interface WranglerBindings {
  kv_namespaces: { binding: string; id?: string; preview_id?: string }[];
  r2_buckets: { binding: string; bucket_name: string }[];
  services: { binding: string; service: string; entrypoint: string }[];
}

function readWranglerConfig(relPath: string): WranglerBindings {
  const path = resolve(relPath);
  const text = readFileSync(path, "utf8");
  const parsed = Bun.TOML.parse(text) as Partial<WranglerBindings>;
  return {
    kv_namespaces: parsed.kv_namespaces ?? [],
    r2_buckets: parsed.r2_buckets ?? [],
    services: parsed.services ?? [],
  };
}

function bindingsByName(
  entries: { binding: string }[] | undefined,
): Map<string, { binding: string }> {
  const map = new Map<string, { binding: string }>();
  for (const entry of entries ?? []) {
    map.set(entry.binding, entry);
  }
  return map;
}

function diffBindings(
  label: string,
  left: { binding: string }[] | undefined,
  right: { binding: string }[] | undefined,
  leftLabel: string,
  rightLabel: string,
): string[] {
  const leftMap = bindingsByName(left);
  const rightMap = bindingsByName(right);
  const missing: string[] = [];
  for (const [name, entry] of leftMap) {
    const counterpart = rightMap.get(name);
    if (!counterpart) {
      missing.push(
        `${label}: binding '${name}' declared in ${leftLabel} but missing from ${rightLabel} (entry: ${JSON.stringify(entry)})`,
      );
      continue;
    }
    const entryRecord = entry as Record<string, unknown>;
    const counterpartRecord = counterpart as Record<string, unknown>;
    for (const key of Object.keys(entryRecord)) {
      if (entryRecord[key] !== counterpartRecord[key]) {
        missing.push(
          `${label}: binding '${name}' field '${key}' diverges — ${leftLabel}=${JSON.stringify(entryRecord[key])} ${rightLabel}=${JSON.stringify(counterpartRecord[key])}`,
        );
      }
    }
  }
  for (const [name, entry] of rightMap) {
    if (!leftMap.has(name)) {
      missing.push(
        `${label}: binding '${name}' declared in ${rightLabel} but missing from ${leftLabel} (entry: ${JSON.stringify(entry)})`,
      );
    }
  }
  return missing;
}

const REPO_ROOT = resolve(__dirname, "..", "..");
const APP_CONFIG = join(REPO_ROOT, "wrangler.app.toml");
const API_CONFIG = join(REPO_ROOT, "wrangler.api.toml");
const LANDING_CONFIG = join(REPO_ROOT, "wrangler.landing.toml");
const ORCHESTRATOR_CONFIG = join(REPO_ROOT, "wrangler.orchestrator.toml");

describe("wrangler.app.toml and wrangler.api.toml share their binding surface", () => {
  const app = readWranglerConfig(APP_CONFIG);
  const api = readWranglerConfig(API_CONFIG);

  it("wrangler.app.toml declares the API service binding", () => {
    const services = app.services ?? [];
    const apiBinding = services.find((s) => s.binding === "API");
    expect(apiBinding).toBeDefined();
    expect(apiBinding?.service).toBe("unveiled-api");
    expect(apiBinding?.entrypoint).toBe("fetch");
  });

  it("KV namespaces are mirrored between wrangler.app.toml and wrangler.api.toml", () => {
    const diffs = diffBindings(
      "KV",
      app.kv_namespaces,
      api.kv_namespaces,
      "wrangler.app.toml",
      "wrangler.api.toml",
    );
    expect(diffs).toEqual([]);
  });

  it("R2 buckets are mirrored between wrangler.app.toml and wrangler.api.toml", () => {
    const diffs = diffBindings(
      "R2",
      app.r2_buckets,
      api.r2_buckets,
      "wrangler.app.toml",
      "wrangler.api.toml",
    );
    expect(diffs).toEqual([]);
  });
});

describe("wrangler.landing.toml reuses the app bindings", () => {
  const app = readWranglerConfig(APP_CONFIG);
  const landing = readWranglerConfig(LANDING_CONFIG);

  it("landing worker name is unveiled-landing", () => {
    const text = readFileSync(LANDING_CONFIG, "utf8");
    expect(text).toMatch(/^name\s*=\s*"unveiled-landing"/m);
  });

  it("landing worker no longer declares a top-level assets binding", () => {
    const text = readFileSync(LANDING_CONFIG, "utf8");
    expect(text).not.toMatch(/^assets\s*=/m);
  });

  it("KV namespaces are mirrored between wrangler.app.toml and wrangler.landing.toml", () => {
    const diffs = diffBindings(
      "KV",
      app.kv_namespaces,
      landing.kv_namespaces,
      "wrangler.app.toml",
      "wrangler.landing.toml",
    );
    expect(diffs).toEqual([]);
  });

  it("R2 buckets are mirrored between wrangler.app.toml and wrangler.landing.toml", () => {
    const diffs = diffBindings(
      "R2",
      app.r2_buckets,
      landing.r2_buckets,
      "wrangler.app.toml",
      "wrangler.landing.toml",
    );
    expect(diffs).toEqual([]);
  });
});

describe("wrangler.app.toml no longer declares a top-level assets binding", () => {
  it("the orchestrator owns the top-level assets binding", () => {
    const text = readFileSync(APP_CONFIG, "utf8");
    expect(text).not.toMatch(/^assets\s*=/m);
  });
});

describe("wrangler.orchestrator.toml owns the public dispatch surface", () => {
  const app = readWranglerConfig(APP_CONFIG);
  const api = readWranglerConfig(API_CONFIG);
  const landing = readWranglerConfig(LANDING_CONFIG);
  const orchestrator = readWranglerConfig(ORCHESTRATOR_CONFIG);

  it("orchestrator worker name is unveiled", () => {
    const text = readFileSync(ORCHESTRATOR_CONFIG, "utf8");
    expect(text).toMatch(/^name\s*=\s*"unveiled"/m);
  });

  it("orchestrator declares the top-level assets binding", () => {
    const text = readFileSync(ORCHESTRATOR_CONFIG, "utf8");
    expect(text).toMatch(
      /^assets\s*=\s*\{\s*binding\s*=\s*"ASSETS",\s*directory\s*=\s*"\.\/packages\/orchestrator\/dist\/client"\s*\}/m,
    );
  });

  it("orchestrator declares the APP / LANDING / API service bindings", () => {
    const services = orchestrator.services ?? [];
    const appBinding = services.find((s) => s.binding === "APP");
    const landingBinding = services.find((s) => s.binding === "LANDING");
    const apiBinding = services.find((s) => s.binding === "API");
    expect(appBinding?.service).toBe("unveiled-app");
    expect(appBinding?.entrypoint).toBe("fetch");
    expect(landingBinding?.service).toBe("unveiled-landing");
    expect(landingBinding?.entrypoint).toBe("fetch");
    expect(apiBinding?.service).toBe("unveiled-api");
    expect(apiBinding?.entrypoint).toBe("fetch");
  });

  it("orchestrator service bindings reference the per-package wrangler names", () => {
    const orchestratorNames = new Set(
      (orchestrator.services ?? []).map((s) => s.service),
    );
    const text = join(REPO_ROOT, "wrangler.app.toml");
    expect(/^name\s*=\s*"unveiled-app"/m.test(readFileSync(text, "utf8"))).toBe(
      true,
    );
    expect(orchestratorNames.has("unveiled-app")).toBe(true);
    expect(orchestratorNames.has("unveiled-landing")).toBe(true);
    expect(orchestratorNames.has("unveiled-api")).toBe(true);
    expect(api.kv_namespaces).toBeDefined();
    expect(landing.kv_namespaces).toBeDefined();
    expect(app.kv_namespaces).toBeDefined();
  });

  it("KV namespaces are mirrored between wrangler.app.toml and wrangler.orchestrator.toml", () => {
    const diffs = diffBindings(
      "KV",
      app.kv_namespaces,
      orchestrator.kv_namespaces,
      "wrangler.app.toml",
      "wrangler.orchestrator.toml",
    );
    expect(diffs).toEqual([]);
  });

  it("R2 buckets are mirrored between wrangler.app.toml and wrangler.orchestrator.toml", () => {
    const diffs = diffBindings(
      "R2",
      app.r2_buckets,
      orchestrator.r2_buckets,
      "wrangler.app.toml",
      "wrangler.orchestrator.toml",
    );
    expect(diffs).toEqual([]);
  });
});
