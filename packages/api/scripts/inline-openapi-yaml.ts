import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { Plugin } from "esbuild";

const OPENAPI_PATH = resolve(
  process.cwd(),
  "..",
  "..",
  "typespec/output/openapi.yaml",
);

export function inlineOpenApiYamlPlugin(): Plugin {
  return {
    name: "inline-openapi-yaml",
    setup(build) {
      build.onResolve({ filter: /^virtual:openapi-yaml$/ }, () => ({
        path: OPENAPI_PATH,
        namespace: "openapi-yaml",
      }));
      build.onLoad({ filter: /.*/, namespace: "openapi-yaml" }, () => {
        const contents = readFileSync(OPENAPI_PATH, "utf8");
        return {
          contents: `export default ${JSON.stringify(contents)};`,
          loader: "js",
        };
      });
    },
  };
}