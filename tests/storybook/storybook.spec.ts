import { readFileSync } from "node:fs";
import { relative, sep } from "node:path";
import type { TestInfo } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { runStepInStory } from "../steps/storybook";
import {
  coalesceKind,
  findStoryTag,
  parseFeature,
  parseStoryBody,
  type ParsedScenario,
  sharedRegistry,
  STORY_TAG,
  storyUrlFor,
  walkFeatures,
} from "../steps/storybook-helpers";

const FEATURE_ROOT = "tests/features";
const STORYBOOK_URL = process.env.STORYBOOK_URL ?? "http://localhost:4321/storybook/";

function loadFeatures(): { path: string; rel: string; scenarios: ParsedScenario[] }[] {
  return walkFeatures(FEATURE_ROOT).map((path) => {
    const parsed = parseFeature(readFileSync(path, "utf8"));
    return {
      path,
      rel: relative(".", path).split(sep).join("/"),
      scenarios: parsed.scenarios,
    };
  });
}

async function runStoryScenario(
  page: import("@playwright/test").Page,
  scenario: ParsedScenario,
  featurePath: string,
  testInfo: TestInfo,
): Promise<void> {
  const storyTag = findStoryTag(scenario);
  if (!storyTag) {
    test.skip(true, "no @story tag — handled by the real-route runner");
    return;
  }
  const body = STORY_TAG.exec(storyTag)?.groups?.body;
  if (!body) {
    test.skip(true, `@story tag is missing body — "${storyTag}"`);
    return;
  }
  const parsed = parseStoryBody(body);
  if (!parsed) {
    throw new Error(
      `@story tag body "${body}" does not match component=…, story=… (scenario "${scenario.name}", feature ${featurePath})`,
    );
  }
  const storyUrl = storyUrlFor(STORYBOOK_URL, parsed.component, parsed.story);
  const allSteps = [...(scenario.background ?? []), ...scenario.steps];
  let lastKind: "Given" | "When" | "Then" = "Given";
  for (const step of allSteps) {
    const kind = coalesceKind(lastKind, step.kind);
    lastKind = kind;
    await runStepInStory(page, storyUrl, kind, step.text, {
      scenarioName: scenario.name,
      featurePath: relative(".", featurePath),
    });
  }
  testInfo.setTimeout(testInfo.timeout + 5_000);
}

const FEATURES = loadFeatures();

for (const { path, rel, scenarios } of FEATURES) {
  for (const scenario of scenarios) {
    test(`storybook :: ${rel} :: ${scenario.name}`, async ({ page }, testInfo) => {
      await runStoryScenario(page, scenario, path, testInfo);
    });
  }
}

test("storybook registry has steps registered", () => {
  expect(sharedRegistry.all().length).toBeGreaterThan(0);
});
