import { expect, type Page } from "@playwright/test";

import {
  parityDemoOnlyLabels,
  parityFixtureEmails,
  parityFixtureIds,
  parityPassword,
} from "../../src/lib/testing/parity-fixtures";

export { parityFixtureEmails, parityFixtureIds, parityPassword };

export async function login(page: Page, email: string, callbackURL = "/") {
  const response = await page.request.post("/api/account/login", {
    data: {
      email,
      password: parityPassword,
      callbackURL,
    },
  });
  expect(response.ok()).toBe(true);

  const body = (await response.json()) as { nextPath?: string };
  await page.goto(body.nextPath ?? callbackURL);
}

export async function loginWithForm(
  page: Page,
  email: string,
  callbackURL = "/",
) {
  await page.goto(`/?callbackURL=${encodeURIComponent(callbackURL)}`);
  await expect(page.getByText("Welcome back")).toBeVisible();

  await expect(async () => {
    await page.getByRole("button", { name: "Register" }).click();
    await expect(page.getByText("Create access")).toBeVisible({
      timeout: 1000,
    });
  }).toPass({ timeout: 15000 });

  await page.getByRole("button", { name: "Login" }).first().click();
  await expect(page.getByText("Welcome back")).toBeVisible();

  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(parityPassword);
  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes("/api/account/login"),
    ),
    page
      .locator("form")
      .getByRole("button", { name: /^login$/i })
      .click(),
  ]);
}

export async function expectNoDemoOnlyLabels(page: Page) {
  const bodyText = await page.locator("body").innerText();
  for (const label of parityDemoOnlyLabels) {
    expect(bodyText).not.toContain(label);
  }
}
