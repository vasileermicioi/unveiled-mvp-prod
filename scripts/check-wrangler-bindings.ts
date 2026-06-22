#!/usr/bin/env bun
/**
 * Wrangler binding drift gate.
 *
 * Walks every `wrangler.*.toml` config at the repo root and asserts that
 * the SESSION KV namespace and the ASSETS_BUCKET R2 binding are
 * consistent across the per-package configs (app, api, landing). The
 * unit test under `tests/unit/wrangler-bindings.test.ts` is the
 * authoritative enforcement; this script is the standalone CI entry
 * point that exits non-zero on drift without invoking the full
 * `bun:test` suite.
 *
 * Usage:
 *   bun run scripts/check-wrangler-bindings.ts
 */

import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const REPO_ROOT = resolve(__dirname, "..");

interface WranglerBindings {
  kv_namespaces: { binding: string; id?: string; preview_id?: string }[];
  r2_buckets: { binding: string; bucket_name: string }[];
  services?: { binding: string; service: string; entrypoint: string }[];
}

function readConfig(relPath: string): WranglerBindings {
  const text = readFileSync(join(REPO_ROOT, relPath), "utf8");
  return Bun.TOML.parse(text) as WranglerBindings;
}

function diff(
  left: { binding: string }[] | undefined,
  right: { binding: string }[] | undefined,
  leftLabel: string,
  rightLabel: string,
  label: string,
): string[] {
  const leftMap = new Map((left ?? []).map((e) => [e.binding, e]));
  const rightMap = new Map((right ?? []).map((e) => [e.binding, e]));
  const errors: string[] = [];
  for (const [name, entry] of leftMap) {
    const counterpart = rightMap.get(name);
    if (!counterpart) {
      errors.push(
        `${label}: '${name}' declared in ${leftLabel} but missing from ${rightLabel}`,
      );
      continue;
    }
    for (const [key, value] of Object.entries(entry)) {
      if (key === "binding") continue;
      const other = (counterpart as Record<string, unknown>)[key];
      if (other !== value) {
        errors.push(
          `${label}: '${name}.${key}' diverges — ${leftLabel}=${JSON.stringify(value)} ${rightLabel}=${JSON.stringify(other)}`,
        );
      }
    }
  }
  for (const name of rightMap.keys()) {
    if (!leftMap.has(name)) {
      errors.push(
        `${label}: '${name}' declared in ${rightLabel} but missing from ${leftLabel}`,
      );
    }
  }
  return errors;
}

const REQUIRED_CONFIGS = [
  "wrangler.app.toml",
  "wrangler.api.toml",
  "wrangler.landing.toml",
  "wrangler.orchestrator.toml",
];

const missing = REQUIRED_CONFIGS.filter((c) => !existsSync(join(REPO_ROOT, c)));
if (missing.length > 0) {
  console.error(`wrangler:check FAILED — missing config(s): ${missing.join(", ")}`);
  process.exit(1);
}

const app = readConfig("wrangler.app.toml");
const api = readConfig("wrangler.api.toml");
const landing = readConfig("wrangler.landing.toml");
const orchestrator = readConfig("wrangler.orchestrator.toml");

const errors: string[] = [];
errors.push(...diff(app.kv_namespaces, api.kv_namespaces, "wrangler.app.toml", "wrangler.api.toml", "KV"));
errors.push(...diff(app.kv_namespaces, landing.kv_namespaces, "wrangler.app.toml", "wrangler.landing.toml", "KV"));
errors.push(...diff(app.kv_namespaces, orchestrator.kv_namespaces, "wrangler.app.toml", "wrangler.orchestrator.toml", "KV"));
errors.push(...diff(app.r2_buckets, api.r2_buckets, "wrangler.app.toml", "wrangler.api.toml", "R2"));
errors.push(...diff(app.r2_buckets, landing.r2_buckets, "wrangler.app.toml", "wrangler.landing.toml", "R2"));
errors.push(...diff(app.r2_buckets, orchestrator.r2_buckets, "wrangler.app.toml", "wrangler.orchestrator.toml", "R2"));

const orchestratorServices = (orchestrator.services ?? []) as {
  binding: string;
  service: string;
}[];
const requiredServices = ["unveiled-app", "unveiled-landing", "unveiled-api"];
for (const required of requiredServices) {
  if (!orchestratorServices.some((s) => s.service === required)) {
    errors.push(
      `wrangler.orchestrator.toml: missing service binding referencing '${required}'`,
    );
  }
}

if (errors.length > 0) {
  console.error("wrangler:check FAILED — binding drift detected:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `wrangler:check OK — SESSION KV and ASSETS_BUCKET R2 are consistent across ${REQUIRED_CONFIGS.join(", ")}.`,
);
