import { defineConfig, devices } from "@playwright/test";

const ladleUrl = process.env.LADLE_URL ?? "http://localhost:4321/ladle/";
const hasLadle = !!process.env.LADLE_URL || !!process.env.RUN_LADLE;

export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/node_modules/**", "**/dist/**", "**/.data/**"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4321",
    trace: "on-first-retry",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "bun run dev",
        url: "http://localhost:4321",
        reuseExistingServer: true,
        timeout: 120_000,
        stdout: "pipe",
        stderr: "pipe",
      },
  projects: [
    {
      name: "real-route",
      testDir: "./tests/parity",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "api-binding",
      testDir: "./tests/api",
      use: { ...devices["Desktop Chrome"] },
    },
    ...(hasLadle
      ? [
          {
            name: "ladle",
            testDir: "./tests/ladle",
            use: {
              baseURL: ladleUrl,
              ...devices["Desktop Chrome"],
            },
          },
        ]
      : []),
  ],
});
