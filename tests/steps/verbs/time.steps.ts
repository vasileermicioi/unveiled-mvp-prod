import { z } from "zod";
import { type StepRegistry, Then, When } from "../dsl";

const advanceSchema = z.object({ duration: z.string() });
const currentTimeSchema = z.object({ time: z.string() });

/**
 * The clock step is a runtime shim — it delegates to Playwright's
 * `page.clock` API when the application reads time from the browser
 * clock, and to a fake-timer override for server-rendered surfaces
 * (the 09-iteration runner wires the override). For this iteration
 * the step records the intent so the runner can fail loudly if a
 * feature file depends on time travel.
 */
export function registerTimeSteps(registry: StepRegistry): void {
  When(
    registry,
    "the user advances the clock by <duration>",
    advanceSchema,
    async (page, { duration }) => {
      const match = /^(\d+)(ms|s|m|h)$/i.exec(duration.trim());
      if (!match) {
        throw new Error(`Unsupported duration: ${duration}`);
      }
      const [, value, unit] = match;
      const ms = Number.parseInt(value, 10) * unitToMs(unit);
      const clock = (
        page as unknown as {
          clock?: { fastForward: (n: number) => Promise<void> };
        }
      ).clock;
      if (clock) {
        await clock.fastForward(ms);
        return;
      }
      throw new Error(
        `Time travel requested (${duration}) but page.clock is not available in this iteration. ` +
          `See 09-iteration for the fake-timer wiring.`,
      );
    },
  );

  Then(
    registry,
    "the user asserts the current time is <time>",
    currentTimeSchema,
    async (page, { time }) => {
      await page.evaluate((expected) => {
        const now = new Date();
        const [date, tz] = expected.split(" ");
        if (date && now.toISOString().slice(0, date.length) !== date) {
          throw new Error(
            `Expected current time to start with ${date}, got ${now.toISOString()}`,
          );
        }
        void tz;
      }, time);
    },
  );
}

function unitToMs(unit: string): number {
  switch (unit.toLowerCase()) {
    case "ms":
      return 1;
    case "s":
      return 1000;
    case "m":
      return 60_000;
    case "h":
      return 3_600_000;
    default:
      throw new Error(`Unknown unit: ${unit}`);
  }
}
