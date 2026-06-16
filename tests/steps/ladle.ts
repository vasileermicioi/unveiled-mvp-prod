import type { Page } from "@playwright/test";
import { dispatch, type StepDefinition } from "./dsl";
import { sharedRegistry } from "./ladle-helpers";

export type StoryStepKind = StepDefinition<never>["kind"];

export interface RunStepInLadleOptions {
  scenarioName: string;
  featurePath: string;
}

/**
 * Navigate the test page to the Ladle URL for `(component, story)`
 * and dispatch the given step against the resulting Ladle page.
 * The helper re-uses the shared step registry exported by
 * `tests/steps/dsl.ts` so the proximity+layout selector discipline is
 * preserved verbatim when the step is executed inside Ladle.
 *
 * The helper is the single entry point that opens a Ladle page.
 * It throws a descriptive error when the page cannot be reached —
 * it never falls back to the real route. The real-route runner
 * (`tests/parity/gherkin.spec.ts`) is responsible for skipping
 * scenarios that carry a `@ladle(...)` tag so the dispatch here is
 * the only execution path for tagged scenarios.
 */
export async function runStepInLadle(
  page: Page,
  storyUrl: string,
  stepKind: StoryStepKind,
  stepText: string,
  options: RunStepInLadleOptions,
): Promise<void> {
  if (page.url() !== storyUrl) {
    await page.goto(storyUrl, { waitUntil: "domcontentloaded" });
  }
  try {
    await dispatch(sharedRegistry, page, stepKind, stepText);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Ladle step failed at ${storyUrl} for scenario "${options.scenarioName}" in ${options.featurePath}: ${message}`,
    );
  }
}
