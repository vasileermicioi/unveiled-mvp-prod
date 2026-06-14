import { z } from "zod";
import { type StepRegistry, When } from "../dsl";

const routeSchema = z.object({ route: z.string().startsWith("/") });

export function registerNavigationSteps(registry: StepRegistry): void {
  When(
    registry,
    "the user navigates to <route>",
    routeSchema,
    async (page, { route }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
    },
  );
}
