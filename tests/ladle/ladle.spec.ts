import { readFileSync } from "node:fs";
import { relative, sep } from "node:path";
import type { TestInfo } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { runStepInLadle } from "../steps/ladle";
import {
  coalesceKind,
  findLadleTag,
  LADLE_TAG,
  ladleUrlFor,
  type ParsedScenario,
  parseFeature,
  parseLadleBody,
  sharedRegistry,
  walkFeatures,
} from "../steps/ladle-helpers";

const FEATURE_ROOT = "tests/features";
const LADLE_URL = process.env.LADLE_URL ?? "http://localhost:4321/ladle/";

function loadFeatures(): {
  path: string;
  rel: string;
  scenarios: ParsedScenario[];
}[] {
  return walkFeatures(FEATURE_ROOT).map((path) => {
    const parsed = parseFeature(readFileSync(path, "utf8"));
    return {
      path,
      rel: relative(".", path).split(sep).join("/"),
      scenarios: parsed.scenarios,
    };
  });
}

async function runLadleScenario(
  page: import("@playwright/test").Page,
  scenario: ParsedScenario,
  featurePath: string,
  testInfo: TestInfo,
): Promise<void> {
  const ladleTag = findLadleTag(scenario);
  if (!ladleTag) {
    test.skip(true, "no @ladle tag — handled by the real-route runner");
    return;
  }
  const body = LADLE_TAG.exec(ladleTag)?.groups?.body;
  if (!body) {
    test.skip(true, `@ladle tag is missing body — "${ladleTag}"`);
    return;
  }
  const parsed = parseLadleBody(body);
  if (!parsed) {
    throw new Error(
      `@ladle tag body "${body}" does not match component=…, story=… (scenario "${scenario.name}", feature ${featurePath})`,
    );
  }
  const storyUrl = ladleUrlFor(LADLE_URL, parsed.component, parsed.story);
  const allSteps = [...(scenario.background ?? []), ...scenario.steps];
  let lastKind: "Given" | "When" | "Then" = "Given";
  for (const step of allSteps) {
    const kind = coalesceKind(lastKind, step.kind);
    lastKind = kind;
    await runStepInLadle(page, storyUrl, kind, step.text, {
      scenarioName: scenario.name,
      featurePath: relative(".", featurePath),
    });
  }
  testInfo.setTimeout(testInfo.timeout + 5_000);
}

const FEATURES = loadFeatures();

for (const { path, rel, scenarios } of FEATURES) {
  for (const scenario of scenarios) {
    test(`ladle :: ${rel} :: ${scenario.name}`, async ({ page }, testInfo) => {
      await runLadleScenario(page, scenario, path, testInfo);
    });
  }
}

test("ladle registry has steps registered", () => {
  expect(sharedRegistry.all().length).toBeGreaterThan(0);
});
