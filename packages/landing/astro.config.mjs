// @ts-check

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const here = dirname(fileURLToPath(import.meta.url));
const designSystemSrc = resolve(here, "../design-system/src");

// https://astro.build/config
export default defineConfig({
  output: "server",
  base: "/",
  adapter: cloudflare({
    imageService: "compile",
    configPath: "../../wrangler.landing.toml",
    inspectorPort: 9232,
  }),
  security: {
    checkOrigin: false,
  },
  integrations: [react()],

  vite: {
    plugins: [
      tailwindcss(),
      {
        name: "optimize-ssr-deps",
        configEnvironment(name) {
          if (name !== "client") {
            return {
              optimizeDeps: {
                include: [
                  "react",
                  "react-dom",
                  "react-dom/server",
                  "@nextui-org/react",
                ],
                exclude: ["@unveiled/design-system"],
              },
            };
          }
          return {
            optimizeDeps: {
              exclude: ["@unveiled/design-system"],
            },
          };
        },
      },
    ],
    resolve: {
      alias: [
        {
          find: /^@unveiled\/design-system(?:\/(.*))?$/,
          replacement: `${designSystemSrc}/$1`,
        },
      ],
      dedupe: ["react", "react-dom"],
    },
    ssr: {
      noExternal: ["@unveiled/design-system"],
    },
  },
});
