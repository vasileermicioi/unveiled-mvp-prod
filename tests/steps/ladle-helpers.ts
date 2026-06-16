import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { StepRegistry } from "./dsl";
import { registerAllSteps } from "./verbs";

export const LADLE_TAG = /^@ladle\((?<body>[^)]+)\)$/;

export interface ParsedStep {
  kind: "Given" | "When" | "Then" | "And" | "But";
  text: string;
}

export interface ParsedScenario {
  name: string;
  tags: string[];
  steps: ParsedStep[];
  background?: ParsedStep[];
}

export interface ParsedFeature {
  title: string;
  scenarios: ParsedScenario[];
}

export function walkFeatures(root: string): string[] {
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

export function parseFeature(source: string): ParsedFeature {
  const lines = source.split(/\r?\n/);
  let title = "";
  let i = 0;
  const scenarios: ParsedScenario[] = [];
  let currentScenario: ParsedScenario | null = null;
  let currentBackground: ParsedStep[] | null = null;
  let inBackground = false;
  let tagBuffer: string[] = [];

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
      const tags = trimmed.match(/@[\w-]+(?:\([^)]*\))?/g) ?? [];
      if (currentScenario && currentScenario.steps.length === 0) {
        currentScenario.tags.push(...tags);
      } else {
        tagBuffer.push(...tags);
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
      currentScenario = null;
      const [, , name] = scenarioMatch;
      currentScenario = {
        name: name.trim(),
        tags: [...tagBuffer],
        steps: [],
        background: currentBackground ? [...currentBackground] : undefined,
      };
      tagBuffer = [];
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

export function findLadleTag(scenario: ParsedScenario): string | undefined {
  return scenario.tags.find((tag) => tag.startsWith("@ladle"));
}

export function parseLadleBody(body: string): {
  component: string;
  story: string;
} | null {
  const match =
    /component=(?<component>[^,]+),\s*story=(?<story>[^,\s)]+)/.exec(body);
  if (!match?.groups) return null;
  return {
    component: match.groups.component.trim(),
    story: match.groups.story.trim(),
  };
}

export function ladleUrlFor(
  base: string,
  component: string,
  story: string,
): string {
  const normalized = base.replace(/\/$/, "");
  const id = `${component}--${story}`.toLowerCase();
  return `${normalized}/?story=${id}`;
}

export function coalesceKind(
  lastKind: "Given" | "When" | "Then",
  kind: ParsedStep["kind"],
): "Given" | "When" | "Then" {
  if (kind === "And" || kind === "But") return lastKind;
  return kind;
}

export const sharedRegistry: StepRegistry = new StepRegistry();
registerAllSteps(sharedRegistry);
