import { z } from "zod";
import { type StepRegistry, Then, When } from "../dsl";
import { getRegion } from "../selectors";

const landmarkSchema = z.object({
  landmark: z.string(),
});

const attributeSchema = z.object({
  landmark: z.string(),
  selector: z.string(),
  attribute: z.string(),
  value: z.string(),
});

function resolveLandmark(
  page: Parameters<typeof getRegion>[0],
  landmark: string,
) {
  if (landmark.startsWith("#")) {
    return page.locator(landmark);
  }
  return getRegion(page, landmark);
}

export function registerA11ySteps(registry: StepRegistry): void {
  When(
    registry,
    "the user activates the disclosure in <landmark>",
    landmarkSchema,
    async (page, { landmark }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      const region = resolveLandmark(page, landmark);
      const button = region
        .locator("button[aria-controls][aria-expanded]")
        .first();
      await button.click();
    },
  );

  When(
    registry,
    "the user dismisses <landmark> via the close control",
    landmarkSchema,
    async (page, { landmark }) => {
      const region = resolveLandmark(page, landmark);
      const close = region
        .locator('#shell-mobile-drawer button[aria-label^="Close"]')
        .first();
      await close.click();
    },
  );

  Then(
    registry,
    'the user asserts <landmark> exposes <selector> with <attribute>="<value>"',
    attributeSchema,
    async (page, { landmark, selector, attribute, value }) => {
      const region = resolveLandmark(page, landmark);
      const target = region.locator(selector).first();
      await target.waitFor({ state: "attached" });
      const actual = await target.getAttribute(attribute);
      if (actual !== value) {
        throw new Error(
          `Expected ${selector} ${attribute}="${value}" in ${landmark}, got "${actual}"`,
        );
      }
    },
  );
}
