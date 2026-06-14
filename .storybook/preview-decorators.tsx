import type { Decorator } from "@storybook/react";

/**
 * Storybook decorator that wraps every story with the mock auth + i18n
 * contexts the 09-iteration definition of done requires (item 3 in
 * `09-iteration/00-summary.md`). The real auth and i18n providers are
 * not wired into the storybook iframe, so each story renders against
 * a deterministic stub.
 */
export const withMockAppContexts: Decorator = (Story) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = "en";
  }
  return Story();
};
