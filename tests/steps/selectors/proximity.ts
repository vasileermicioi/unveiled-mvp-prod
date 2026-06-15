import type { Locator, Page } from "@playwright/test";

/**
 * Resolve a label node to the nearest form control.
 * Supports two patterns:
 * - Legacy: the label wraps the input. `getByText(label)` finds the
 *   text node; the nearest `<label>` ancestor contains the field.
 * - Modern: the label uses `for` to point at an input `id`. The
 *   `for` value is read off the label and used to look up the
 *   matching field on the page.
 */
async function resolveFieldByLabel(
  page: Page,
  label: string,
  control: "input" | "textarea" | "select" | "input, textarea, select",
): Promise<Locator> {
  const textNode = page.getByText(label, { exact: true }).first();
  const labelFor = await textNode
    .locator(`xpath=ancestor::label[1]`)
    .getAttribute("for")
    .catch(() => null);
  if (labelFor) {
    return page.locator(`${control}#${labelFor}`).first();
  }
  return textNode
    .locator(`xpath=ancestor::label[1]`)
    .locator(control)
    .first();
}

export async function getFieldNearestTo(
  page: Page,
  label: string,
): Promise<Locator> {
  return resolveFieldByLabel(page, label, "input, textarea, select");
}

export async function getInputNearestTo(
  page: Page,
  label: string,
): Promise<Locator> {
  return resolveFieldByLabel(page, label, "input");
}

export async function getTextareaNearestTo(
  page: Page,
  label: string,
): Promise<Locator> {
  return resolveFieldByLabel(page, label, "textarea");
}

export async function getSelectNearestTo(
  page: Page,
  label: string,
): Promise<Locator> {
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
