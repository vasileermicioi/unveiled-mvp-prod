import { expect, test } from "@playwright/test";

import {
  expectNoDemoOnlyLabels,
  login,
  parityFixtureEmails,
  parityFixtureIds,
} from "./helpers";

test.describe("partner, admin, and venue parity", () => {
  test("renders partner route and redirects partner away from admin", async ({
    page,
  }) => {
    await login(page, parityFixtureEmails.partner, "/partner");
    await expect(page).toHaveURL(/\/partner$/);
    await expect(page.getByText("Partner portal").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /^Parity Partner Venue\.?$/ }),
    ).toBeVisible();
    await expect(page.getByText("Active Member").first()).toBeVisible();

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/partner$/);
    await expectNoDemoOnlyLabels(page);
  });

  test("renders admin route and redirects admin away from partner", async ({
    page,
  }) => {
    await login(page, parityFixtureEmails.admin, "/admin");
    await expect(page).toHaveURL(/\/admin$/);
    await expect(
      page.getByRole("heading", { name: "Operations overview." }).first(),
    ).toBeVisible();
    await expect(
      page.getByText("Parity Public Opening", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page
        .locator("p")
        .filter({ hasText: /^Parity Partner Venue$/ })
        .first(),
    ).toBeVisible();
    await expect(
      page.getByText(parityFixtureEmails.frozenMember).first(),
    ).toBeVisible();
    await expect(page.getByTestId("admin-event-image-upload")).toHaveAttribute(
      "accept",
      "image/jpeg,image/png,image/webp,image/gif",
    );
    await expect(page.getByTestId("admin-partner-logo-upload")).toHaveAttribute(
      "accept",
      "image/jpeg,image/png,image/webp,image/gif",
    );
    await expect(
      page.getByPlaceholder("https://assets.example.com/image.jpg").first(),
    ).toBeVisible();

    await page.goto("/partner");
    await expect(page).toHaveURL(/\/admin$/);
    await expectNoDemoOnlyLabels(page);
  });

  test("renders venue check-in guest and authenticated member landmarks", async ({
    page,
  }) => {
    const venuePath = `/venue-check-in/${parityFixtureIds.partner}?token=PARITY-VENUE-CHECK-IN`;

    await page.goto(venuePath);
    await expect(page.getByText("Sign in to check in")).toBeVisible();

    await login(page, parityFixtureEmails.activeMember, venuePath);
    await expect(page).toHaveURL(
      new RegExp(`${parityFixtureIds.partner}\\?token=`),
    );
    await expect(page.getByText("Confirm your venue check-in")).toBeVisible();
    await expect(page.getByText("Ready")).toBeVisible();
  });
});
