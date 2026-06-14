import { z } from "zod";
import { type StepRegistry, When } from "../dsl";

const routeSchema = z.object({ route: z.string().startsWith("/") });

export function registerNavigationSteps(registry: StepRegistry): void {
  When(
    registry,
    "the user navigates to <route>",
    routeSchema,
    async (page, { route }) => {
      const target = new URL(
        route,
        page.url() || "http://localhost:4321",
      ).toString();
      await page.goto(target, { waitUntil: "domcontentloaded" });
    },
  );
}
