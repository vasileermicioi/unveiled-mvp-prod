import { z } from "zod";
import { type StepRegistry, When } from "../dsl";
import { getFieldNearestTo } from "../selectors";

const submitSchema = z.object({
  form: z.string(),
  values: z.string(),
});

const toggleSchema = z.object({ control: z.string() });

export function registerFormsSteps(registry: StepRegistry): void {
  When(
    registry,
    "the user submits <form> with <values>",
    submitSchema,
    async (page, { form, values }) => {
      const pairs = values.split(",").map((entry) => entry.trim());
      for (const pair of pairs) {
        const [label, value] = pair.split("=").map((entry) => entry.trim());
        if (!label || value === undefined) continue;
        const field = await getFieldNearestTo(page, label);
        const tag = await field.evaluate((node) => node.tagName.toLowerCase());
        if (tag === "select") {
          await field.selectOption(value);
        } else if (tag === "input") {
          const type = await field.getAttribute("type");
          if (type === "checkbox" || type === "radio") {
            await field.check();
          } else {
            await field.fill(value);
          }
        } else {
          await field.fill(value);
        }
      }
      const submitButton = page
        .getByRole("button", {
          name: /submit|save|continue|book|confirm|sign ?up|log ?in|subscribe/i,
        })
        .first();
      await submitButton.click();
      void form;
    },
  );

  When(
    registry,
    "the user toggles <control>",
    toggleSchema,
    async (page, { control }) => {
      const toggle = page
        .getByRole("button", { name: control, exact: true })
        .or(page.getByRole("switch", { name: control, exact: true }))
        .or(page.getByRole("checkbox", { name: control, exact: true }))
        .first();
      await toggle.click();
    },
  );
}
