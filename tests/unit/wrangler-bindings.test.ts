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
  app: { binding: string }[] | undefined,
  api: { binding: string }[] | undefined,
): string[] {
  const appMap = bindingsByName(app);
  const apiMap = bindingsByName(api);
  const missing: string[] = [];
  for (const [name, entry] of appMap) {
    const counterpart = apiMap.get(name);
    if (!counterpart) {
      missing.push(
        `${label}: binding '${name}' declared in wrangler.toml but missing from wrangler.api.toml (entry: ${JSON.stringify(entry)})`,
      );
      continue;
    }
    const entryRecord = entry as Record<string, unknown>;
    const counterpartRecord = counterpart as Record<string, unknown>;
    for (const key of Object.keys(entryRecord)) {
      if (entryRecord[key] !== counterpartRecord[key]) {
        missing.push(
          `${label}: binding '${name}' field '${key}' diverges — app=${JSON.stringify(entryRecord[key])} api=${JSON.stringify(counterpartRecord[key])}`,
        );
      }
    }
  }
  for (const [name, entry] of apiMap) {
    if (!appMap.has(name)) {
      missing.push(
        `${label}: binding '${name}' declared in wrangler.api.toml but missing from wrangler.toml (entry: ${JSON.stringify(entry)})`,
      );
    }
  }
  return missing;
}

const REPO_ROOT = resolve(__dirname, "..", "..");
const APP_CONFIG = join(REPO_ROOT, "wrangler.app.toml");
const API_CONFIG = join(REPO_ROOT, "wrangler.api.toml");

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

  it("KV namespaces are mirrored between wrangler.toml and wrangler.api.toml", () => {
    const diffs = diffBindings("KV", app.kv_namespaces, api.kv_namespaces);
    expect(diffs).toEqual([]);
  });

  it("R2 buckets are mirrored between wrangler.toml and wrangler.api.toml", () => {
    const diffs = diffBindings("R2", app.r2_buckets, api.r2_buckets);
    expect(diffs).toEqual([]);
  });
});
