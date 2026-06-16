## Purpose

Define the shared Ladle Playwright runner extension that opens a Ladle story from a tagged Gherkin scenario and re-issues the existing step dispatcher against it, plus the coverage script that asserts every `@ladle(component=..., story=...)` tag has a matching per-feature story.
## Requirements
### Requirement: Ladle Playwright Project
The repository SHALL register a second Playwright project under `tests/ladle/playwright.config.ts` that is selected when a scenario carries a `@ladle(component=..., story=...)` tag, alongside the existing real-route project under `tests/parity/`. The ladle project SHALL consume the same `tests/steps/dsl.ts` registry as the real-route project and SHALL NOT define a parallel step vocabulary.

#### Scenario: Ladle project is registered alongside the real-route project
- **WHEN** a contributor reads `playwright.config.ts` at the repository root
- **THEN** the file declares two projects, one whose `testDir` is `tests/parity` (the existing real-route runner) and one whose `testDir` is `tests/ladle` (the new ladle runner)
- **AND** the two projects share the same `globalSetup`, the same `webServer` config block (extended with a `LADLE_URL` environment variable), and the same reporter
- **AND** the ladle project does not redefine any step definitions

#### Scenario: Ladle project is the second one
- **WHEN** the contributor reads the projects list
- **THEN** the real-route project is the first entry (no behaviour change for the 08-iteration parity suite)
- **AND** the ladle project is the second entry, gated on the `LADLE_URL` environment variable so it is skipped in environments that have not built the static ladle

### Requirement: Ladle Page Dispatch Re-uses The Shared Step Registry
The ladle project SHALL export a `runStepInLadle(page, storyUrl, stepText)` helper in `tests/steps/ladle.ts` that navigates `page` to the ladle URL for `(component, story)` and dispatches `stepText` against the resulting Ladle page via the same `dispatch(page, kind, stepText)` function used by the real-route runner. The helper SHALL NOT introduce a second step vocabulary, SHALL NOT shadow the proximity+layout helpers in `tests/steps/selectors/{proximity,layout}.ts`, and SHALL be the only entry point that navigates the test page to Ladle.

#### Scenario: Helper navigates to the story URL and re-issues the step
- **WHEN** a scenario step is dispatched with a ladle tag and the helper is invoked
- **THEN** the helper calls `page.goto(storyUrl)` and waits for `domcontentloaded`
- **AND** the helper invokes the existing `dispatch(page, kind, stepText)` function with the Ladle page
- **AND** the helper does not implement any new selector logic

#### Scenario: Helper fails loudly when the ladle URL is unreachable
- **WHEN** the helper is invoked and `LADLE_URL` is unreachable (ladle dev server not running, or `public/ladle/` not built)
- **THEN** the helper throws an error that includes the story URL, the scenario file path, and the scenario name
- **AND** the test fails with a non-zero exit code
- **AND** the runner does NOT silently fall back to the real route (the ladle project is opt-in, not opt-out)

#### Scenario: Helper preserves the proximity+layout selector discipline
- **WHEN** the test page is at the ladle URL
- **THEN** the Ladle page renders the story as the only content under a real landmark (`<header>`, `<main>`, `<nav>`, or `<aside>`) so the layout helpers in `tests/steps/selectors/layout.ts` resolve to the story elements
- **AND** any step that resolves a form field through `getFieldNearestTo(label)` or a button through `getButtonInside(landmark, name)` works identically against the ladle page and against the real route

### Requirement: Ladle Build And Dev Scripts
The repository SHALL expose `bun run ladle` (Ladle dev server on port 6006), `bun run ladle:build` (static output to `public/ladle/`), and `bun run ladle:coverage` (coverage gate that fails `bun run check` on drift). The static build SHALL be served by Cloudflare Pages at `/ladle/` without a separate deploy step, and the dev server SHALL be reachable on `http://localhost:6006/` when the ladle project runs locally.

#### Scenario: Ladle dev server is started by `bun run ladle`
- **WHEN** a contributor runs `bun run ladle`
- **THEN** Ladle starts on port 6006 with the `ladle.config.ts` config
- **AND** the stories under `src/components/**/*.ladle.tsx` and `tests/features/**/<component>.ladle.tsx` are loaded
- **AND** the dev server respects the `LADLE_URL` environment variable so the ladle Playwright project can resolve it

#### Scenario: Ladle static build is produced by `bun run ladle:build`
- **WHEN** a contributor runs `bun run ladle:build`
- **THEN** the build output lands in `public/ladle/` with an `index.html` at the root, hashed asset filenames, and a `stories.json` manifest
- **AND** `public/ladle/` is a deployable static asset; no Node runtime is required to serve it

#### Scenario: Static ladle is served by the Astro deploy
- **WHEN** a deployed environment (dev, preview, prod) receives a request for `/ladle/`
- **THEN** Cloudflare Pages serves the static ladle from the same origin as the Astro SSR app
- **AND** no separate Cloudflare Pages project, environment variable, or DNS record is required
- **AND** the `LADLE_URL` for the ladle Playwright project defaults to `http://localhost:4321/ladle/` in dev and to the deployed origin in CI

### Requirement: Ladle Coverage Script
The repository SHALL expose `bun run ladle:coverage` that walks every `tests/features/**/*.feature` file, parses the `@ladle(component=..., story=...)` tags using the same `gherkin` parser as the runner, and asserts that every tagged scenario has a matching `<ComponentName>.ladle.tsx` file in the repo that exports the named story. The script SHALL also walk every `src/components/**/*.ladle.tsx` and `tests/features/**/<component>.ladle.tsx`, statically export the story keys, and assert that every story is either referenced by at least one scenario or carries the `parameters.ladle.skipCoverage = true` opt-out. The script SHALL be wired into `bun run check` and SHALL fail the build on any drift.

#### Scenario: Coverage script reads feature files with the gherkin parser
- **WHEN** the script walks the feature files
- **THEN** it uses the same `gherkin` npm package that `tests/parity/gherkin.spec.ts` uses to parse the files
- **AND** it collects every scenario tag whose key is `ladle` and whose value matches `component=<Name>,story=<Name>`
- **AND** it does NOT rely on regex over the `.feature` source

#### Scenario: Coverage script asserts each tagged scenario has a matching story
- **WHEN** a scenario carries a `@ladle(component=Foo, story=Bar)` tag
- **THEN** the script asserts that a file named `Foo.ladle.tsx` exists in the repo (under `src/components/` or under a `tests/features/**/` folder)
- **AND** the script asserts that the file exports a story named `Bar` (one of the keys of the default export's `Meta<typeof Foo>`)
- **AND** a missing file or missing story key fails the script with a non-zero exit code and a message that includes the scenario file path and line number

#### Scenario: Coverage script asserts each story is referenced or opted out
- **WHEN** a `<ComponentName>.ladle.tsx` file exports a story key
- **THEN** the script asserts that at least one `tests/features/**/*.feature` scenario carries a `@ladle(component=ComponentName, story=<key>)` tag referencing it
- **OR** the file's `default` export's `parameters.ladle.skipCoverage` is `true`
- **AND** a story that is neither referenced nor opted out fails the script

#### Scenario: Coverage script is part of `bun run check`
- **WHEN** a contributor runs `bun run check`
- **THEN** the coverage script runs after `bun run specs:check` and after the Biome lint step
- **AND** a coverage failure fails the check with a non-zero exit code

### Requirement: Per-Feature Story Adoption Is Enforced By Coverage
Every gherkin scenario that targets a component (a React island, an Astro component, or any view with a ladle story) SHALL carry a `@ladle(component=..., story=...)` tag pointing at a story co-located with the scenario at `tests/features/<kind>/<slug>/<component>.ladle.tsx`. The story SHALL be authored inside the spec that introduces the component, and SHALL have at least one `@ladle/react` `play` interaction test that exercises the same flow as the gherkin scenario.

#### Scenario: Component-targeted scenario carries a ladle tag
- **WHEN** a contributor authors a 10-iteration gherkin scenario that targets a component
- **THEN** the scenario carries a `@ladle(component=..., story=...)` tag
- **AND** the story is co-located with the scenario at `tests/features/<kind>/<slug>/<component>.ladle.tsx`
- **AND** the story has at least one `play` interaction test imported from `@ladle/react`

#### Scenario: Story with a missing scenario fails coverage
- **WHEN** a 10-iteration spec adds a `<component>.ladle.tsx` story without adding a matching gherkin `@ladle(...)` tag
- **THEN** `bun run ladle:coverage` fails the build
- **AND** the failure message names the story file, the story key, and the closest matching feature file (if any)

#### Scenario: Tagged scenario with a missing story fails coverage
- **WHEN** a gherkin scenario carries a `@ladle(component=Foo, story=Bar)` tag and the matching story is not present in the repo
- **THEN** `bun run ladle:coverage` fails the build
- **AND** the failure message names the scenario file, the scenario line, and the expected story file path
