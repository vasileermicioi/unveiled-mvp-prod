import "dotenv/config";

if (process.env.PARITY_TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.PARITY_TEST_DATABASE_URL;
  process.env.PARITY_TEST_MODE = "1";
}

import { expect, type Locator, type Page } from "@playwright/test";
import { eq } from "drizzle-orm";

import { db } from "../../src/db/client";
import { user, userProfiles } from "../../src/db/schema";
import {
  parityFixtureEmails,
  parityFixtureIds,
  login as parityLogin,
  loginWithForm as parityLoginWithForm,
  parityPassword,
} from "../parity/helpers";

export { parityFixtureEmails, parityFixtureIds, parityPassword };

/**
 * Re-exports parity login helper
 */
export async function login(page: Page, email: string, callbackURL = "/") {
  const dbUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  });
  if (dbUser) {
    await db
      .update(userProfiles)
      .set({ language: "EN" })
      .where(eq(userProfiles.userId, dbUser.id));
  }
  return parityLogin(page, email, callbackURL);
}

/**
 * Re-exports parity loginWithForm helper
 */
export async function loginWithForm(
  page: Page,
  email: string,
  callbackURL = "/",
) {
  const dbUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  });
  if (dbUser) {
    await db
      .update(userProfiles)
      .set({ language: "EN" })
      .where(eq(userProfiles.userId, dbUser.id));
  }
  return parityLoginWithForm(page, email, callbackURL);
}

/**
 * Injects CSS to suppress all animations/transitions, stabilize fonts,
 * disable blinking carets, and wait for stability.
 */
export async function stabilizePage(page: Page) {
  // Suppress transitions, animations, scroll behavior, and cursor blinking
  await page.addStyleTag({
    content: `
      * {
        transition: none !important;
        animation: none !important;
        transition-duration: 0s !important;
        animation-duration: 0s !important;
        scroll-behavior: auto !important;
      }
      input, textarea {
        caret-color: transparent !important;
      }
    `,
  });

  // Wait for fonts to finish loading
  await page.evaluate(() => document.fonts.ready);

  // Wait for page load and network stabilization
  await page.waitForLoadState("load");
  await page.waitForLoadState("domcontentloaded");
  try {
    await page.waitForLoadState("networkidle", { timeout: 5000 });
  } catch (_e) {
    // networkidle is nice to have, but don't fail if some analytics/polling persists
  }
}

/**
 * Standard visual regression snapshot capture that applies stabilization and masks dynamic areas.
 */
export async function expectVisualParity(
  page: Page,
  snapshotName: string,
  options: { mask?: Locator[] } & Record<string, unknown> = {},
): Promise<void> {
  await stabilizePage(page);

  // Default masks:
  // - .touch-none covers the OpenStreetMap view area in DiscoveryMapPanel
  // - iframe[src*="stripe.com"] covers any real Stripe frames
  // - iframe[src*="google.com/maps"] covers any embedded maps
  const defaultMasks = [
    page.locator(".touch-none"),
    page.locator('iframe[src*="stripe.com"]'),
    page.locator('iframe[src*="google.com/maps"]'),
  ];

  // Merge custom masks if provided
  const customMasks = options.mask as Locator[] | undefined;
  const masks = customMasks ? [...defaultMasks, ...customMasks] : defaultMasks;

  await expect(page).toHaveScreenshot(snapshotName, {
    animations: "disabled",
    mask: masks,
    ...options,
  });
}
