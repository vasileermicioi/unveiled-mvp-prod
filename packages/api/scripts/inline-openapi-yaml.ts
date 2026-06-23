import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import type { Plugin } from "esbuild";

const OPENAPI_PATH = resolve(
  dirname(new URL(import.meta.url).pathname),
  "..",
  "..",
  "..",
  "typespec/output/openapi.yaml",
);

export function inlineOpenApiYamlPlugin(): Plugin {
  return {
    name: "inline-openapi-yaml",
    setup(build) {
      build.onLoad({ filter: /\.ts$/ }, async (args) => {
        const source = readFileSync(args.path, "utf8");
        if (!source.includes("__INLINE_OPENAPI_YAML__")) return null;
        const contents = readFileSync(OPENAPI_PATH, "utf8");
        const inlined = source.replace(
          '"__INLINE_OPENAPI_YAML__"',
          JSON.stringify(contents),
        );
        return { contents: inlined, loader: "ts" };
      });
    },
  };
}
