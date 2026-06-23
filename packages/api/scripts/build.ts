import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { build } from "esbuild";

import { inlineOpenApiYamlPlugin } from "./inline-openapi-yaml";

const entry = resolve(process.cwd(), "src/worker.ts");
const outdir = resolve(process.cwd(), "dist");
const packageSrc = resolve(process.cwd(), "src");

function packageAliasPlugin() {
  return {
    name: "package-alias",
    setup(build: import("esbuild").PluginBuild) {
      build.onResolve({ filter: /^@unveiled\/api$/ }, () => ({
        path: resolve(packageSrc, "index.ts"),
      }));
      build.onResolve({ filter: /^@unveiled\/api\// }, (args) => {
        if (args.path === "@unveiled/api/generated") {
          return {
            path: resolve(
              process.cwd(),
              "../lib-generated-request-validators.ts",
            ),
          };
        }
        const subpath = args.path.replace(/^@unveiled\/api\//, "");
        const candidateWithIndex = resolve(packageSrc, subpath, "index.ts");
        const candidateDirect = resolve(packageSrc, `${subpath}.ts`);
        const path = existsSync(candidateWithIndex)
          ? candidateWithIndex
          : candidateDirect;
        return { path };
      });
    },
  };
}

function generatedShimPlugin() {
  return {
    name: "generated-shim",
    setup(build: import("esbuild").PluginBuild) {
      build.onResolve({ filter: /^@unveiled\/api\/generated$/ }, () => ({
        path: resolve(packageSrc, "generated-bundled.ts"),
      }));
    },
  };
}

await build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  target: "es2022",
  outfile: resolve(outdir, "worker.js"),
  platform: "browser",
  conditions: ["worker", "browser"],
  external: [
    "cloudflare:workers",
    "node:fs",
    "node:path",
    "node:os",
    "node:crypto",
  ],
  sourcemap: true,
  minify: false,
  logLevel: "info",
  plugins: [
    inlineOpenApiYamlPlugin(),
    packageAliasPlugin(),
    generatedShimPlugin(),
  ],
  mainFields: ["module", "main"],
  nodePaths: [resolve(process.cwd(), "node_modules")],
  absWorkingDir: process.cwd(),
});

console.log(`[build] wrote ${resolve(outdir, "worker.js")}`);
