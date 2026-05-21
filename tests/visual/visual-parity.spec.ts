import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";
import { db, postgresClient } from "../../src/db/client";
import { user, userProfiles } from "../../src/db/schema";
import {
  expectVisualParity,
  login,
  parityFixtureEmails,
  parityFixtureIds,
} from "./helpers";

const viewports = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 375, height: 667 },
];

for (const viewport of viewports) {
  test.describe(`Visual regression: ${viewport.name}`, () => {
    test.describe.configure({ mode: "serial" });
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    // Guest / Public routes
    test("public landing page", async ({ page }) => {
      await page.goto("/");
      await page.waitForSelector('text="Culture before it goes public."', {
        state: "visible",
      });
      await expectVisualParity(page, `public-landing-${viewport.name}.png`);
    });

    test("public discover page", async ({ page }) => {
      await page.goto("/discover");
      await page.waitForSelector('text="This week inside Unveiled."', {
        state: "visible",
      });
      await expectVisualParity(page, `public-discover-${viewport.name}.png`);
    });

    test("public discover page with map", async ({ page }) => {
      await page.goto("/discover");
      await page.waitForSelector('text="This week inside Unveiled."', {
        state: "visible",
      });
      await expect(async () => {
        await page.getByRole("button", { name: "Explore map" }).click();
        await expect(page.locator('text="Mitte Art"')).toBeVisible();
      }).toPass({ timeout: 5000 });
      await expectVisualParity(
        page,
        `public-discover-map-${viewport.name}.png`,
      );
    });

    test("public how-it-works page", async ({ page }) => {
      await page.goto("/how-it-works");
      await page.waitForSelector('text="Credits become cultural access."', {
        state: "visible",
      });
      await expectVisualParity(
        page,
        `public-how-it-works-${viewport.name}.png`,
      );
    });

    test("public membership page", async ({ page }) => {
      await page.goto("/membership");
      await page.waitForSelector('text="Basic Berlin"', { state: "visible" });
      await expectVisualParity(page, `public-membership-${viewport.name}.png`);
    });

    test("public FAQ page", async ({ page }) => {
      await page.goto("/faq");
      await page.waitForSelector('text="Questions before access?"', {
        state: "visible",
      });
      await expectVisualParity(page, `public-faq-${viewport.name}.png`);
    });

    test("login modal page", async ({ page }) => {
      await page.goto("/?callbackURL=%2Fapp");
      await page.waitForSelector('text="Welcome back"', { state: "visible" });
      await expectVisualParity(page, `login-modal-${viewport.name}.png`);
    });

    test("signup modal page", async ({ page }) => {
      await page.goto("/?callbackURL=%2Fapp");
      await page.waitForSelector('text="Welcome back"', { state: "visible" });
      await expect(async () => {
        await page.getByRole("button", { name: "Register" }).click();
        await expect(page.locator('text="Create access"')).toBeVisible();
      }).toPass({ timeout: 5000 });
      await expectVisualParity(page, `signup-modal-${viewport.name}.png`);
    });

    // Member routes
    test("member app dashboard", async ({ page }) => {
      await login(page, parityFixtureEmails.activeMember, "/app");
      await page.waitForSelector('text="Today in Berlin."', {
        state: "visible",
      });
      await expectVisualParity(page, `member-dashboard-${viewport.name}.png`);
    });

    test("member app dashboard with map", async ({ page }) => {
      await login(page, parityFixtureEmails.activeMember, "/app");
      await page.waitForSelector('text="Today in Berlin."', {
        state: "visible",
      });
      await expect(async () => {
        await page.getByRole("button", { name: "Explore map" }).click();
        await expect(page.locator('text="Mitte Art"')).toBeVisible();
      }).toPass({ timeout: 5000 });
      await expectVisualParity(
        page,
        `member-dashboard-map-${viewport.name}.png`,
      );
    });

    test("member saved events", async ({ page }) => {
      await login(page, parityFixtureEmails.activeMember, "/saved");
      await page.waitForSelector('text="Parity Voucher Night"', {
        state: "visible",
      });
      await expectVisualParity(page, `member-saved-${viewport.name}.png`);
    });

    test("member bookings", async ({ page }) => {
      await login(page, parityFixtureEmails.activeMember, "/bookings");
      await page.waitForSelector('text="Your access codes."', {
        state: "visible",
      });
      await expectVisualParity(page, `member-bookings-${viewport.name}.png`);
    });

    test("member profile", async ({ page }) => {
      await login(page, parityFixtureEmails.activeMember, "/profile");
      await page.waitForSelector('text="Active Member"', { state: "visible" });
      await expectVisualParity(page, `member-profile-${viewport.name}.png`);
    });

    test("member onboarding", async ({ page }) => {
      const activeMemberUser = await db.query.user.findFirst({
        where: eq(user.email, parityFixtureEmails.activeMember),
      });
      if (!activeMemberUser) {
        throw new Error(
          `Could not find user with email ${parityFixtureEmails.activeMember}`,
        );
      }

      await db
        .update(userProfiles)
        .set({ onboardingComplete: false })
        .where(eq(userProfiles.userId, activeMemberUser.id));

      try {
        await login(page, parityFixtureEmails.activeMember, "/onboarding");

        // Wait for either the English or German version of the onboarding title
        const titleLocator = page.getByRole("heading", {
          name: /Make the feed yours|Mach den Feed zu deinem/i,
        });
        await expect(titleLocator.first()).toBeVisible();

        // If the page is in German, click the EN toggle
        const isGerman = await page
          .locator('text="Mach den Feed zu deinem."')
          .isVisible();
        if (isGerman) {
          await page.getByRole("button", { name: "EN" }).first().click();
          await page.waitForSelector('text="Make the feed yours."', {
            state: "visible",
          });
        }

        await expectVisualParity(
          page,
          `member-onboarding-${viewport.name}.png`,
        );
      } finally {
        await db
          .update(userProfiles)
          .set({ onboardingComplete: true })
          .where(eq(userProfiles.userId, activeMemberUser.id));
      }
    });

    // Partner routes
    test("partner portal dashboard", async ({ page }) => {
      await login(page, parityFixtureEmails.partner, "/partner");
      await page.waitForSelector('text="Partner portal"', { state: "visible" });
      await expectVisualParity(page, `partner-dashboard-${viewport.name}.png`);
    });

    test("venue check-in guest login screen", async ({ page }) => {
      const venuePath = `/venue-check-in/${parityFixtureIds.partner}?token=PARITY-VENUE-CHECK-IN`;
      await page.goto(venuePath);
      await page.waitForSelector('text="Sign in to check in"', {
        state: "visible",
      });
      await expectVisualParity(
        page,
        `venue-check-in-login-${viewport.name}.png`,
      );
    });

    test("venue check-in confirm check-in screen", async ({ page }) => {
      const venuePath = `/venue-check-in/${parityFixtureIds.partner}?token=PARITY-VENUE-CHECK-IN`;
      await page.goto(venuePath);
      await page.waitForSelector('text="Sign in to check in"', {
        state: "visible",
      });
      await login(page, parityFixtureEmails.activeMember, venuePath);
      await page.waitForSelector('text="Confirm your venue check-in"', {
        state: "visible",
      });
      await expectVisualParity(
        page,
        `venue-check-in-confirm-${viewport.name}.png`,
      );
    });

    // Admin routes
    test("admin operations overview", async ({ page }) => {
      await login(page, parityFixtureEmails.admin, "/admin");
      await page.waitForSelector('text="Operations overview."', {
        state: "visible",
      });
      await expectVisualParity(page, `admin-dashboard-${viewport.name}.png`);
    });
  });
}

test.afterAll(async () => {
  await postgresClient.end();
});
