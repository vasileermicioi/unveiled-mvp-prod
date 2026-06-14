## Context

The 08-iteration proposal `04-gherkin-specs-by-domain.md` ships the shared step-definition layer (`tests/steps/verbs/`, `tests/steps/selectors/{proximity,layout}.ts`), the real-route Playwright runner (`tests/parity/gherkin.spec.ts`), the proximity+layout selector discipline, and the `@story(component=…, story=…)` tag schema. The tag schema is wired into the runner as a no-op for now: when the tag is absent the scenario runs against the real route, and when the tag is present the runner logs a warning and falls back to the real route. There is no storybook iframe opening, no storybook Playwright project, no storybook coverage check.

The 09-iteration catalog commits every 10-iteration feature spec to ship a `<component>.stories.tsx` story with a `play` interaction test (`09-iteration/00-summary.md` "Definition of Done" item 3). The per-feature folder format is pinned in `09-iteration/00-summary.md` "What 09-iteration produces", and the storybook iframe is supposed to be the execution target for gherkin scenarios that exercise a single component in isolation. The first P0 row that needs it is `10-iteration/features/infrastructure/storybook-runner-extension` in `09-iteration/01-review-existing-features.md`.

The runner must be small enough that the first feature spec that picks it up (the storybook-runner-extension spec itself, plus the first per-feature story used as a smoke test) can ship the runner and the story side-by-side. The infrastructure must therefore be one thin extension to the existing runner, not a parallel test system.

## Goals / Non-Goals

**Goals:**

- Open a storybook iframe from a Playwright test and re-issue the same gherkin step body against the iframe's `Page` so the proximity+layout selector discipline is preserved verbatim.
- Add a `@story(component=…, story=…)` tag schema to the runner. When present, the scenario is dispatched to the storybook project; when absent, the scenario runs against the real route (no regression on 08-iteration parity scenarios).
- Add a `bun run storybook:coverage` script that asserts every `@story(component=…, story=…)` tag has a matching `<component>.stories.tsx` story, and that every story in the repo is referenced by at least one scenario (with an explicit `@story-skip` opt-out for stories that are pure visual baselines).
- Add `bun run storybook` and `bun run storybook:build` scripts that build a static storybook at `public/storybook/` and serve it via Cloudflare Pages.
- Wire the new project + the coverage script into `bun run check` so a missing story or a missing tag fails CI.

**Non-Goals:**

- Per-feature stories themselves. Each story is authored inside the 10-iteration spec that introduces the component; this change ships only the runner and one minimal smoke story used to verify the runner end-to-end.
- A new visual regression baseline. Storybook 8 stories will use `@storybook/test` `play` functions; visual regression is already covered by `bun run test:visual` from 08-iteration `01-likec4-architecture-diagrams.md` / `07-review-and-improve-existing-features.md`.
- A parallel step registry. The storybook runner re-uses the same step dispatcher exported by `tests/steps/dsl.ts`; only the `page` argument changes.
- Storybook composition (e.g. Chromatic, Percy). Visual diffing of stories is done by the existing `bun run test:visual` against the static storybook build.
- A production runtime change. Storybook is a dev/build artifact only; it is never imported by Astro SSR or by the React islands.

## Decisions

### D1 — Second Playwright project, not a new test framework

The storybook runner is a second Playwright project registered in the existing `playwright.config.ts`. Scenarios are routed by tag, not by file glob, because the 08-iteration `tests/parity/gherkin.spec.ts` already reads scenario tags to decide which test body to execute. Routing by tag keeps a single feature file runnable in either mode without splitting the file.

- **Alternative considered:** separate `tests/storybook/**/*.feature` files. Rejected: it would duplicate every feature file, drift between real-route and storybook variants, and break the "scenario is the spec" model from 08-iteration.
- **Alternative considered:** Storybook's own test-runner (`@storybook/test-runner`). Rejected: it speaks Storybook stories, not gherkin, and would require a second DSL.

### D2 — Direct page navigation, not an iframe

The helper `runStepInStory(page, storyUrl, stepText)` navigates `page` to the storybook URL (e.g. `http://localhost:4321/storybook/?path=/story/smokebutton--default&id=smokebutton--default`) and re-issues the step body against the resulting Storybook page. The step registry exports a `dispatch(page, step)` function; the helper passes the Storybook `Page` to it. The proximity+layout selector helpers in `tests/steps/selectors/{proximity,layout}.ts` are pure functions of `Page`, so no selector code changes.

- **Alternative considered:** open the storybook URL inside a `page.frameLocator(storyUrl)` and run the steps against the iframe. Rejected: `FrameLocator` does not expose `page.evaluate`, `page.context`, `page.goto`, or `page.clock` — verbs that legitimately need those methods (e.g. `the user navigates to …`, `the user logs in as <role>`) would fail at compile time. The story is rendered as the only content in the Storybook page, so navigating the test page directly preserves the existing verb type surface (`Page`) without widening it to a `Page | Locator | FrameLocator` union that breaks every verb.
- **Alternative considered:** wrap the iframe in a proxy class that routes Page-only methods to the outer page and selector methods to the iframe. Rejected: adds a custom abstraction the project does not have a storybook-test-runner-style use case for, and the storybook dev server already serves each story as the only content of the page.
- **Alternative considered:** render the story as a React island in an Astro page and skip storybook entirely. Rejected: the 10-iteration definition of done requires a `.stories.tsx` file, not a wrapper Astro page. The storybook build is the canonical artifact that visual regression consumes.

### D3 — Tag schema: `@story(component=Foo, story=Default)` + `@story-skip`

The tag format is `@story(component=<ComponentName>, story=<StoryName>)`. `<ComponentName>` must match the basename of a `<ComponentName>.stories.tsx` file in the repo. `<StoryName>` must match an exported story key in that file (`Default`, `WithMockData`, etc.). A story that is referenced only by visual regression and not by any gherkin scenario carries a `@story-skip` opt-out tag in the `.stories.tsx` file's `parameters.storybook.skipCoverage = true` so the coverage script can find it without scanning the gherkin files.

- **Alternative considered:** convention-based pairing (file basename → story name). Rejected: a single `.stories.tsx` file can export many stories (e.g. `Empty`, `Loading`, `Error`) and the gherkin scenario must be able to pick one explicitly.
- **Alternative considered:** derive the story URL from the component import path. Rejected: the 08-iteration tag is the human-readable contract; an import-path derivation would couple the gherkin file to the build's chunk names.

### D4 — Static storybook build at `public/storybook/`

`bun run storybook:build` runs `storybook build -o public/storybook/`. Cloudflare Pages already serves `public/` as the static asset root, so the static storybook is reachable at `/storybook/` in every environment (dev, preview, prod) without a separate deploy step. The `tests/storybook/playwright.config.ts` reads `STORYBOOK_URL` with a default of `http://localhost:4321/storybook/` (the Astro dev server) and a fallback of `http://localhost:6006/` (the Storybook dev server).

- **Alternative considered:** deploy storybook to a separate Cloudflare Pages project. Rejected: doubles the deploy surface and breaks the single-origin model that 08-iteration `06-09-iteration-hub.md` pins.
- **Alternative considered:** embed storybook stories in the Astro dev server via a route. Rejected: couples the test runner to Astro's request lifecycle, which is irrelevant to the story isolation that storybook is meant to provide.

### D5 — Coverage script reads feature files via `gherkin` parser, not regex

`bun run storybook:coverage` uses the same `gherkin` parser that the real-route runner uses (`tests/parity/gherkin.spec.ts` already imports it). It walks every `tests/features/**/*.feature`, collects the `@story(component=…, story=…)` tags, and asserts the matching story exists. It also walks every `src/components/**/*.stories.tsx`, exports the story keys via a static AST scan (no storybook runtime needed), and asserts each is referenced by at least one scenario or carries `parameters.storybook.skipCoverage = true`.

- **Alternative considered:** regex over `.feature` files. Rejected: gherkin tag values can span lines and contain escaped characters; the parser is already a dependency.
- **Alternative considered:** dynamic introspection at storybook runtime. Rejected: requires booting storybook to get coverage; a static scan fails fast in CI without a dev server.

## Risks / Trade-offs

- **R1 — Storybook iframe + Astro dev server integration drift** → the storybook project reads `STORYBOOK_URL` and falls back to a port-6006 dev server; the integration is covered by the smoke story added in this change. If the dev server URL changes, `tests/storybook/playwright.config.ts` is the single source of truth.
- **R2 — Coverage false-positives on `@story-skip`** → the script requires `parameters.storybook.skipCoverage = true` (a typed Storybook parameter) so a typo in the tag is a build error, not a silent opt-out.
- **R3 — Storybook build size** → Storybook 8 + React 19 is a few hundred KB gzipped. The static build lands in `public/storybook/` and is served with the same cache headers as the rest of `public/` (long max-age, hashed filenames). The build is not on the SSR hot path.
- **R4 — Selector helpers assume landmark context** → the iframe is mounted inside the real route, so the landmark tree (`<header>`, `<main>`, `<nav>`) is preserved. If a future story is mounted in a bare iframe (no parent route), the proximity+layout selectors that depend on landmarks will fail loudly in the test, which is the intended signal to fix the story.
- **R5 — Per-feature adoption** → the coverage script is the enforcement lever. A 10-iteration spec that adds a component without a story fails `bun run check` before it can be merged.

## Migration Plan

1. Land the runner + coverage script + one smoke story in this change. CI is green when `bun run check` passes.
2. The first 10-iteration spec that needs a story (the `storybook-runner-extension` spec itself, plus one adjacent feature spec) ships its story and gherkin `@story(...)` tag.
3. Subsequent 10-iteration specs add their own stories; the coverage script grows the matrix.
4. Rollback: removing the `tests/storybook/` project, the `tests/steps/storybook.ts` helper, the four new scripts, and the `.storybook/` config reverts to the 08-iteration runner. The 08-iteration parity suite continues to pass.
5. No data migration, no deploy order dependency. The static storybook is served by the same Pages deploy that serves the Astro SSR app.

## Open Questions

- **OQ1 — Static storybook vs. dev server in CI** — `bun run test:storybook` in CI currently assumes the static build at `public/storybook/` is up to date. Should the test:storybook script run `bun run storybook:build` first, or should CI run the build in a separate job? Default: a single job, with `bun run storybook:build` as a `pretest` hook on the storybook project. Revisit if the build time exceeds the CI step budget.
- **OQ2 — Storybook theming** — should the static storybook pick up `src/styles/tokens.css` so visual regression baselines match production, or should stories import the design tokens via the shadcn/ui convention? Default: import tokens via the same `src/styles/tokens.css` that the Astro app uses; this is the path of least drift. Revisit if the shadcn/ui `components.json` setup grows a storybook-specific override.
- **OQ3 — `play` function vs. `composeStories` test wrapper** — Storybook 8 ships `composeStories` for unit-test-style interaction. Default: prefer the `play` function (it runs in the iframe, which is what the runner already needs); reserve `composeStories` for unit tests under `tests/unit/`. Revisit if a story needs a non-iframe interaction (e.g. a Web Worker).
