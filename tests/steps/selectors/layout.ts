import type { Locator, Page } from "@playwright/test";

/**
 * Layout-based selectors. The runner and every verb file MUST go
 * through these helpers instead of constructing raw CSS strings or
 * `getByText` chains.
 */

export function byRole(
  page: Page,
  role: Parameters<Page["getByRole"]>[0],
  options: Parameters<Page["getByRole"]>[1] = {},
): Locator {
  return page.getByRole(role, options);
}

export function byLabel(
  page: Page,
  label: string,
  options: { exact?: boolean } = {},
): Locator {
  return page.getByLabel(label, options);
}

/**
 * `getByText` is allowed ONLY when the literal text matters (e.g.
 * asserting on a missing-key placeholder). It is forbidden as part of
 * a "find me the card whose title is X" chain — use a landmark + role
 * filter for that.
 */
export function byExactText(page: Page, text: string): Locator {
  return page.getByText(text, { exact: true });
}

const SEMANTIC_LANDMARKS = [
  "article",
  "section",
  "nav",
  "main",
  "header",
  "footer",
  "dialog",
  "aside",
] as const;

export function getRegion(
  page: Page,
  landmark: (typeof SEMANTIC_LANDMARKS)[number] | string,
): Locator {
  if ((SEMANTIC_LANDMARKS as readonly string[]).includes(landmark)) {
    return page.locator(landmark).first();
  }
  return page.getByRole("region", { name: landmark }).first();
}

export function withinRegion(
  page: Page,
  landmark: (typeof SEMANTIC_LANDMARKS)[number] | string,
  selector: string,
): Locator {
  return getRegion(page, landmark).locator(selector);
}

/**
 * Find the Nth element of a given role inside a landmark.
 * The `Selector` union (`ProximitySelector` / `LayoutSelector`) allows
 * this for the "click the third event card" case without falling back
 * to CSS strings.
 */
export function getNthInside(
  page: Page,
  landmark: (typeof SEMANTIC_LANDMARKS)[number] | string,
  role: Parameters<Page["getByRole"]>[0],
  n: number,
  options: Parameters<Page["getByRole"]>[1] = {},
): Locator {
  return getRegion(page, landmark).getByRole(role, options).nth(n);
}
