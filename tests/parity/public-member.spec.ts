import { expect, type Page, test } from "@playwright/test";

import {
  expectNoDemoOnlyLabels,
  login,
  loginWithForm,
  parityFixtureEmails,
  parityFixtureIds,
} from "./helpers";

async function switchToEnglish(page: Page) {
  await page.getByRole("button", { name: "EN", exact: true }).first().click();
}

test.describe("public and member route parity", () => {
  test.describe.configure({ mode: "serial" });

  test("persists guest language and renders German public landmarks", async ({
    page,
  }) => {
    await page.context().addCookies([
      {
        name: "unveiled_lang",
        value: "DE",
        url: "http://127.0.0.1:4322",
      },
    ]);

    await page.goto("/");
    await expect(
      page.getByText("Kultur, bevor sie öffentlich wird."),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "EN", exact: true }).first(),
    ).toBeVisible();
    await page.context().clearCookies();
    await page.context().addCookies([
      {
        name: "unveiled_lang",
        value: "EN",
        url: "http://127.0.0.1:4322",
      },
    ]);
    await page.reload();
    await expect(
      page.getByText("Culture before it goes public."),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByText("Culture before it goes public."),
    ).toBeVisible();
  });

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
    const publicEventCard = discoverPage.getByTestId(
      `event-card-${parityFixtureIds.events.public}`,
    );
    await expect(
      publicEventCard.getByRole("heading", { name: "Parity Public Opening" }),
    ).toBeVisible();
    await expect(
      publicEventCard.getByText("Parity Partner Venue", { exact: true }),
    ).toBeVisible();
    await expect(publicEventCard.getByText("9 available")).toBeVisible();
    await expect(
      publicEventCard.getByRole("button", { name: "Book now" }),
    ).toBeVisible();
    await discoverPage.getByRole("button", { name: "Explore map" }).click();
    await expect(
      discoverPage.getByText("Loading map", { exact: true }),
    ).toBeVisible();
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
      await page.goto(route).catch(() => undefined);
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByText("Welcome back")).toBeVisible();
    }
  });

  test("renders member routes with seeded data after login", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    await loginWithForm(page, parityFixtureEmails.activeMember);
    await expect(page).toHaveURL(/\/app$/);
    await switchToEnglish(page);
    await expect(page.getByText("Today in Berlin.")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Today in Berlin.")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Parity Secret Access" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Explore map" }).click();
    await expect(page.getByText("Loading map", { exact: true })).toBeVisible();
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
    await expect(
      page.getByText("PARITY-CHECKIN", { exact: true }),
    ).toBeVisible();

    await page.goto("/profile", { timeout: 5_000 }).catch(() => undefined);
    await expect(page.getByText("Active Member")).toBeVisible();
    await expect(
      page.getByText(parityFixtureEmails.activeMember),
    ).toBeVisible();
    await expectNoDemoOnlyLabels(page);
  });

  test("confirmed booking success exposes calendar download", async ({
    page,
  }) => {
    await login(page, parityFixtureEmails.activeMember, "/app");
    await expect(page).toHaveURL(/\/app$/);
    await switchToEnglish(page);

    const eventCard = page.getByTestId(
      `event-card-${parityFixtureIds.events.secret}`,
    );
    await expect(
      eventCard.getByRole("heading", {
        name: "Parity Secret Access",
      }),
    ).toBeVisible();
    await eventCard.getByRole("button", { name: "Book now" }).click();

    await expect(
      page.locator("h2").filter({ hasText: "Parity Secret Access" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Confirm access" }).click();

    await expect(page.getByText("Booking success")).toBeVisible();
    await expect(
      page.getByText("PARITY-SECRET", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Save the date")).toBeVisible();
    await expect(page.getByText("Sync to life")).toBeVisible();

    const download = page.waitForEvent("download");
    await page.getByTestId("booking-calendar-download").click();
    const calendarFile = await download;
    expect(calendarFile.suggestedFilename()).toBe(
      "unveiled-parity-secret-access.ics",
    );
  });
});
