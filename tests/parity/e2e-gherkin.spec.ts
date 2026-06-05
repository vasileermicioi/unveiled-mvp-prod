import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "@playwright/test";
import { runStep } from "../steps/step-definitions";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GherkinStep {
  keyword: string;
  text: string;
}

interface GherkinScenario {
  name: string;
  steps: GherkinStep[];
  isMobile: boolean;
}

interface GherkinFeature {
  name: string;
  scenarios: GherkinScenario[];
}

function parseFeatureFile(filePath: string): GherkinFeature {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);

  const feature: GherkinFeature = { name: "", scenarios: [] };
  let currentScenario: GherkinScenario | null = null;
  let nextScenarioIsMobile = false;

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;

    // Check tags
    if (line.startsWith("@mobile")) {
      nextScenarioIsMobile = true;
      continue;
    }

    if (line.startsWith("Feature:")) {
      feature.name = line.slice("Feature:".length).trim();
      continue;
    }

    if (line.startsWith("Scenario:") || line.startsWith("Example:")) {
      const name = line.startsWith("Scenario:")
        ? line.slice("Scenario:".length).trim()
        : line.slice("Example:".length).trim();
      currentScenario = { name, steps: [], isMobile: nextScenarioIsMobile };
      feature.scenarios.push(currentScenario);
      nextScenarioIsMobile = false;
      continue;
    }

    const match = line.match(/^(Given|When|Then|And|But)\s+(.*)$/i);
    if (match && currentScenario) {
      currentScenario.steps.push({
        keyword: match[1],
        text: match[2].trim(),
      });
    }
  }

  return feature;
}

// Locate and parse all features
const featuresDir = path.join(__dirname, "../features");
if (fs.existsSync(featuresDir)) {
  const files = fs
    .readdirSync(featuresDir)
    .filter((file) => file.endsWith(".feature"));

  for (const file of files) {
    const filePath = path.join(featuresDir, file);
    const feature = parseFeatureFile(filePath);

    test.describe(feature.name, () => {
      // Run scenarios sequentially
      test.describe.configure({ mode: "serial" });

      for (const scenario of feature.scenarios) {
        test(scenario.name, async ({ page, context }) => {
          if (scenario.isMobile) {
            await page.setViewportSize({ width: 375, height: 667 });
          } else {
            await page.setViewportSize({ width: 1280, height: 800 });
          }

          for (const step of scenario.steps) {
            await test.step(`${step.keyword} ${step.text}`, async () => {
              await runStep(page, step.text);
            });
          }
        });
      }
    });
  }
}
