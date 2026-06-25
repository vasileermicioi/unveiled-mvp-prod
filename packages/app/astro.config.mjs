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
  base: "/app",
  adapter: cloudflare({
    imageService: "compile",
    configPath: "../../wrangler.app.toml",
    inspectorPort: 9231,
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
                entries: ["src/**/*.{ts,tsx,astro}"],
                include: [
                  "react",
                  "react-dom",
                  "react-dom/server",
                  "@tanstack/react-query",
                  "zod",
                  "astro/actions/runtime/entrypoints/server.js",
                  "better-auth",
                  "better-auth/adapters/drizzle",
                  "better-auth/client",
                  "drizzle-orm",
                  "drizzle-orm/pg-core",
                ],
                exclude: ["@unveiled/design-system"],
              },
            };
          }
          return {
            optimizeDeps: {
              entries: ["src/**/*.{ts,tsx,astro}"],
              include: [
                "react",
                "react-dom",
                "@tanstack/react-query",
                "zod",
                "astro/actions/runtime/entrypoints/client.js",
                "better-auth",
                "better-auth/client",
              ],
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
