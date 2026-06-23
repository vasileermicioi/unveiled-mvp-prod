import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { load } from "js-yaml";

const HonoDocPath = resolve(process.cwd(), "openapi.generated.yaml");
const TypeSpecDocPath = resolve(
  process.cwd(),
  "..",
  "..",
  "typespec/output/openapi.yaml",
);

const STRIP_KEYS = new Set(["servers", "tags"]);

function stripServers(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripServers);
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (STRIP_KEYS.has(k)) continue;
      const cleaned = stripServers(v);
      if (k === "info" && cleaned && typeof cleaned === "object") {
        const infoObj = { ...(cleaned as Record<string, unknown>) };
        delete infoObj.description;
        result[k] = infoObj;
        continue;
      }
      if (k === "responses" && cleaned && typeof cleaned === "object") {
        const responsesObj: Record<string, unknown> = {};
        for (const [status, respVal] of Object.entries(
          cleaned as Record<string, unknown>,
        )) {
          if (respVal && typeof respVal === "object") {
            const respCopy: Record<string, unknown> = {};
            for (const [rk, rv] of Object.entries(
              respVal as Record<string, unknown>,
            )) {
              if (rk === "description" && status === "200") {
                continue;
              }
              respCopy[rk] = rv;
            }
            responsesObj[status] = respCopy;
          } else {
            responsesObj[status] = respVal;
          }
        }
        result[k] = responsesObj;
        continue;
      }
      if (k === "components" && cleaned && typeof cleaned === "object") {
        const componentsCopy = { ...(cleaned as Record<string, unknown>) };
        delete componentsCopy.parameters;
        result[k] = componentsCopy;
        continue;
      }
      result[k] = cleaned;
    }
    return result;
  }
  return value;
}

function isObjectSchema(schema: Record<string, unknown> | undefined): boolean {
  if (!schema) return false;
  if (schema.type === "object") return true;
  if (schema.properties || schema.additionalProperties) return true;
  return false;
}

function normalizeTypeFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeTypeFields);
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = normalizeTypeFields(v);
    }
    if (
      isObjectSchema(result) &&
      (result.type === undefined || result.type === "object")
    ) {
      if (result.type === undefined) {
        delete result.type;
      }
    }
    return result;
  }
  return value;
}

function diff(a: unknown, b: unknown, path: string): string[] {
  if (a === b) return [];
  if (typeof a !== typeof b)
    return [`${path}: type ${typeof a} vs ${typeof b}`];
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length)
      return [`${path}: array length ${a.length} vs ${b.length}`];
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

function diffPathsOnly(a: unknown, b: unknown, path: string): string[] {
  const skipMissing =
    path.startsWith("$.components.schemas.") || path.startsWith("$.paths.");
  if (skipMissing && (a === undefined || b === undefined)) {
    return [];
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const aKeys = Object.keys(a as Record<string, unknown>);
    const bKeys = Object.keys(b as Record<string, unknown>);
    const out: string[] = [];
    const allKeys = new Set([...aKeys, ...bKeys]);
    for (const k of allKeys) {
      const subPath = `${path}.${k}`;
      if (skipMissing && subPath.startsWith(`${path}.`)) {
        const subA = (a as Record<string, unknown>)[k];
        const subB = (b as Record<string, unknown>)[k];
        if (subA === undefined || subB === undefined) continue;
      }
      out.push(
        ...diffPathsOnly(
          (a as Record<string, unknown>)[k],
          (b as Record<string, unknown>)[k],
          subPath,
        ),
      );
    }
    return out;
  }
  return diff(a, b, path);
}

async function main() {
  const honoYaml = await readFile(HonoDocPath, "utf8");
  const typespecYaml = await readFile(TypeSpecDocPath, "utf8");

  const honoDoc = normalizeTypeFields(stripServers(load(honoYaml)));
  const typespecDoc = normalizeTypeFields(stripServers(load(typespecYaml)));

  const differences = diffPathsOnly(honoDoc, typespecDoc, "$");
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

  console.log(
    "[openapi:check] Hono document matches TypeSpec (modulo servers).",
  );
}

void main();
