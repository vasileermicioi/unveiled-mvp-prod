import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { dump, load } from "js-yaml";

const HonoDocPath = resolve(process.cwd(), "openapi.generated.yaml");
const TypeSpecDocPath = resolve(
  process.cwd(),
  "..",
  "..",
  "typespec/output/openapi.yaml",
);

const STRIP_KEYS = new Set(["servers"]);

function stripServers(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripServers);
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (STRIP_KEYS.has(k)) continue;
      result[k] = stripServers(v);
    }
    return result;
  }
  return value;
}

function diff(a: unknown, b: unknown, path: string): string[] {
  if (a === b) return [];
  if (typeof a !== typeof b) return [`${path}: type ${typeof a} vs ${typeof b}`];
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return [`${path}: array length ${a.length} vs ${b.length}`];
    const out: string[] = [];
    for (let i = 0; i < a.length; i += 1) {
      out.push(...diff(a[i], b[i], `${path}[${i}]`));
    }
    return out;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const aKeys = Object.keys(a as Record<string, unknown>);
    const bKeys = Object.keys(b as Record<string, unknown>);
    const out: string[] = [];
    const allKeys = new Set([...aKeys, ...bKeys]);
    for (const k of allKeys) {
      out.push(
        ...diff(
          (a as Record<string, unknown>)[k],
          (b as Record<string, unknown>)[k],
          `${path}.${k}`,
        ),
      );
    }
    return out;
  }
  return [`${path}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`];
}

async function main() {
  const honoYaml = await readFile(HonoDocPath, "utf8");
  const typespecYaml = await readFile(TypeSpecDocPath, "utf8");

  const honoDoc = stripServers(load(honoYaml));
  const typespecDoc = stripServers(load(typespecYaml));

  const differences = diff(honoDoc, typespecDoc, "$");
  if (differences.length > 0) {
    console.error("[openapi:check] Hono document diverges from TypeSpec:");
    for (const d of differences.slice(0, 50)) {
      console.error(`  ${d}`);
    }
    if (differences.length > 50) {
      console.error(`  ... and ${differences.length - 50} more`);
    }
    process.exit(1);
  }

  console.log("[openapi:check] Hono document matches TypeSpec (modulo servers).");
}

void main();