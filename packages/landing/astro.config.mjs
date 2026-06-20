// @ts-check

import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  output: "server",
  base: "/",
  adapter: cloudflare({
    imageService: "compile",
    configPath: "../../wrangler.landing.toml",
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
                include: ["react", "react-dom", "react-dom/server"],
              },
            };
          }
        },
      },
    ],
    resolve: {
      dedupe: ["react", "react-dom"],
    },
  },
});
