import { z } from "zod";
import { type StepRegistry, Then, When } from "../dsl";

const waitSchema = z.object({ request: z.string() });
const responseSchema = z.object({ status: z.string() });

export function registerNetworkSteps(registry: StepRegistry): void {
  When(
    registry,
    "the user waits for <request> to complete",
    waitSchema,
    async (page, { request }) => {
      await page.waitForResponse(
        (response) =>
          response.url().includes(request) && response.status() < 500,
        { timeout: 10_000 },
      );
    },
  );

  Then(
    registry,
    "the user asserts the response is <status>",
    responseSchema,
    async (page, { status }) => {
      const code = Number.parseInt(status, 10);
      if (Number.isNaN(code)) {
        throw new Error(`Expected a numeric HTTP status, got: ${status}`);
      }
      const last = page.waitForResponse(
        (response) => response.status() === code,
        { timeout: 10_000 },
      );
      await last;
    },
  );
}
