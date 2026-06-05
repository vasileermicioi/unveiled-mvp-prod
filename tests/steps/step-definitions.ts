import { expect, type Page } from "@playwright/test";
import { login, parityFixtureEmails } from "../parity/helpers";

export function getFieldLocator(page: Page, labelText: string) {
  // Locate a label span
  const labelSpan = page
    .locator("span.unveiled-meta")
    .filter({ hasText: labelText });
  // Find input, select, or textarea within the parent div of the label span
  const containerInput = labelSpan
    .first()
    .locator("xpath=..")
    .locator("input, select, textarea")
    .first();

  return containerInput
    .or(page.getByPlaceholder(labelText, { exact: false }))
    .or(page.getByLabel(labelText, { exact: false }))
    .first();
}

type StepFn = (page: Page, ...args: any[]) => Promise<void> | void;
const registry: Array<{ pattern: RegExp; fn: StepFn }> = [];

export function Given(pattern: RegExp, fn: StepFn) {
  registry.push({ pattern, fn });
}
export function When(pattern: RegExp, fn: StepFn) {
  registry.push({ pattern, fn });
}
export function Then(pattern: RegExp, fn: StepFn) {
  registry.push({ pattern, fn });
}

export async function runStep(page: Page, stepText: string) {
  for (const { pattern, fn } of registry) {
    const match = stepText.match(pattern);
    if (match) {
      const args = match.slice(1);
      await fn(page, ...args);
      return;
    }
  }
  throw new Error(`No matching step definition found for: "${stepText}"`);
}

// Register step definitions

Given(/^I am on the landing page$/, async (page) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator('input[type="email"]').first()).toBeVisible();
  await page.waitForTimeout(500);
});

When(/^I click the "([^"]+)" language toggle$/, async (page, language) => {
  await page
    .getByRole("button", { name: language, exact: true })
    .first()
    .click();
});

Then(/^the page URL should contain "([^"]+)"$/, async (page, path) => {
  await expect(page).toHaveURL(new RegExp(path));
});

Then(/^the page text should contain "([^"]+)"$/, async (page, text) => {
  await expect(page.locator("body")).toContainText(text);
});

When(
  /^I fill "([^"]+)" in the field nearest to "([^"]+)"$/,
  async (page, value, label) => {
    const field = getFieldLocator(page, label);
    await field.fill(value);
  },
);

When(/^I click the button with text "([^"]+)"$/, async (page, btnText) => {
  const formBtn = page
    .locator("form")
    .getByRole("button", { name: btnText })
    .first();
  if ((await formBtn.count()) > 0) {
    await formBtn.click();
  } else {
    await page.getByRole("button", { name: btnText }).first().click();
  }
});

Given(/^I am logged in as a "([^"]+)"$/, async (page, role) => {
  let email = "";
  let path = "";
  if (role === "member") {
    email = parityFixtureEmails.activeMember;
    path = "/en/app";
  } else if (role === "partner") {
    email = parityFixtureEmails.partner;
    path = "/en/partner";
  } else if (role === "admin") {
    email = parityFixtureEmails.admin;
    path = "/en/admin";
  }
  await login(page, email, path);
});

When(/^I navigate to "([^"]+)"$/, async (page, path) => {
  await page.goto(path).catch(() => {});
});

Then(/^the page URL should be "([^"]+)"$/, async (page, path) => {
  await expect(page).toHaveURL(new RegExp(`${path}$`));
});

When(
  /^I click the "([^"]+)" button on the event card with ID "([^"]+)"$/,
  async (page, btnText, id) => {
    const titleMap: Record<string, string> = {
      public: "Parity Public Opening",
      secret: "Parity Secret Access",
      voucher: "Parity Voucher Night",
      "sold-out": "Parity Sold Out Session",
      "check-in": "Parity Check-In Session",
    };
    const title = titleMap[id] || id;
    const card = page
      .locator("article")
      .filter({ has: page.locator("h3").filter({ hasText: title }) });
    await card.getByRole("button", { name: btnText }).click();
  },
);

Then(
  /^the booking modal header should contain "([^"]+)"$/,
  async (page, text) => {
    await expect(page.locator("h2").filter({ hasText: text })).toBeVisible();
  },
);

Then(/^the booking transaction should be successful$/, async (page) => {
  await expect(page.getByText("Booking success")).toBeVisible();
});

Then(/^the modal should present a unique redemption code$/, async (page) => {
  await expect(
    page.locator("p.font-display").filter({ hasText: "PARITY-" }).first(),
  ).toBeVisible();
});

Then(/^the modal should display a calendar download button$/, async (page) => {
  await expect(
    page
      .getByRole("button", { name: /Sync to life|In Kalender speichern/i })
      .first(),
  ).toBeVisible();
});

When(/^I click the calendar download button$/, async (page) => {
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: /Sync to life|In Kalender speichern/i })
    .first()
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain(".ics");
});

When(/^I click the admin tab "([^"]+)"$/, async (page, tab) => {
  const labels: Record<string, string[]> = {
    metrics: ["Metrics", "Kennzahlen"],
    events: ["Events"],
    partners: ["Partners", "Partner"],
    members: ["Members", "Mitglieder"],
  };
  const expectedLabels = labels[tab] || [tab];
  const button = page
    .getByRole("button")
    .filter({ hasText: new RegExp(`^(${expectedLabels.join("|")})$`, "i") });
  await button.first().click();
});

Then(/^the list page details should contain "([^"]+)"$/, async (page, text) => {
  await expect(page.locator("body")).toContainText(text);
});

When(/^a partner registers check-in for a member booking$/, async (page) => {
  await expect(page.getByText("Confirm your venue check-in")).toBeVisible();
  await page
    .getByRole("button", { name: "Check in" })
    .or(page.getByRole("button", { name: "Confirm check-in" }))
    .or(page.getByRole("button", { name: "Ready" }))
    .first()
    .click();
});

Then(/^the check-in status should update successfully$/, async (page) => {
  await expect(
    page.getByText("Ready").or(page.getByText("Checked in")),
  ).toBeVisible();
});

When(/^I click the mobile menu button$/, async (page) => {
  await page
    .getByRole("button", { name: "Open navigation menu", exact: true })
    .click();
});

Then(/^the navigation drawer should open$/, async (page) => {
  await expect(
    page.getByRole("button", { name: "Close navigation menu", exact: true }),
  ).toBeVisible();
});
