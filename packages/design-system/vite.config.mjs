import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

const here = dirname(fileURLToPath(import.meta.url));
const packagesDir = resolve(here, "..");
const appSrc = resolve(packagesDir, "app/src");
const designSystemSrc = resolve(here, "src");
const landingSrc = resolve(packagesDir, "landing/src");
const apiSrc = resolve(packagesDir, "api/src");
const orchestratorSrc = resolve(packagesDir, "orchestrator/src");

export default {
  plugins: [tailwindcss()],
  resolve: {
    alias: [
      { find: /^~\/(.*)$/, replacement: `${appSrc}/$1` },
      { find: /^@unveiled\/app(?:\/(.*))?$/, replacement: `${appSrc}/$1` },
      {
        find: /^@unveiled\/design-system(?:\/(.*))?$/,
        replacement: `${designSystemSrc}/$1`,
      },
      {
        find: /^@unveiled\/landing(?:\/(.*))?$/,
        replacement: `${landingSrc}/$1`,
      },
      { find: /^@unveiled\/api(?:\/(.*))?$/, replacement: `${apiSrc}/$1` },
      {
        find: /^@unveiled\/orchestrator(?:\/(.*))?$/,
        replacement: `${orchestratorSrc}/$1`,
      },
    ],
    dedupe: ["react", "react-dom"],
  },
};
