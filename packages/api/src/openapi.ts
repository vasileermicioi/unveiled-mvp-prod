import { writeFile, mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import * as YAML from "js-yaml";

const here = import.meta.dir;
const projectRoot = resolve(here, "..", "..", "..");

const openapiYamlPath = resolve(projectRoot, "typespec/output/openapi.yaml");
const outputPath = resolve(projectRoot, "packages/api/openapi.generated.yaml");

await mkdir(dirname(outputPath), { recursive: true });

const result = await Bun.build({
  entrypoints: [resolve(projectRoot, "packages/api/src/openapi-app.ts")],
  target: "bun",
  format: "esm",
  external: ["cloudflare:workers"],
  plugins: [
    {
      name: "generated-shim",
      setup(build) {
        build.onResolve({ filter: /^@unveiled\/api\/generated$/ }, () => ({
          path: resolve(projectRoot, "packages/api/src/generated-bundled.ts"),
        }));
      },
    },
  ],
});

if (!result.success || result.outputs.length === 0) {
  console.error("[openapi] build failed", result.logs);
  process.exit(1);
}

const modulePath = result.outputs[0].path;
const mod = await import(modulePath);
const document = mod.buildDocument();

await writeFile(outputPath, YAML.dump(document, { lineWidth: 120 }), "utf8");

const sourceYaml = await readFile(openapiYamlPath, "utf8");
console.log(
  `[openapi] wrote ${outputPath} (${document && Object.keys(document).length} top-level keys)`,
);
console.log(`[openapi] TypeSpec source: ${sourceYaml.length} bytes from ${openapiYamlPath}`);