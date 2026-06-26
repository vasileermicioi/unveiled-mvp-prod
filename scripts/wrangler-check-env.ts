#!/usr/bin/env bun
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  PRODUCTION_ENVS,
  PRODUCTION_ENVS_BY_FILE,
  PRODUCTION_SECRETS,
} from "@unveiled/api";

const REPO_ROOT = resolve(import.meta.dir, "..");
const WRANGLER_GLOB = /^wrangler\.[a-z0-9-]+\.toml$/;

type WranglerSection = {
  vars?: Record<string, string>;
  secrets?: Record<string, string>;
};

type WranglerDoc = {
  env?: { production?: WranglerSection };
};

function findWranglerConfigs(): string[] {
  return readdirSync(REPO_ROOT)
    .filter((entry) => WRANGLER_GLOB.test(entry))
    .filter((entry) => statSync(join(REPO_ROOT, entry)).isFile())
    .sort();
}

function declaredKeys(doc: WranglerDoc): {
  vars: Set<string>;
  secrets: Set<string>;
} {
  const vars = new Set<string>();
  const secrets = new Set<string>();
  const production = doc.env?.production;
  if (production?.vars) {
    for (const key of Object.keys(production.vars)) vars.add(key);
  }
  if (production?.secrets) {
    for (const key of Object.keys(production.secrets)) secrets.add(key);
  }
  return { vars, secrets };
}

function requiredKeysFor(file: string): string[] {
  const explicit = PRODUCTION_ENVS_BY_FILE[file];
  if (explicit) return [...explicit];
  return PRODUCTION_ENVS.filter((key) => !PRODUCTION_SECRETS.includes(key));
}

export function checkWranglerEnv(
  text: string,
  file: string,
): {
  missing: string[];
} {
  const doc = Bun.TOML.parse(text) as WranglerDoc;
  const { vars, secrets } = declaredKeys(doc);
  const required = requiredKeysFor(file);
  const missing = required.filter(
    (key) =>
      !vars.has(key) && !secrets.has(key) && !PRODUCTION_SECRETS.includes(key),
  );
  return { missing };
}

function main(): number {
  const files = findWranglerConfigs();
  const failures: { file: string; missing: string[] }[] = [];

  for (const file of files) {
    const path = join(REPO_ROOT, file);
    const text = readFileSync(path, "utf8");
    try {
      const { missing } = checkWranglerEnv(text, file);
      if (missing.length > 0) failures.push({ file, missing });
    } catch (err) {
      console.error(`wrangler:check-env: failed to parse ${file}:`, err);
      return 2;
    }
  }

  if (failures.length === 0) {
    console.log(
      `wrangler:check-env: ok — ${files.length} wrangler config files declared every PRODUCTION_ENVS key (secrets: ${PRODUCTION_SECRETS.join(", ")})`,
    );
    return 0;
  }

  console.error("wrangler:check-env: missing PRODUCTION_ENVS keys:");
  for (const { file, missing } of failures) {
    console.error(`  ${file}: ${missing.join(", ")}`);
  }
  console.error(
    `wrangler:check-env: declare each key under [env.production.vars] in the matching wrangler.*.toml, or document it as a Cloudflare secret (${PRODUCTION_SECRETS.join(", ")}).`,
  );
  return 1;
}

if (import.meta.main) {
  process.exit(main());
}
