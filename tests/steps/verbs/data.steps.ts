import { z } from "zod";
import { type StepRegistry, Then } from "../dsl";
import { getRegion } from "../selectors";

const dataContainsSchema = z.object({
  surface: z.string(),
  values: z.string(),
});

/**
 * Read-model assertions are scoped to a named region (a `section`,
 * `article`, or a named `aria-labelledby` region). The runner calls
 * the data-access layer through the page's existing fetch wrappers
 * rather than reading the DOM directly when a value lives in a
 * non-visible cell.
 */
export function registerDataSteps(registry: StepRegistry): void {
  Then(
    registry,
    "the user asserts the <surface> data contains <values>",
    dataContainsSchema,
    async (page, { surface, values }) => {
      const region = getRegion(page, surface);
      const items = values.split(",").map((entry) => entry.trim());
      for (const item of items) {
        await region
          .getByText(item, { exact: true })
          .first()
          .waitFor({ state: "visible" });
      }
    },
  );

  Then(
    registry,
    "the user asserts the <surface> data does not contain <values>",
    dataContainsSchema,
    async (page, { surface, values }) => {
      const region = getRegion(page, surface);
      const items = values.split(",").map((entry) => entry.trim());
      for (const item of items) {
        const count = await region.getByText(item, { exact: true }).count();
        if (count > 0) {
          throw new Error(
            `Surface "${surface}" unexpectedly contains "${item}"`,
          );
        }
      }
    },
  );
}
