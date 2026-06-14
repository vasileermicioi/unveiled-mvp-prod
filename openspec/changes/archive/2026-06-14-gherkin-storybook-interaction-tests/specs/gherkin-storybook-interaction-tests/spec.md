## Purpose

Define the shared Storybook Playwright runner extension that opens a Storybook iframe from a tagged Gherkin scenario and re-issues the existing step dispatcher against it, plus the coverage script that asserts every `@story(component=…, story=…)` tag has a matching per-feature story.
## ADDED Requirements
### Requirement: Storybook Playwright Project
The repository SHALL register a second Playwright project under `tests/storybook/playwright.config.ts` that is selected when a scenario carries a `@story(component=…, story=…)` tag, alongside the existing real-route project under `tests/parity/`. The storybook project SHALL consume the same `tests/steps/dsl.ts` registry as the real-route project and SHALL NOT define a parallel step vocabulary.

#### Scenario: Storybook project is registered alongside the real-route project
- **WHEN** a contributor reads `playwright.config.ts` at the repository root
- **THEN** the file declares two projects, one whose `testDir` is `tests/parity` (the existing real-route runner) and one whose `testDir` is `tests/storybook` (the new storybook runner)
- **AND** the two projects share the same `globalSetup`, the same `webServer` config block (extended with a `STORYBOOK_URL` environment variable), and the same reporter
- **AND** the storybook project does not redefine any step definitions

#### Scenario: Storybook project is the second one
- **WHEN** the contributor reads the projects list
- **THEN** the real-route project is the first entry (no behaviour change for the 08-iteration parity suite)
- **AND** the storybook project is the second entry, gated on the `STORYBOOK_URL` environment variable so it is skipped in environments that have not built the static storybook

### Requirement: Storybook Page Dispatch Re-uses The Shared Step Registry
The storybook project SHALL export a `runStepInStory(page, storyUrl, stepText)` helper in `tests/steps/storybook.ts` that navigates `page` to the storybook URL for `(component, story)` and dispatches `stepText` against the resulting Storybook page via the same `dispatch(page, step)` function used by the real-route runner. The helper SHALL NOT introduce a second step vocabulary, SHALL NOT shadow the proximity+layout helpers in `tests/steps/selectors/{proximity,layout}.ts`, and SHALL be the only entry point that navigates the test page to Storybook.

#### Scenario: Helper navigates to the story URL and re-issues the step
- **WHEN** a scenario step is dispatched with a story tag and the helper is invoked
- **THEN** the helper calls `page.goto(storyUrl)` and waits for `domcontentloaded`
- **AND** the helper invokes the existing `dispatch(page, kind, stepText)` function with the Storybook page
- **AND** the helper does not implement any new selector logic

#### Scenario: Helper fails loudly when the story URL is unreachable
- **WHEN** the helper is invoked and `STORYBOOK_URL` is unreachable (storybook dev server not running, or `public/storybook/` not built)
- **THEN** the helper throws an error that includes the story URL, the scenario file path, and the scenario name
- **AND** the test fails with a non-zero exit code
- **AND** the runner does NOT silently fall back to the real route (the storybook project is opt-in, not opt-out)

#### Scenario: Helper preserves the proximity+layout selector discipline
- **WHEN** the test page is at the storybook URL
- **THEN** the Storybook page renders the story as the only content under a real landmark (`<header>`, `<main>`, `<nav>`, or `<aside>`) so the layout helpers in `tests/steps/selectors/layout.ts` resolve to the story elements
- **AND** any step that resolves a form field through `getFieldNearestTo(label)` or a button through `getButtonInside(landmark, name)` works identically against the storybook page and against the real route

### Requirement: Storybook Build And Dev Scripts
The repository SHALL expose `bun run storybook` (Storybook 8 dev server on port 6006), `bun run storybook:build` (static output to `public/storybook/`), and `bun run storybook:coverage` (coverage gate that fails `bun run check` on drift). The static build SHALL be served by Cloudflare Pages at `/storybook/` without a separate deploy step, and the dev server SHALL be reachable on `http://localhost:6006/` when the storybook project runs locally.

#### Scenario: Storybook dev server is started by `bun run storybook`
- **WHEN** a contributor runs `bun run storybook`
- **THEN** Storybook 8 starts on port 6006 with the `.storybook/main.ts` config
- **AND** the stories under `src/components/**/*.stories.tsx` and `10-iteration/features/**/<component>.stories.tsx` are loaded
- **AND** the dev server respects the `STORYBOOK_URL` environment variable so the storybook Playwright project can resolve it

#### Scenario: Storybook static build is produced by `bun run storybook:build`
- **WHEN** a contributor runs `bun run storybook:build`
- **THEN** the build output lands in `public/storybook/` with an `index.html` at the root, hashed asset filenames, and a `stories.json` manifest
- **AND** `public/storybook/` is a deployable static asset; no Node runtime is required to serve it

#### Scenario: Static storybook is served by the Astro deploy
- **WHEN** a deployed environment (dev, preview, prod) receives a request for `/storybook/`
- **THEN** Cloudflare Pages serves the static storybook from the same origin as the Astro SSR app
- **AND** no separate Cloudflare Pages project, environment variable, or DNS record is required
- **AND** the `STORYBOOK_URL` for the storybook Playwright project defaults to `http://localhost:4321/storybook/` in dev and to the deployed origin in CI

### Requirement: Storybook Coverage Script
The repository SHALL expose `bun run storybook:coverage` that walks every `tests/features/**/*.feature` file, parses the `@story(component=…, story=…)` tags using the same `gherkin` parser as the runner, and asserts that every tagged scenario has a matching `<ComponentName>.stories.tsx` file in the repo that exports the named story. The script SHALL also walk every `src/components/**/*.stories.tsx` and `10-iteration/features/**/<component>.stories.tsx`, statically export the story keys, and assert that every story is either referenced by at least one scenario or carries the `parameters.storybook.skipCoverage = true` opt-out. The script SHALL be wired into `bun run check` and SHALL fail the build on any drift.

#### Scenario: Coverage script reads feature files with the gherkin parser
- **WHEN** the script walks the feature files
- **THEN** it uses the same `gherkin` npm package that `tests/parity/gherkin.spec.ts` uses to parse the files
- **AND** it collects every scenario tag whose key is `story` and whose value matches `component=<Name>,story=<Name>`
- **AND** it does NOT rely on regex over the `.feature` source

#### Scenario: Coverage script asserts each tagged scenario has a matching story
- **WHEN** a scenario carries a `@story(component=Foo, story=Bar)` tag
- **THEN** the script asserts that a file named `Foo.stories.tsx` exists in the repo (under `src/components/` or under a `10-iteration/features/**/` folder)
- **AND** the script asserts that the file exports a story named `Bar` (one of the keys of the default export's `Meta<typeof Foo>`)
- **AND** a missing file or missing story key fails the script with a non-zero exit code and a message that includes the scenario file path and line number

#### Scenario: Coverage script asserts each story is referenced or opted out
- **WHEN** a `<ComponentName>.stories.tsx` file exports a story key
- **THEN** the script asserts that at least one `tests/features/**/*.feature` scenario carries a `@story(component=ComponentName, story=<key>)` tag referencing it
- **OR** the file's `default` export's `parameters.storybook.skipCoverage` is `true`
- **AND** a story that is neither referenced nor opted out fails the script

#### Scenario: Coverage script is part of `bun run check`
- **WHEN** a contributor runs `bun run check`
- **THEN** the coverage script runs after `bun run specs:check` and after the Biome lint step
- **AND** a coverage failure fails the check with a non-zero exit code

### Requirement: Per-Feature Story Adoption Is Enforced By Coverage
Every gherkin scenario that targets a component (a React island, an Astro component, or any view with a storybook story) SHALL carry a `@story(component=…, story=…)` tag pointing at a story co-located with the scenario at `10-iteration/features/<kind>/<slug>/<component>.stories.tsx`. The story SHALL be authored inside the 10-iteration spec that introduces the component, and SHALL have at least one `@storybook/test` `play` interaction test that exercises the same flow as the gherkin scenario.

#### Scenario: Component-targeted scenario carries a story tag
- **WHEN** a contributor authors a 10-iteration gherkin scenario that targets a component
- **THEN** the scenario carries a `@story(component=…, story=…)` tag
- **AND** the story is co-located with the scenario at `10-iteration/features/<kind>/<slug>/<component>.stories.tsx`
- **AND** the story has at least one `play` interaction test imported from `@storybook/test`

#### Scenario: Story with a missing scenario fails coverage
- **WHEN** a 10-iteration spec adds a `<component>.stories.tsx` story without adding a matching gherkin `@story(...)` tag
- **THEN** `bun run storybook:coverage` fails the build
- **AND** the failure message names the story file, the story key, and the closest matching feature file (if any)

#### Scenario: Tagged scenario with a missing story fails coverage
- **WHEN** a gherkin scenario carries a `@story(component=Foo, story=Bar)` tag and the matching story is not present in the repo
- **THEN** `bun run storybook:coverage` fails the build
- **AND** the failure message names the scenario file, the scenario line, and the expected story file path
