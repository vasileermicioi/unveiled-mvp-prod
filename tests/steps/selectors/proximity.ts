import type { Locator, Page } from "@playwright/test";

/**
 * Resolve a label node to the nearest form control.
 * Mirrors the existing pattern in legacy `step-definitions.ts`:
 * find the label whose text matches `label`, then return the field
 * (input, textarea, select) that is the closest sibling within the
 * same `<label>` element, or the first such field beneath the label
 * if it wraps the field.
 */
function resolveFieldByLabel(
  page: Page,
  label: string,
  control: "input" | "textarea" | "select" | "input, textarea, select",
): Locator {
  const labelLocator = page.getByText(label, { exact: true }).first();
  return labelLocator
    .locator(`xpath=ancestor::label[1]`)
    .locator(control)
    .first();
}

export function getFieldNearestTo(page: Page, label: string): Locator {
  return resolveFieldByLabel(page, label, "input, textarea, select");
}

export function getInputNearestTo(page: Page, label: string): Locator {
  return resolveFieldByLabel(page, label, "input");
}

export function getTextareaNearestTo(page: Page, label: string): Locator {
  return resolveFieldByLabel(page, label, "textarea");
}

export function getSelectNearestTo(page: Page, label: string): Locator {
  return resolveFieldByLabel(page, label, "select");
}

/**
 * Resolve a button or link by name inside a named landmark
 * (e.g. "header", "nav", "main", "footer", "dialog", or a landmark name
 * declared in the application as an `aria-label` / `aria-labelledby`).
 */
export function getButtonInside(
  page: Page,
  landmark: string,
  name: string,
): Locator {
  const region = resolveLandmark(page, landmark);
  return region.getByRole("button", { name, exact: true });
}

export function getLinkInside(
  page: Page,
  landmark: string,
  name: string,
): Locator {
  const region = resolveLandmark(page, landmark);
  return region.getByRole("link", { name, exact: true });
}

export function getLinkNearestTo(page: Page, label: string): Locator {
  return page
    .getByText(label, { exact: true })
    .locator("xpath=ancestor::a[1]")
    .first();
}

function resolveLandmark(page: Page, landmark: string): Locator {
  const lower = landmark.toLowerCase();
  if (
    [
      "header",
      "nav",
      "main",
      "footer",
      "aside",
      "section",
      "article",
      "dialog",
    ].includes(lower)
  ) {
    return page.locator(lower).first();
  }
  return page.getByRole("region", { name: landmark }).first();
}
