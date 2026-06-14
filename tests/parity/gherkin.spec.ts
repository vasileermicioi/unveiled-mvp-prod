import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type { Page, TestInfo } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { type StepArgs, type StepDefinition, StepRegistry } from "../steps/dsl";
import { emailForRole, type Role } from "../steps/seed";
import { registerAllSteps } from "../steps/verbs";

const FEATURE_ROOT = "tests/features";
const STORY_TAG = /^@story\((?<body>[^)]+)\)$/;

interface ParsedStep {
  kind: "Given" | "When" | "Then" | "And" | "But";
  text: string;
}

interface ParsedScenario {
  name: string;
  tags: string[];
  steps: ParsedStep[];
  background?: ParsedStep[];
}

interface ParsedFeature {
  title: string;
  scenarios: ParsedScenario[];
}

const registry = new StepRegistry();
registerAllSteps(registry);

function walkFeatures(root: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(root)) {
    const full = join(root, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...walkFeatures(full));
    } else if (entry.endsWith(".feature")) {
      out.push(full);
    }
  }
  return out;
}

function parseFeature(source: string): ParsedFeature {
  const lines = source.split(/\r?\n/);
  let title = "";
  let i = 0;
  const scenarios: ParsedScenario[] = [];
  let currentScenario: ParsedScenario | null = null;
  let currentBackground: ParsedStep[] | null = null;
  let inBackground = false;

  const pushStep = (raw: string) => {
    const match = /^(Given|When|Then|And|But)\s+(.*)$/i.exec(raw.trim());
    if (!match) return;
    const [, kind, text] = match;
    const step: ParsedStep = { kind: kind as ParsedStep["kind"], text };
    if (inBackground && currentBackground) {
      currentBackground.push(step);
    } else if (currentScenario) {
      currentScenario.steps.push(step);
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    i++;

    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed.startsWith("@")) {
      const tags = trimmed.split(/\s+/).filter((tag) => tag.startsWith("@"));
      if (currentScenario) {
        currentScenario.tags.push(...tags);
      }
      continue;
    }

    if (trimmed.startsWith("Feature:")) {
      title = trimmed.slice("Feature:".length).trim();
      continue;
    }

    if (trimmed.startsWith("Background:")) {
      inBackground = true;
      currentBackground = [];
      continue;
    }

    const scenarioMatch = /^(Scenario|Scenario Outline):\s*(.*)$/i.exec(
      trimmed,
    );
    if (scenarioMatch) {
      if (currentScenario) {
        scenarios.push(currentScenario);
      }
      const [, , name] = scenarioMatch;
      currentScenario = {
        name: name.trim(),
        tags: [],
        steps: [],
        background: currentBackground ? [...currentBackground] : undefined,
      };
      inBackground = false;
      continue;
    }

    if (currentScenario) {
      pushStep(trimmed);
    }
  }

  if (currentScenario) scenarios.push(currentScenario);
  return { title, scenarios };
}

function stepArgs(def: StepDefinition<StepArgs>, stepText: string): StepArgs {
  const regex = new RegExp(`^${def.pattern.replace(/<(\w+)>/g, "(.+)")}$`);
  const match = regex.exec(stepText);
  if (!match) {
    throw new Error(
      `Pattern "${def.pattern}" did not match step "${stepText}"`,
    );
  }
  const keys = [...def.pattern.matchAll(/<(\w+)>/g)].map((m) => m[1]);
  const raw: Record<string, string> = {};
  keys.forEach((key, idx) => {
    raw[key] = match[idx + 1];
  });
  return def.args.parse(raw);
}

async function runScenario(
  page: Page,
  scenario: ParsedScenario,
  featurePath: string,
  testInfo: TestInfo,
): Promise<void> {
  const storyTag = scenario.tags.find((tag) => tag.startsWith("@story"));
  if (storyTag) {
    const body = STORY_TAG.exec(storyTag)?.groups?.body;
    if (body) {
      console.warn(
        `@story(${body}) tag present on "${scenario.name}" (${relative(
          ".",
          featurePath,
        )}) but Storybook iframe runner is not yet implemented; falling back to the real route (see 09-iteration)`,
      );
    }
  }

  const allSteps = [...(scenario.background ?? []), ...scenario.steps];
  let lastKind: "Given" | "When" | "Then" = "Given";
  for (const step of allSteps) {
    let kind: "Given" | "When" | "Then";
    if (step.kind === "And" || step.kind === "But") {
      kind = lastKind;
    } else {
      kind = step.kind;
      lastKind = kind;
    }
    const def = registry.resolve(kind, step.text);
    if (!def) {
      throw new Error(
        `No step registered for ${kind} "${step.text}" (scenario "${scenario.name}", feature ${featurePath})`,
      );
    }
    const args = stepArgs(def, step.text);
    await def.run(page, args);
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
  expect(registry.all().length).toBeGreaterThan(0);
});

void emailForRole;
void ({} as Role);
