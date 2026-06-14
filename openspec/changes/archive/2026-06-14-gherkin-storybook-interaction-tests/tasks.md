## 1. Toolchain And Configuration

- [x] 1.1 Add Storybook 8 + `@storybook/react-vite` + `@storybook/test` + `storybook` to `package.json` and lock the versions in `bun.lock`
- [x] 1.2 Add `bun run storybook`, `bun run storybook:build`, `bun run storybook:coverage`, and `bun run test:storybook` scripts to `package.json`
- [x] 1.3 Wire `bun run storybook:coverage` into the `bun run check` aggregate script after `bun run specs:check`
- [x] 1.4 Create `.storybook/main.ts` with stories globs (`src/components/**/*.stories.tsx`, `10-iteration/features/**/<component>.stories.tsx`), `staticDirs: ['../public']`, and the Vite builder
- [x] 1.5 Create `.storybook/preview.tsx` that imports `src/styles/tokens.css` and wraps every story with a Storybook `decorators` array providing the mock auth context and the mock i18n context (per `09-iteration/00-summary.md` Definition of Done item 3)
- [x] 1.6 Register the `tests/storybook/` Playwright project in the root `playwright.config.ts` as the second project entry, sharing `globalSetup` and `reporter` with the real-route project and gated on the `STORYBOOK_URL` environment variable

## 2. Runner Extension

- [x] 2.1 Create `tests/steps/storybook.ts` exporting `runStepInStory(page, storyUrl, stepText)` that resolves the iframe via `page.frameLocator(storyUrl)` and dispatches the step text against the resolved `FrameLocator` via the existing `dispatch(page, step)` function exported by `tests/steps/dsl.ts`
- [x] 2.2 Add a clear error path in `runStepInStory` that throws a descriptive error (with story URL, scenario file path, and line number) when the iframe cannot be resolved; the helper MUST NOT fall back to the real route
- [x] 2.3 Update `tests/parity/gherkin.spec.ts` so that any scenario carrying a `@story(component=…, story=…)` tag is marked with `test.skip()` and a comment pointing at the storybook project; the real-route runner does not implement its own iframe logic
- [x] 2.4 Add `tests/storybook/storybook.spec.ts` that walks every `tests/features/**/*.feature` and dispatches scenarios that carry a `@story(...)` tag to `runStepInStory`; scenarios without the tag are skipped with a comment

## 3. Coverage Script

- [x] 3.1 Create `tests/storybook/coverage.ts` that uses the `gherkin` npm package (the same parser used by the real-route runner) to walk every `tests/features/**/*.feature` and collect the `@story(component=…, story=…)` tags
- [x] 3.2 Add a static AST scan of every `src/components/**/*.stories.tsx` and `10-iteration/features/**/<component>.stories.tsx` file that exports the story keys from the file's default export
- [x] 3.3 Wire the script to assert that every tagged scenario has a matching `<ComponentName>.stories.tsx` file that exports the named story, and that every exported story is either referenced by a scenario or carries `parameters.storybook.skipCoverage = true`
- [x] 3.4 Make the script fail with a non-zero exit code and a precise error message (scenario file path + line number for missing stories, story file path + story key for unreferenced stories)
- [x] 3.5 Add the `bun run storybook:coverage` script to `package.json` pointing at `bun run tests/storybook/coverage.ts`

## 4. Smoke Story And Verification

- [x] 4.1 Create a minimal `<SmokeButton>.stories.tsx` story in `src/components/_smoke/` (or co-located with the runner in `tests/storybook/`) that renders a single button with a known label, exports a `Default` story, and includes a `play` function from `@storybook/test` that asserts the button is clickable
- [x] 4.2 Create `tests/features/infrastructure/storybook-runner.feature` with a single happy-path scenario that carries a `@story(component=SmokeButton, story=Default)` tag and uses proximity+layout selectors to click the button
- [x] 4.3 Add an opt-out scenario in the same feature file that carries a `@story-skip` opt-out (via a sibling `.stories.tsx` with `parameters.storybook.skipCoverage = true`) to exercise the opt-out branch of the coverage script
- [x] 4.4 Run `bun run storybook:coverage` locally and confirm a green run; intentionally break the feature file (rename the story) and confirm the script fails with a precise error message
- [x] 4.5 Run `bun run check` and `bun run test:storybook` (against `bun run storybook:build`'s static output) and confirm both are green

## 5. Documentation And Closing The Loop

- [x] 5.1 Update `AGENTS.md` §7 (Toolchain commands) with the four new scripts (`storybook`, `storybook:build`, `storybook:coverage`, `test:storybook`)
- [x] 5.2 Update `AGENTS.md` §8 (Definition of done) to add `bun run test:storybook` and `bun run storybook:coverage` to the closing checks for any 10-iteration feature spec that adds a new component
- [x] 5.3 Update `09-iteration/01-review-existing-features.md` row 127 (`infrastructure` / `Storybook runner extension`) to set `status: specced`, fill in `openspec-change: openspec/changes/gherkin-storybook-interaction-tests`, and fill in `spec-path: 10-iteration/features/infrastructure/storybook-runner-extension/`
- [x] 5.4 Run `openspec validate gherkin-storybook-interaction-tests` and resolve every error before opening the PR
