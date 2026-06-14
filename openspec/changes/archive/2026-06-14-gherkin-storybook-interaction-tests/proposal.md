## Why

09-iteration's catalog (`09-iteration/00-summary.md`, "Storybook is per-feature" section) commits to a model where every 10-iteration feature ships a `<component>.stories.tsx` story alongside its gherkin scenario, and a single shared runner extension opens the storybook iframe and runs the same step dispatcher against it. The 08-iteration proposal 04 (`04-gherkin-specs-by-domain.md`) provides the shared step-definition layer, the proximity+layout selector discipline, and the real-route runner — but the storybook extension does not exist yet. Without it, the per-feature storybook obligation in the 10-iteration definition of done is unenforceable, the `@story(component=…, story=…)` tag in `04-gherkin-specs-by-domain.md` is dead syntax, and `bun run storybook:coverage` has nothing to assert against. This change ships that single shared piece of infrastructure so the first per-feature story can land without designing the runner in the abstract.

## What Changes

- Add a `tests/steps/storybook.ts` helper exposing `runStepInStory(page, storyUrl, stepText)` that navigates `page` to the storybook URL for `(component, story)` and re-issues the same gherkin step body against the resulting Storybook page. The helper is a thin shim over the existing step dispatcher in `tests/parity/gherkin.spec.ts`; it does not duplicate the step registry.
- Add a second Playwright project under `tests/storybook/` whose `playwright.config.ts` is registered alongside the existing real-route project. The new project is selected when a scenario carries a `@story(component=…, story=…)` tag; the existing real-route project runs everything else. A scenario with no tag still runs against the real route (no regression on the 08-iteration parity suite).
- Add a `bun run storybook` script (Storybook 8 dev server on port 6006) and a `bun run storybook:build` script (static output to `public/storybook/`) wired into `package.json`. The storybook build is a static artifact that can be served by the Cloudflare Pages deploy alongside the Astro SSR app.
- Add a `bun run storybook:coverage` script that walks every `tests/features/**/*.feature` and asserts that any scenario carrying a `@story(component=…, story=…)` tag has a matching `<component>.stories.tsx` story in the repo, and that every exported story in the repo is referenced by at least one scenario or is explicitly opted out via a `@story-skip` tag. Coverage failures fail the script and the step is wired into `bun run check`.
- Extend `openspec/specs/gherkin-domain-features/spec.md` with a `## ADDED Requirements` block for the storybook runner, the `@story(...)` tag schema, the iframe step dispatch, and the coverage script. The shared step registry and selector discipline are unchanged (they remain in 08-iteration).
- Add a `bun run test:storybook` script (the new Playwright project) and register it in the 09-iteration definition of done for every per-feature spec.

## Capabilities

### New Capabilities

- `gherkin-storybook-interaction-tests`: A Playwright runner extension that opens a storybook iframe and re-issues the 08-iteration gherkin step dispatcher against it, plus a coverage script that asserts every `@story(component=…, story=…)` tag has a matching story. The runner is a thin, shared piece of infrastructure; per-feature stories remain owned by the 10-iteration spec that introduces the component.

### Modified Capabilities

- `gherkin-domain-features`: The existing capability is extended with the storybook runner, the `@story(component=…, story=…)` tag schema, the iframe step dispatch contract, and the `bun run storybook:coverage` script. The shared step registry, proximity+layout selector discipline, and per-domain feature file layout are unchanged.
- `e2e-gherkin-playwright`: The real-route runner (`tests/parity/gherkin.spec.ts`) is updated to dispatch scenarios without a `@story(...)` tag unchanged, and to delegate scenarios with a `@story(...)` tag to the new storybook project via a single registry entry. The legacy `core-platform.feature` content is unaffected.

## Impact

- New files: `tests/steps/storybook.ts`, `tests/storybook/playwright.config.ts`, `tests/storybook/storybook.spec.ts`, `tests/storybook/coverage.ts`, `public/storybook/` (build output, served by Cloudflare Pages), `.storybook/main.ts`, `.storybook/preview.tsx`.
- Modified files: `package.json` (new scripts: `storybook`, `storybook:build`, `storybook:coverage`, `test:storybook`), `playwright.config.ts` (register the second project), `tests/parity/gherkin.spec.ts` (delegate `@story(...)` scenarios to the new project), `openspec/specs/gherkin-domain-features/spec.md` (ADDED Requirements), `openspec/specs/e2e-gherkin-playwright/spec.md` (MODIFIED Requirements).
- Dependencies: `@storybook/react`, `@storybook/react-vite`, `@storybook/test`, `storybook` (8.x), `@playwright/test` already present. No new runtime, no database, no Astro/React changes.
- Out of scope: the per-feature stories themselves (each is authored inside the 10-iteration spec that introduces the component). This change ships the runner, the coverage gate, and the first minimal smoke story used to verify the runner end-to-end; every subsequent story is added by its owning feature spec.
