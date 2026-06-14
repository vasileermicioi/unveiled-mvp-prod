import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/components/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  typescript: {
    check: false,
  },
  viteFinal: (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias ?? {}),
        "@": fileURLToPath(new URL("../src", import.meta.url)),
      },
    },
  }),
};

export default config;
