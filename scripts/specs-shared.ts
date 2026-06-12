#!/usr/bin/env bun
/**
 * Shared helper for `specs-gen.ts` and `specs-check.ts`.
 *
 * Both scripts:
 *   1. Compile `typespec/main.tsp` via the `@typespec/openapi3` emitter.
 *   2. Parse `openapi.yaml` and extract the inlined `components.schemas`.
 *   3. Convert each schema to a Zod validator and produce a
 *      `request-validators.ts`-shaped string.
 *
 * No intermediate per-model JSON Schema files are involved; the OpenAPI
 * emitter inlines everything.
 */
import { existsSync, readFileSync } from "node:fs";
import yaml from "js-yaml";
import { jsonSchemaToZod } from "json-schema-to-zod";

export type SchemaMap = Record<string, Record<string, unknown>>;

export type OpenApiDoc = {
  openapi?: string;
  components?: { schemas?: SchemaMap };
};

export function readOpenApi(yamlPath: string): OpenApiDoc {
  if (!existsSync(yamlPath)) {
    throw new Error(
      `Expected ${yamlPath} to exist. Run \`tsp compile\` first.`,
    );
  }
  return yaml.load(readFileSync(yamlPath, "utf8")) as OpenApiDoc;
}

/**
 * Build the `request-validators.ts` content from an OpenAPI doc.
 * Strips the `<Namespace>.` prefix from each schema name so the validator
 * matches the TypeSpec model name (e.g. `Admin.Partner` -> `Partner`).
 */
export function buildRequestValidatorsContent(doc: OpenApiDoc): {
  content: string;
  schemaCount: number;
} {
  const schemas = doc.components?.schemas ?? {};
  const schemaCount = Object.keys(schemas).length;
  const importLines: string[] = [];
  const exportNames: string[] = [];

  for (const namespacedName of Object.keys(schemas).sort()) {
    const schema = schemas[namespacedName];
    const modelName = stripNamespace(namespacedName);
    const zod = jsonSchemaToZod(schema, { withDescription: true });
    const trimmed = zod
      .replace(/^export\s+const\s+/, "")
      .replace(/^export\s+default\s+/, "");
    importLines.push(
      `// Auto-generated from OpenAPI schema ${namespacedName}. Do not edit.`,
    );
    importLines.push(`export const ${modelName}Schema = ${trimmed};`);
    exportNames.push(modelName);
  }

  const header = `/**
 * AUTO-GENERATED FILE — DO NOT EDIT.
 *
 * Zod validators for every TypeSpec model under typespec/. Regenerate via
 * \`bun run specs:gen\`. Drift detection: \`bun run specs:check\`.
 *
 * Source: typespec/output/openapi.yaml (the canonical OpenAPI 3.1 document).
 * The 92 inlined schemas in \`components.schemas\` are converted 1:1 to Zod
 * validators below.
 */
import { z } from "zod";

`;

  const index =
    `\nexport const GeneratedSchemas = {\n` +
    exportNames.map((n) => `  ${n}: ${n}Schema,`).join("\n") +
    `\n} as const;\n\nexport type GeneratedSchemaName = keyof typeof GeneratedSchemas;\n`;

  return {
    content: `${header}${importLines.join("\n\n")}\n${index}`,
    schemaCount,
  };
}

function stripNamespace(schemaName: string): string {
  const dot = schemaName.lastIndexOf(".");
  return dot === -1 ? schemaName : schemaName.slice(dot + 1);
}
