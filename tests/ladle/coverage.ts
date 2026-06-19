#!/usr/bin/env bun
// Ladle coverage gate. Walks every feature file under tests/features,
// collects the @ladle(component=..., story=...) tags, asserts that a
// matching <ComponentName>.ladle.tsx file exists in the repo and
// exports the named story, walks every story file under src/components
// and tests/features, and asserts that every exported story is
// either referenced by a scenario or its file carries
// parameters.ladle.skipCoverage = true.
//
// The script is wired into bun run check and fails the build on any
// drift. It is the enforcement lever for the per-feature story
// obligation in the definition of done.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

interface ParsedTag {
  raw: string;
  line: number;
}

interface ParsedScenario {
  name: string;
  line: number;
  tags: ParsedTag[];
}

interface ParsedFeature {
  path: string;
  rel: string;
  scenarios: ParsedScenario[];
}

interface StoryRef {
  component: string;
  story: string;
  featureRel: string;
  scenarioName: string;
  line: number;
}

interface StoryFile {
  path: string;
  rel: string;
  component: string;
  keys: Set<string>;
  skipCoverage: boolean;
}

const FEATURE_ROOT = "tests/features";
const STORY_GLOBS = ["src/components", "tests/features", "tests/ladle"];
const STORY_TAG = /^@ladle\((?<body>[^)]+)\)$/;
const STORY_BODY = /component=(?<component>[^,]+),\s*story=(?<story>[^,\s)]+)/;
const STORY_KEY_RE =
  /export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*(?::\s*\w*(?:StoryObj|Story)\s*=|=)/g;
const PARAMETERS_RE = /parameters\s*:\s*\{[\s\S]*?\n\s*\}/m;
const SKIP_COVERAGE_RE = /skipCoverage\s*:\s*true/;

function walk(root: string, ext: string | null, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(root);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(root, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, ext, out);
    } else if (!ext || entry.endsWith(ext)) {
      out.push(full);
    }
  }
  return out;
}

function parseFeatureFile(path: string): ParsedFeature {
  const rel = relative(".", path).split(sep).join("/");
  const source = readFileSync(path, "utf8");
  const lines = source.split(/\r?\n/);
  const scenarios: ParsedScenario[] = [];
  let currentScenario: ParsedScenario | null = null;
  let tagBuffer: ParsedTag[] = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("@")) {
      const tagLine = i + 1;
      const tags: ParsedTag[] = [];
      const re = /@[\w-]+(?:\([^)]*\))?/g;
      let match: RegExpExecArray | null;
      while (true) {
        match = re.exec(trimmed);
        if (!match) break;
        tags.push({ raw: match[0], line: tagLine });
      }
      if (currentScenario) {
        currentScenario.tags.push(...tags);
      } else {
        tagBuffer = tags;
      }
      continue;
    }
    const scenarioMatch = /^(Scenario|Scenario Outline):\s*(.*)$/i.exec(
      trimmed,
    );
    if (scenarioMatch) {
      currentScenario = {
        name: scenarioMatch[2].trim(),
        line: i + 1,
        tags: tagBuffer,
      };
      scenarios.push(currentScenario);
      tagBuffer = [];
      continue;
    }
    if (
      trimmed &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("Feature:") &&
      !trimmed.startsWith("Background:") &&
      !currentScenario
    ) {
      tagBuffer = [];
    }
  }
  return { path, rel, scenarios };
}

function collectTaggedScenarios(features: ParsedFeature[]): StoryRef[] {
  const refs: StoryRef[] = [];
  for (const feature of features) {
    for (const scenario of feature.scenarios) {
      for (const tag of scenario.tags) {
        if (!tag.raw.startsWith("@ladle")) continue;
        const body = STORY_TAG.exec(tag.raw)?.groups?.body;
        if (!body) continue;
        const match = STORY_BODY.exec(body);
        if (!match?.groups) continue;
        refs.push({
          component: match.groups.component.trim(),
          story: match.groups.story.trim(),
          featureRel: feature.rel,
          scenarioName: scenario.name,
          line: tag.line,
        });
      }
    }
  }
  return refs;
}

function pascalToKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function resolveStoryFile(component: string): string | null {
  const candidates = new Set<string>([component, pascalToKebab(component)]);
  for (const root of STORY_GLOBS) {
    for (const path of walk(root, ".ladle.tsx")) {
      const base = path
        .split(sep)
        .pop()
        ?.replace(/\.ladle\.tsx$/, "");
      if (base && candidates.has(base)) return path;
    }
  }
  return null;
}

function kebabToPascal(name: string): string {
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function parseStoryFile(path: string): StoryFile {
  const source = readFileSync(path, "utf8");
  const keys = new Set<string>();
  for (const match of source.matchAll(STORY_KEY_RE)) {
    if (match[1]) keys.add(match[1]);
  }
  const parametersBlock = source.match(PARAMETERS_RE);
  const skipCoverage = parametersBlock
    ? SKIP_COVERAGE_RE.test(parametersBlock[0])
    : SKIP_COVERAGE_RE.test(source);
  const fileBase =
    path
      .split(sep)
      .pop()
      ?.replace(/\.ladle\.tsx$/, "") ?? "";
  const component = kebabToPascal(fileBase);
  return {
    path,
    rel: relative(".", path).split(sep).join("/"),
    component,
    keys,
    skipCoverage,
  };
}

function collectStoryFiles(): StoryFile[] {
  const files: StoryFile[] = [];
  for (const root of STORY_GLOBS) {
    for (const path of walk(root, ".ladle.tsx")) {
      files.push(parseStoryFile(path));
    }
  }
  return files;
}

interface Drift {
  kind: "missing-story-file" | "missing-story-key" | "unreferenced-story";
  message: string;
}

function checkCoverage(features: ParsedFeature[]): Drift[] {
  const refs = collectTaggedScenarios(features);
  const drift: Drift[] = [];
  const referencedKeys = new Set<string>();
  for (const ref of refs) {
    referencedKeys.add(`${ref.component}::${ref.story}`);
    const filePath = resolveStoryFile(ref.component);
    if (!filePath) {
      drift.push({
        kind: "missing-story-file",
        message: `Scenario "${ref.scenarioName}" (${ref.featureRel}:${ref.line}) references @ladle(component=${ref.component}, story=${ref.story}) but no ${ref.component}.ladle.tsx (or kebab-case ${pascalToKebab(ref.component)}.ladle.tsx) file was found under ${STORY_GLOBS.join(" or ")}. Expected at: ${STORY_GLOBS.map((root) => join(root, `${ref.component}.ladle.tsx`)).join(" or ")}.`,
      });
      continue;
    }
    const storyFile = parseStoryFile(filePath);
    if (!storyFile.keys.has(ref.story)) {
      drift.push({
        kind: "missing-story-key",
        message: `Scenario "${ref.scenarioName}" (${ref.featureRel}:${ref.line}) references @ladle(component=${ref.component}, story=${ref.story}) but ${storyFile.rel} does not export a story named "${ref.story}". Known keys: ${[...storyFile.keys].join(", ") || "<none>"}.`,
      });
    }
  }

  for (const file of collectStoryFiles()) {
    if (file.skipCoverage) continue;
    for (const key of file.keys) {
      if (referencedKeys.has(`${file.component}::${key}`)) continue;
      drift.push({
        kind: "unreferenced-story",
        message: `Story file ${file.rel} exports "${key}" but no gherkin scenario references @ladle(component=${file.component}, story=${key}). Either add a @ladle(...) tag to a scenario, or set parameters.ladle.skipCoverage = true on ${file.rel} to opt out.`,
      });
    }
  }

  return drift;
}

function main(): void {
  const features = walk(FEATURE_ROOT, ".feature").map(parseFeatureFile);
  const drift = checkCoverage(features);
  if (drift.length === 0) {
    const storyFileCount = collectStoryFiles().length;
    console.log(
      `[ladle:coverage] OK — ${features.length} feature files, ${storyFileCount} story files, no drift`,
    );
    process.exit(0);
  }
  console.error(`[ladle:coverage] FAILED — ${drift.length} drift item(s):`);
  for (const item of drift) {
    console.error(`  - [${item.kind}] ${item.message}`);
  }
  process.exit(1);
}

main();
