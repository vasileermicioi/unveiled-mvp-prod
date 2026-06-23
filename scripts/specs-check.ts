#!/usr/bin/env bun
/**
 * specs:check — drift detection for the TypeSpec contract.
 *
 * 1. Compiles the TypeSpec project into a temp directory.
 * 2. Diffs the resulting `openapi.yaml` against the committed artifact.
 * 3. Rebuilds the Zod bundle from the temp openapi.yaml and diffs it
 *    against the committed `src/lib/generated/request-validators.ts`.
 * 4. Exits non-zero on any drift so `bun run check` fails locally and in CI.
 *
 * Run via `bun run specs:check`. Wired into `bun run check`.
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRequestValidatorsContent, readOpenApi } from "./specs-shared";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outputDir = join(root, "typespec/output");
const generatedDir = join(root, "packages/api/src");
const generatedFile = "lib-generated-request-validators.ts";

function ensureDir(path: string): void {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function main(): void {
  ensureDir(generatedDir);

  // 1. Compile into a temp dir by writing a temp tspconfig.yaml that points
  //    the emitter at it. The committed config (under typespec/) is untouched.
  const tmpRoot = mkdtempSync(join(tmpdir(), "specs-check-"));
  const tmpOut = join(tmpRoot, "typespec/output");
  ensureDir(tmpOut);

  const tmpConfig = join(tmpRoot, "tspconfig.yaml");
  const tmpConfigBody = `emit:
  - "@typespec/openapi3"
options:
  "@typespec/openapi3":
    emitter-output-dir: "${tmpOut}"
    file-type: yaml
    openapi-versions:
      - 3.1.0
`;
  writeFileSync(tmpConfig, tmpConfigBody);

  const compile = spawnSync(
    "./node_modules/.bin/tsp",
    ["compile", "typespec/main.tsp", "--config", tmpConfig],
    { cwd: root, stdio: "inherit" },
  );
  if (compile.status !== 0) {
    process.exit(compile.status ?? 1);
  }

  // 2. Diff openapi.yaml.
  const tmpYaml = join(tmpOut, "openapi.yaml");
  const committedYaml = join(outputDir, "openapi.yaml");
  if (!existsSync(tmpYaml)) {
    console.error(`[specs:check] no openapi.yaml in ${tmpOut}`);
    process.exit(1);
  }
  if (readFileSync(tmpYaml, "utf8") !== readFileSync(committedYaml, "utf8")) {
    console.error(
      `[specs:check] drift: typespec/output/openapi.yaml is out of date`,
    );
    console.error("  regenerate via `bun run specs:gen`");
    process.exit(1);
  }

  // 3. Diff request-validators.ts (rebuild from the temp openapi.yaml).
  const doc = readOpenApi(tmpYaml);
  const { content: candidate, schemaCount } =
    buildRequestValidatorsContent(doc);
  const committedValidators = join(generatedDir, generatedFile);
  if (!existsSync(committedValidators)) {
    console.error(
      `[specs:check] no committed ${committedValidators}; run \`bun run specs:gen\``,
    );
    process.exit(1);
  }
  if (candidate !== readFileSync(committedValidators, "utf8")) {
    console.error(`[specs:check] drift: ${committedValidators} is out of date`);
    console.error("  regenerate via `bun run specs:gen`");
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log(
    `[specs:check] OK (openapi.yaml + ${schemaCount} schemas in sync)`,
  );
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
