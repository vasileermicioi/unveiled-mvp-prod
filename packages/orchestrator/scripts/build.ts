import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { build } from "esbuild";

const entry = resolve(__dirname, "..", "src", "worker.ts");
const outdir = resolve(__dirname, "..", "dist");
mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  target: "es2022",
  outfile: resolve(outdir, "worker.js"),
  platform: "browser",
  conditions: ["worker", "browser"],
  external: ["cloudflare:workers"],
  sourcemap: true,
  minify: false,
  logLevel: "info",
  nodePaths: [resolve(__dirname, "..", "node_modules")],
  absWorkingDir: resolve(__dirname, ".."),
});

console.log(`[build] wrote ${resolve(outdir, "worker.js")}`);
