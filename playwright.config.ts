import "dotenv/config";

import { defineConfig } from "@playwright/test";

const baseURL = process.env.PARITY_BASE_URL ?? "http://127.0.0.1:4322";
const baseUrl = new URL(baseURL);
const host = baseUrl.hostname;
const port = baseUrl.port || (baseUrl.protocol === "https:" ? "443" : "80");

if (process.env.PARITY_TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.PARITY_TEST_DATABASE_URL;
  process.env.PARITY_TEST_MODE = "1";
}

process.env.PUBLIC_APP_URL = process.env.PUBLIC_APP_URL ?? baseURL;
process.env.BETTER_AUTH_URL =
  process.env.BETTER_AUTH_URL ?? `${baseURL}/api/auth`;
process.env.PUBLIC_BETTER_AUTH_URL =
  process.env.PUBLIC_BETTER_AUTH_URL ?? process.env.BETTER_AUTH_URL;

export default defineConfig({
  testDir: process.env.VISUAL_TESTS ? "./tests/visual" : "./tests/parity",
  fullyParallel: process.env.VISUAL_TESTS ? false : true,
  workers: process.env.VISUAL_TESTS ? 1 : undefined,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "line" : "list",
  expect: {
    toHaveScreenshot: {
      threshold: 0.1,
      maxDiffPixels: 50,
      animations: "disabled",
    },
  },
  snapshotDir: "./tests/visual/snapshots",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  globalSetup: "./tests/parity/global-setup.ts",
  webServer: {
    command: `bun scripts/start-parity-dev.ts ${host} ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120000,
  },
});
