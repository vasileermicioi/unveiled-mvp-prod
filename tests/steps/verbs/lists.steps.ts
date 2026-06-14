import { z } from "zod";
import { type StepRegistry, Then, When } from "../dsl";
import { getNthInside, getRegion } from "../selectors";

const openItemSchema = z.object({
  nth: z.string(),
  list: z.string(),
});

const assertItemSchema = z.object({
  nth: z.string(),
  list: z.string(),
  text: z.string(),
});

function parseNth(raw: string): number {
  const n = Number.parseInt(raw.replace(/\D+/g, ""), 10);
  if (Number.isNaN(n) || n < 1) {
    throw new Error(`Expected a positive integer for nth, got: ${raw}`);
  }
  return n - 1;
}

export function registerListsSteps(registry: StepRegistry): void {
  When(
    registry,
    "the user opens the <nth> item in <list>",
    openItemSchema,
    async (page, { nth, list }) => {
      const index = parseNth(nth);
      const region = getRegion(page, list);
      const article = getNthInside(page, list, "article", index);
      const link = article.getByRole("link").first();
      if ((await link.count()) > 0) {
        await link.click();
      } else {
        void region;
        await article.click();
      }
    },
  );

  Then(
    registry,
    "the user asserts the <nth> item in <list> shows <text>",
    assertItemSchema,
    async (page, { nth, list, text }) => {
      const index = parseNth(nth);
      const article = getNthInside(page, list, "article", index);
      await article
        .getByText(text, { exact: true })
        .first()
        .waitFor({ state: "visible" });
    },
  );
}
