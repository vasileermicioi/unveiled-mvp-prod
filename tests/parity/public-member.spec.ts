import { expect, test } from "@playwright/test";

import {
  expectNoDemoOnlyLabels,
  loginWithForm,
  parityFixtureEmails,
} from "./helpers";

test.describe("public and member route parity", () => {
  test("renders public routes with seeded landmarks", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText("Culture before it goes public."),
    ).toBeVisible();
    await expectNoDemoOnlyLabels(page);

    const discoverPage = await page.context().newPage();
    await discoverPage.goto("/discover");
    await expect(
      discoverPage.getByText("This week inside Unveiled."),
    ).toBeVisible();
    await expect(
      discoverPage.getByRole("heading", { name: "Parity Public Opening" }),
    ).toBeVisible();
    await expect(
      discoverPage.getByText("Parity Partner Venue", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      discoverPage.getByText("9 available", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      discoverPage.getByRole("button", { name: "Book now" }).first(),
    ).toBeVisible();
    await discoverPage.getByRole("button", { name: "Explore map" }).click();
    await expect(discoverPage.getByText("Loading map")).toBeVisible();
    await expect(
      discoverPage.getByText("Mitte Art", { exact: true }).first(),
    ).toBeVisible({ timeout: 5000 });
    await expect(discoverPage.getByLabel("Start date")).toHaveCount(0);
    await expectNoDemoOnlyLabels(discoverPage);
    await discoverPage.close();

    const howPage = await page.context().newPage();
    await howPage.goto("/how-it-works");
    await expect(
      howPage.getByText("Credits become cultural access."),
    ).toBeVisible();
    await howPage.close();

    const membershipPage = await page.context().newPage();
    await membershipPage.goto("/membership");
    await expect(membershipPage.getByText("Basic Berlin")).toBeVisible();
    await expect(membershipPage.getByText("29€/mo")).toBeVisible();
    await membershipPage.close();

    const faqPage = await page.context().newPage();
    await faqPage.goto("/faq");
    await expect(faqPage.getByText("Questions before access?")).toBeVisible();
    await faqPage.close();
  });

  test("redirects guests away from protected member routes", async ({
    page,
  }) => {
    for (const route of ["/app", "/saved", "/bookings", "/profile"]) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByText("Welcome back")).toBeVisible();
    }
  });

  test("renders member routes with seeded data after login", async ({
    page,
  }) => {
    await loginWithForm(page, parityFixtureEmails.activeMember);
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByText("Today in Berlin.")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Parity Secret Access" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Explore map" }).click();
    await expect(page.getByText("Loading map")).toBeVisible();
    await expect(
      page.getByText("Mitte Art", { exact: true }).first(),
    ).toBeVisible({
      timeout: 5000,
    });

    await page.goto("/saved");
    await expect(
      page.getByRole("heading", { name: "Parity Voucher Night" }),
    ).toBeVisible();

    await page.goto("/bookings");
    await expect(page.getByText("Your access codes.")).toBeVisible();
    await expect(page.getByText("PARITY-CHECKIN")).toBeVisible();

    await page.goto("/profile");
    await expect(page.getByText("Active Member")).toBeVisible();
    await expect(
      page.getByText(parityFixtureEmails.activeMember),
    ).toBeVisible();
    await expectNoDemoOnlyLabels(page);
  });
});
