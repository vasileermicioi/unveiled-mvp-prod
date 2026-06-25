import { expect, test } from "@playwright/test";

const HAMBURGER_SELECTOR = 'button[aria-controls="shell-mobile-drawer"]';

test.describe("Hamburger toggle viewport gate", () => {
  test("hamburger toggle is hidden at the lg breakpoint (1440 px)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/");
    const toggle = page.locator(HAMBURGER_SELECTOR).first();
    await toggle.waitFor({ state: "attached" });
    const display = await toggle.evaluate(
      (node) => window.getComputedStyle(node).display,
    );
    expect(display).toBe("none");
    await page.screenshot({
      path: "tests/visual/shell/icon-button-lg-hidden.png",
      fullPage: false,
      clip: { x: 0, y: 0, width: 1440, height: 200 },
    });
  });

  test("hamburger toggle is visible at the sm breakpoint (375 px) and opens the drawer", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/en/");
    const toggle = page.locator(HAMBURGER_SELECTOR).first();
    await toggle.waitFor({ state: "visible" });
    const display = await toggle.evaluate(
      (node) => window.getComputedStyle(node).display,
    );
    expect(display).not.toBe("none");
    await toggle.click();
    const drawer = page.locator("#shell-mobile-drawer");
    await expect(drawer).toHaveAttribute("aria-modal", "true");
    await page.screenshot({
      path: "tests/visual/shell/icon-button-sm-visible.png",
      fullPage: false,
      clip: { x: 0, y: 0, width: 375, height: 200 },
    });
  });
});
