import { defineConfig, devices } from "@playwright/test";

const storybookUrl = process.env.STORYBOOK_URL ?? "http://localhost:4321/storybook/";
const hasStorybook = !!process.env.STORYBOOK_URL || !!process.env.RUN_STORYBOOK;

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
    ...(hasStorybook
      ? [
          {
            name: "storybook",
            testDir: "./tests/storybook",
            use: {
              baseURL: storybookUrl,
              ...devices["Desktop Chrome"],
            },
          },
        ]
      : []),
  ],
});
