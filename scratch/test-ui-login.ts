import { chromium } from "@playwright/test";

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

  page.on("response", async (response) => {
    if (response.url().includes("/api/account/login")) {
      console.log(`[API RESPONSE] Status: ${response.status()}`);
      try {
        const body = await response.json();
        console.log(`[API RESPONSE] Body:`, JSON.stringify(body, null, 2));
      } catch (_err) {
        console.log(
          `[API RESPONSE] Failed to parse body:`,
          await response.text(),
        );
      }
    }
  });

  console.log("Navigating to /de/...");
  await page.goto("http://127.0.0.1:4322/de/");

  console.log("Waiting for network idle...");
  await page.waitForLoadState("networkidle");

  // Additional wait to let Vite optimization finish
  console.log(
    "Waiting 5 seconds for Vite hot-reloading/optimization to settle...",
  );
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const noticeTitle = page
    .locator(
      'p.unveiled-meta:has-text("Hinweis"), p.unveiled-meta:has-text("Notice")',
    )
    .first();
  await noticeTitle.waitFor({ state: "visible" });

  const noticeText = page
    .locator(
      'p.unveiled-meta:has-text("Hinweis") + p, p.unveiled-meta:has-text("Notice") + p',
    )
    .first();
  console.log("Initial notice text:", await noticeText.innerText());

  console.log("Filling login fields...");
  await page
    .locator('input[type="email"]')
    .fill("parity.member.active@example.test");
  await page.locator('input[type="password"]').fill("wrongpassword");

  console.log("Clicking Submit button...");
  await page.locator('button[type="submit"]').click();

  console.log("Monitoring notice text for 4 seconds...");
  for (let i = 0; i < 40; i++) {
    const text = await noticeText.innerText();
    console.log(`t = ${i * 100}ms: "${text}"`);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  await browser.close();
  console.log("Done.");
}

run().catch(console.error);
