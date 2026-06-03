import { chromium } from "@playwright/test";
import {
  parityFixtureEmails,
  parityPassword,
} from "../src/lib/testing/parity-fixtures";

async function run() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", (msg) => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  page.on("pageerror", (err) => {
    console.log(`[BROWSER ERROR] ${err.message}`);
  });

  console.log("Logging in as admin...");

  // Go to root to login using form
  await page.goto("http://127.0.0.1:4322/en/");
  await page.locator('input[type="email"]').fill(parityFixtureEmails.admin);
  await page.locator('input[type="password"]').fill(parityPassword);
  await page.locator('button[type="submit"]').click();

  console.log("Waiting for navigation to /admin...");
  await page.waitForURL(/\/admin/);
  console.log("Logged in. Current URL:", page.url());

  await page.waitForLoadState("networkidle");

  console.log("Clicking Events tab...");
  await page.getByTestId("admin-tab-events").click();

  console.log("Waiting 2 seconds...");
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const bodyText = await page.locator("body").innerText();
  console.log("=== BODY TEXT START ===");
  console.log(bodyText);
  console.log("=== BODY TEXT END ===");

  await browser.close();
  console.log("Done.");
}

run().catch(console.error);
