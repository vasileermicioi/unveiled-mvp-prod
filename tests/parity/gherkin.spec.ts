import { readFileSync } from "node:fs";
import { relative, sep } from "node:path";
import type { TestInfo } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { dispatch } from "../steps/dsl";
import { emailForRole, type Role } from "../steps/seed";
import {
  coalesceKind,
  findLadleTag,
  parseFeature,
  type ParsedScenario,
  sharedRegistry,
  LADLE_TAG,
  walkFeatures,
} from "../steps/ladle-helpers";

const FEATURE_ROOT = "tests/features";

async function runScenario(
  page: import("@playwright/test").Page,
  scenario: ParsedScenario,
  featurePath: string,
  testInfo: TestInfo,
): Promise<void> {
  const storyTag = findLadleTag(scenario);
  if (storyTag) {
    const body = LADLE_TAG.exec(storyTag)?.groups?.body;
    if (body) {
      test.skip(
        true,
        `@ladle(${body}) tag dispatched to storybook project (scenario "${scenario.name}", feature ${relative(
          ".",
          featurePath,
        )})`,
      );
    }
  }

  const allSteps = [...(scenario.background ?? []), ...scenario.steps];
  let lastKind: "Given" | "When" | "Then" = "Given";
  for (const step of allSteps) {
    const kind = coalesceKind(lastKind, step.kind);
    lastKind = kind;
    await dispatch(sharedRegistry, page, kind, step.text);
  }
  testInfo.setTimeout(testInfo.timeout + 5_000);
}

function selectFeaturesByTag(
  features: string[],
  filter: string | undefined,
): string[] {
  if (!filter) return features;
  const wanted = filter.split(",").map((entry) => entry.trim());
  return features.filter((feature) => {
    const parsed = parseFeature(readFileSync(feature, "utf8"));
    return parsed.scenarios.some((scenario) =>
      scenario.tags.some((tag) => wanted.includes(tag)),
    );
  });
}

const FEATURE_FILES = walkFeatures(FEATURE_ROOT);
const SELECTED = selectFeaturesByTag(
  FEATURE_FILES,
  process.env.BUN_GHERKIN_TAGS,
);

for (const featurePath of SELECTED) {
  const parsed = parseFeature(readFileSync(featurePath, "utf8"));
  const featureRel = relative(".", featurePath).split(sep).join("/");
  for (const scenario of parsed.scenarios) {
    test(`${featureRel} :: ${scenario.name}`, async ({ page }, testInfo) => {
      await runScenario(page, scenario, featurePath, testInfo);
    });
  }
}

test("registry has steps registered", () => {
  expect(sharedRegistry.all().length).toBeGreaterThan(0);
});

void emailForRole;
void ({} as Role);
