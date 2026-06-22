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

  When(
    registry,
    "the visitor opens <route>",
    routeSchema,
    async (page, { route }) => {
      const baseUrl =
        process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4320";
      const url = new URL(route, baseUrl).toString();
      const response = await page.request.get(url, {
        maxRedirects: 0,
      });
      (page as unknown as { __lastStatus?: number }).__lastStatus =
        response.status();
      (page as unknown as { __lastLocation?: string }).__lastLocation =
        response.headers()["location"] ?? "";
      (page as unknown as { __lastContentType?: string }).__lastContentType =
        response.headers()["content-type"] ?? "";
    },
  );
}
