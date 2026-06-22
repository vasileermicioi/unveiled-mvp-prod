import { z } from "zod";
import { type StepRegistry, Then, When } from "../dsl";

const waitSchema = z.object({ request: z.string() });
const responseSchema = z.object({ status: z.string() });
const locationSchema = z.object({ location: z.string() });
const contentTypeSchema = z.object({ contentType: z.string() });

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

  Then(
    registry,
    "the response status is <status>",
    responseSchema,
    async (page, { status }) => {
      const code = Number.parseInt(status, 10);
      if (Number.isNaN(code)) {
        throw new Error(`Expected a numeric HTTP status, got: ${status}`);
      }
      const actual = (page as unknown as { __lastStatus?: number })
        .__lastStatus;
      if (actual !== code) {
        throw new Error(
          `Expected status ${code}, got ${actual} for ${page.url()}`,
        );
      }
    },
  );

  Then(
    registry,
    "the Location header is <location>",
    locationSchema,
    async (page, { location }) => {
      const actual = (page as unknown as { __lastLocation?: string })
        .__lastLocation;
      if (actual !== location) {
        throw new Error(
          `Expected Location header "${location}", got "${actual}" for ${page.url()}`,
        );
      }
    },
  );

  Then(
    registry,
    "the Content-Type is <contentType>",
    contentTypeSchema,
    async (page, { contentType }) => {
      const actual = (page as unknown as { __lastContentType?: string })
        .__lastContentType;
      if (!actual?.includes(contentType)) {
        throw new Error(
          `Expected Content-Type to contain "${contentType}", got "${actual}" for ${page.url()}`,
        );
      }
    },
  );
}
