import { z } from "zod";
import { type StepRegistry, Then } from "../dsl";
import { byExactText, byLabel, byRole, getRegion } from "../selectors";

/**
 * Class-name assertions consume the design tokens at runtime. The
 * `unveiled-border` / `unveiled-shadow` strings are exported from the
 * `design-tokens` capability (see `src/lib/design-tokens.ts`). They
 * are referenced here by name to keep the assertions in sync with the
 * token definitions; a token rename in `design-tokens.json` will fail
 * the type check, not a downstream test.
 */
const TOKEN_CLASSES = {
  brandYellow: "unveiled-border-brand-yellow",
  card: "unveiled-card",
  shadow: "unveiled-shadow",
} as const;

const assertSchema = z.object({ assertion: z.string() });

export function registerVisualSteps(registry: StepRegistry): void {
  Then(
    registry,
    "the user asserts <assertion>",
    assertSchema,
    async (page, { assertion }) => {
      const trimmed = assertion.trim();

      if (trimmed === "the page renders the brand-yellow border") {
        await page
          .locator(`.${TOKEN_CLASSES.brandYellow}`)
          .first()
          .waitFor({ state: "visible" });
        return;
      }

      if (trimmed === "the page renders the unveiled card style") {
        await page
          .locator(`.${TOKEN_CLASSES.card}`)
          .first()
          .waitFor({ state: "visible" });
        return;
      }

      if (trimmed === "the page renders the unveiled shadow") {
        await page
          .locator(`.${TOKEN_CLASSES.shadow}`)
          .first()
          .waitFor({ state: "visible" });
        return;
      }

      const labelled = /^the page shows the label "([^"]+)"$/i.exec(trimmed);
      if (labelled) {
        await byLabel(page, labelled[1]).first().waitFor({ state: "visible" });
        return;
      }

      const headerText = /^the page shows the heading "([^"]+)"$/i.exec(
        trimmed,
      );
      if (headerText) {
        await byRole(page, "heading", { name: headerText[1] })
          .first()
          .waitFor({ state: "visible" });
        return;
      }

      const landmarkText =
        /^the (header|nav|main|footer|dialog) shows "([^"]+)"$/i.exec(trimmed);
      if (landmarkText) {
        const [, landmark, text] = landmarkText;
        await getRegion(page, landmark)
          .getByText(text, { exact: true })
          .first()
          .waitFor({ state: "visible" });
        return;
      }

      const missingKey =
        /^the missing-key placeholder for "([^"]+)" is visible$/i.exec(trimmed);
      if (missingKey) {
        await byExactText(page, `{i18n.missing:${missingKey[1]}}`)
          .first()
          .waitFor({ state: "visible" });
        return;
      }

      throw new Error(`Unknown visual assertion: ${assertion}`);
    },
  );
}
