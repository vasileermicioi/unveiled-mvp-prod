import { z } from "zod";
import { type StepRegistry, When } from "../dsl";
import { getRegion } from "../selectors";

export function registerModalsSteps(registry: StepRegistry): void {
  When(registry, "the user confirms the modal", z.object({}), async (page) => {
    const dialog = getRegion(page, "dialog");
    await dialog
      .getByRole("button", { name: /confirm|yes|continue|ok|book|accept/i })
      .first()
      .click();
  });

  When(registry, "the user dismisses the modal", z.object({}), async (page) => {
    const dialog = getRegion(page, "dialog");
    await dialog
      .getByRole("button", { name: /cancel|close|dismiss|no|back/i })
      .first()
      .click();
  });
}
