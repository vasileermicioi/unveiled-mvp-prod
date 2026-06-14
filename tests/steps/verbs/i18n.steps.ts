import { z } from "zod";
import { type StepRegistry, Then, When } from "../dsl";
import { seedLanguages } from "../seed";
import { getButtonInside, getLinkInside } from "../selectors";

const langSchema = z.object({ lang: z.enum(seedLanguages) });

export function registerI18nSteps(registry: StepRegistry): void {
  When(
    registry,
    "the user switches the language to <lang>",
    langSchema,
    async (page, { lang }) => {
      const toggle =
        (await getButtonInside(page, "header", lang.toUpperCase()).count()) > 0
          ? getButtonInside(page, "header", lang.toUpperCase())
          : getLinkInside(page, "header", lang.toUpperCase());
      await toggle.first().click();
    },
  );

  Then(
    registry,
    "the user asserts the active language is <lang>",
    langSchema,
    async (page, { lang }) => {
      const cookies = await page.context().cookies();
      const cookie = cookies.find((entry) => entry.name === "unveiled_lang");
      if (!cookie) {
        throw new Error("unveiled_lang cookie is not set");
      }
      if (cookie.value.toLowerCase() !== lang.toLowerCase()) {
        throw new Error(
          `Expected active language ${lang}, got ${cookie.value}`,
        );
      }
    },
  );
}
