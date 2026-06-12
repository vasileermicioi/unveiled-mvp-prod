#!/usr/bin/env bun
/**
 * specs:gen — generate the OpenAPI contract and the Zod bundle.
 *
 *   1. Runs `tsp compile` against `typespec/main.tsp` (writes
 *      `typespec/output/openapi.yaml`).
 *   2. Parses the inlined `components.schemas` and emits
 *      `src/lib/generated/request-validators.ts` (one Zod schema per model).
 *
 * The committed artifacts are:
 *   - typespec/output/openapi.yaml
 *   - src/lib/generated/request-validators.ts
 *
 * The per-model JSON Schema files are NOT generated (the OpenAPI emitter
 * inlines them) and are not committed.
 *
 * Run via `bun run specs:gen`. Wired into `bun run check` via `specs:check`.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRequestValidatorsContent, readOpenApi } from "./specs-shared";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outputDir = join(root, "typespec/output");
const generatedDir = join(root, "src/lib/generated");

function ensureDir(path: string): void {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function main(): void {
  ensureDir(generatedDir);

  const yamlPath = join(outputDir, "openapi.yaml");
  const doc = readOpenApi(yamlPath);
  const { content, schemaCount } = buildRequestValidatorsContent(doc);

  // eslint-disable-next-line no-console
  console.log(
    `[specs:gen] Parsed ${yamlPath} (${schemaCount} schemas, OpenAPI ${String(doc.openapi ?? "?")})`,
  );

  const validatorsPath = join(generatedDir, "request-validators.ts");
  writeFileSync(validatorsPath, content);
  // eslint-disable-next-line no-console
  console.log(`[specs:gen] Wrote ${validatorsPath}`);
}

main();
