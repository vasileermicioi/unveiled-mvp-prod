import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { Plugin } from "esbuild";
import * as YAML from "js-yaml";

const projectRoot = resolve(import.meta.dir, "..", "..", "..");
const openapiYamlPath = resolve(projectRoot, "typespec/output/openapi.yaml");
const outputPath = resolve(projectRoot, "packages/api/openapi.generated.yaml");

function inlineOpenApiYamlPlugin(): Plugin {
  return {
    name: "inline-openapi-yaml",
    setup(build) {
      build.onLoad({ filter: /\.ts$/ }, async (args) => {
        const source = readFileSync(args.path, "utf8");
        if (!source.includes("__INLINE_OPENAPI_YAML__")) return null;
        const contents = readFileSync(openapiYamlPath, "utf8");
        const inlined = source.replace(
          '"__INLINE_OPENAPI_YAML__"',
          JSON.stringify(contents),
        );
        return { contents: inlined, loader: "ts" };
      });
    },
  };
}

await mkdir(dirname(outputPath), { recursive: true });

const result = await Bun.build({
  entrypoints: [resolve(projectRoot, "packages/api/src/openapi-app.ts")],
  target: "bun",
  format: "esm",
  external: ["cloudflare:workers", "node:fs", "node:path"],
  plugins: [
    inlineOpenApiYamlPlugin(),
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
console.log(
  `[openapi] TypeSpec source: ${sourceYaml.length} bytes from ${openapiYamlPath}`,
);
