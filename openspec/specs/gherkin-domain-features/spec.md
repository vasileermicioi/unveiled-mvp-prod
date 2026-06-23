## Purpose

Define the per-domain Gherkin specification, the shared step registry, the selector discipline, and the runner used by both the Playwright suite and the Storybook interaction tests.
## Requirements
### Requirement: One Feature File Per Domain
The repository SHALL organize its executable Gherkin specifications as one feature file per domain (per the nine epics in `docs/epics.md`), grouped under `tests/features/<domain>/<surface>.feature`. Each feature file SHALL declare a single `Feature:` header that names the domain and surface it covers.

#### Scenario: Core-platform surface has its own feature file
- **WHEN** a contributor reads `tests/features/core-platform/app-shell.feature`
- **THEN** the file declares `Feature: App shell` (or an equivalent domain-scoped header)
- **AND** every scenario in the file targets a surface within the core-platform domain (header, navigation, drawer, language toggle)

#### Scenario: Identity surface has its own feature file
- **WHEN** a contributor reads `tests/features/identity/session.feature`
- **THEN** the file declares a domain-scoped `Feature:` header
- **AND** every scenario targets a surface within the identity domain (signup, login, logout, password recovery, redirect-after-login)

#### Scenario: Operations surface has its own feature file
- **WHEN** a contributor reads `tests/features/operations/partner-check-in.feature` or `tests/features/operations/admin-crud.feature` or `tests/features/operations/exports.feature`
- **THEN** each file declares a domain-scoped `Feature:` header
- **AND** every scenario targets a partner or admin operations surface exclusively

#### Scenario: Infrastructure surface has its own feature file
- **WHEN** a contributor reads `tests/features/infrastructure/health-readiness.feature` or `tests/features/infrastructure/parity-smoke.feature`
- **THEN** the file declares a domain-scoped `Feature:` header
- **AND** scenarios cover platform health and the parity smoke happy path respectively

### Requirement: Feature Files Pin a Single Role and Seed Per Background
Every feature file SHALL declare a `Background:` block that pins a single role and the corresponding seed data, so the body of each scenario can assume a known viewer and dataset without re-establishing them per scenario.

#### Scenario: Background declares the role
- **WHEN** a runner reads the `Background:` block of any `tests/features/<domain>/<surface>.feature`
- **THEN** the block contains a `Given` step that logs the runner in as a single named role (`Member`, `Partner`, `Admin`, or `Guest`) imported from `tests/steps/seed.ts`
- **AND** no `Background:` block mixes roles

#### Scenario: Background references the seed module
- **WHEN** a runner reads the `Background:` block
- **THEN** every fixture email, display name, or seeded id is read from `tests/steps/seed.ts`
- **AND** no feature file hard-codes a fixture email, name, or id in plain text

### Requirement: Shared Step Registry With Two Selector Strategies
Every step definition SHALL be registered through a shared DSL (`tests/steps/dsl.ts`) and SHALL use ONLY the two selector strategies exposed by the helper modules: proximity (`tests/steps/selectors/proximity.ts`) and layout (`tests/steps/selectors/layout.ts`).

#### Scenario: Steps use the proximity helpers
- **WHEN** a step needs to find a form field, a button, or a link
- **THEN** the step calls `getFieldNearestTo(label)`, `getButtonInside(landmark, name)`, or `getLinkNearestTo(label)` from the proximity helper module
- **AND** the step does not construct a Playwright `getByText` chain, a CSS selector, or a `[data-testid=…]` selector

#### Scenario: Steps use the layout helpers
- **WHEN** a step needs to assert the presence of a region, header, article, section, navigation, dialog, or form
- **THEN** the step calls the layout helper (`getByRole`, `getByLabel`, `getByText` with `exact: true` when the literal text matters, or `locator("article, section, nav, main, header, footer, dialog")` filtered by the smallest containing landmark)
- **AND** the step does not reach for a CSS class selector like `.unveiled-border`

#### Scenario: The runner rejects non-conforming selectors
- **WHEN** a contributor introduces a step that imports a non-helper selector (e.g. a raw CSS string or a `getByText` chain that does not use `exact: true`)
- **THEN** the TypeScript compiler rejects the file
- **AND** `bun run check` fails

### Requirement: One Verb File Per Step Category
The step registry SHALL be organized as one file per verb under `tests/steps/verbs/`, with each file registering its own `Given` / `When` / `Then` steps against the shared registry.

#### Scenario: Each verb has its own file
- **WHEN** a contributor lists `tests/steps/verbs/`
- **THEN** the directory contains at least `auth.steps.ts`, `navigation.steps.ts`, `forms.steps.ts`, `lists.steps.ts`, `modals.steps.ts`, `visual.steps.ts`, `network.steps.ts`, `data.steps.ts`, `i18n.steps.ts`, and `time.steps.ts`
- **AND** each file exports a `register<Verb>Steps(registry)` function that the runner calls at module-load time

#### Scenario: Adding a new verb is a one-file change
- **WHEN** a contributor adds a new file under `tests/steps/verbs/`
- **THEN** the runner picks it up automatically through the barrel `tests/steps/verbs/index.ts`
- **AND** no other file needs to be modified

### Requirement: Step Arguments Use The Generated Types And Tokens
Step argument parsers SHALL import their shapes from the TypeSpec-generated Zod validators under `src/lib/generated/` and SHALL consume the design tokens under `src/lib/design-tokens.ts` for any class-name assertion.

#### Scenario: Argument schemas come from the generated validators
- **WHEN** a step accepts a typed argument (e.g. a form payload, a query filter)
- **THEN** the step's argument parser imports the matching schema from `@/lib/generated/...`
- **AND** the parser does not redeclare a hand-written Zod schema for the same shape

#### Scenario: Class-name assertions consume the design tokens
- **WHEN** a step asserts that an element carries a brand color, a radius, or a shadow
- **THEN** the assertion reads the token name from `@/lib/design-tokens`
- **AND** the assertion does not hard-code a hex value or a raw class string

### Requirement: Runner Is Independent Of The Legacy Parity Suite
The new runner SHALL live at `tests/parity/gherkin.spec.ts` (renamed from the legacy `e2e-gherkin.spec.ts`) and SHALL walk every `tests/features/**/*.feature` file, dispatching to the shared step registry.

#### Scenario: Runner discovers every feature file
- **WHEN** the runner is invoked (`bun run test:e2e` or its Playwright equivalent)
- **THEN** it walks `tests/features/**/*.feature` and registers every scenario
- **AND** it does not depend on a hard-coded list of feature files

#### Scenario: Runner dispatches via the registry
- **WHEN** the runner executes a scenario step
- **THEN** it dispatches to the step registered by the matching verb file
- **AND** a step that has no registered handler is reported as a failure with the step text and the originating feature file

#### Scenario: Legacy parity suite is replaced
- **WHEN** the legacy `tests/features/core-platform.feature` and `tests/parity/e2e-gherkin.spec.ts` are referenced
- **THEN** `tests/features/core-platform.feature` is reduced to an empty `Feature:` header pending the 09-iteration migration of the last smoke scenario
- **AND** `tests/parity/e2e-gherkin.spec.ts` is renamed to `tests/parity/gherkin.spec.ts` and slimmed to the new runner

### Requirement: Ladle Tag Schema Routes Tagged Scenarios To The Ladle Project
A scenario MAY carry a `@ladle(component=…, story=…)` tag. When the tag is present, the runner SHALL navigate to the Ladle URL for `(component, story)` and run the same step dispatcher against the resulting Ladle page. When the tag is absent, the runner SHALL run the scenario against the real route. Every gherkin scenario that targets a component (a React island, an Astro component, or any view that has a ladle story) SHALL carry a `@ladle(component=…, story=…)` tag. The story itself is co-located with the scenario under `tests/features/<domain>/<surface>/<component>.ladle.tsx`. The Ladle page is dispatched to by the helper exported from `tests/steps/ladle.ts` (see the `gherkin-ladle-interaction-tests` capability); the real-route runner SHALL NOT implement its own ladle navigation.

#### Scenario: Scenario without a ladle tag runs against the real route
- **WHEN** a scenario is executed and carries no `@ladle` tag
- **THEN** the runner loads the real route referenced by the scenario (via `the user navigates to <route>`)
- **AND** the runner does not emit a warning

#### Scenario: Scenario with a ladle tag navigates to a Ladle page
- **WHEN** a scenario is executed and carries a `@ladle(component=Foo, story=Bar)` tag
- **THEN** the runner resolves the Ladle URL for `(Foo, Bar)` and dispatches the same step text against the resulting Ladle page via `tests/steps/ladle.ts`
- **AND** the runner does NOT fall back to the real route when the ladle project is registered (the ladle project is the second Playwright project, opt-in via `LADLE_URL`)
- **AND** the story referenced by the tag is co-located with the scenario under `tests/features/<domain>/<surface>/<component>.ladle.tsx`

#### Scenario: Ladle tag with a missing story fails the build
- **WHEN** a scenario carries a `@ladle(component=…, story=…)` tag whose `(component, story)` pair does not resolve to a known Ladle entry
- **THEN** the coverage script `bun run ladle:coverage` fails the build (the tag is a hard contract enforced by `tests/steps/ladle.ts` plus the coverage script, not a soft warning)

#### Scenario: Component-targeted scenario carries a ladle tag
- **WHEN** a contributor authors a gherkin scenario that targets a component (a React island or an Astro component with a ladle story)
- **THEN** the scenario carries a `@ladle(component=…, story=…)` tag pointing at the per-feature ladle story
- **AND** the story is co-located with the scenario at `tests/features/<domain>/<surface>/<component>.ladle.tsx`
- **AND** the scenario is not mergeable until the story exists and passes the ladle coverage check (`bun run ladle:coverage`)

### Requirement: App-Route URL Prefix Codemod Gate

Every `.feature` file under `tests/features/**/*.feature` SHALL have its app-route URLs prefixed with `/app` so the gherkin parity suite hits the orchestrator's `/app/*` dispatch. The `scripts/codemod-prepend-app-prefix.ts` script SHALL walk the feature tree in `--apply` mode (rewrite un-prefixed app routes to `/app...`) and `--verify` mode (exit non-zero if any un-prefixed app route remains). The codemod SHALL distinguish true app routes from full URLs (`http://...`, `https://...`), content-type strings (e.g. `application/json; charset=utf-8`), and orchestrator-owned endpoints (`/healthz`, `/readyz`, `/api/...`, `/ladle/...`, `/favicon.ico`, `/favicon.svg`) so the gate does not produce false positives. The URL-detection regex SHALL use a negative lookbehind that rejects `/` preceded by a word character, `:`, or `/`, so the match only fires on path-shaped tokens that begin a fresh segment (after whitespace, start-of-line, or punctuation). The codemod SHALL also skip URL rewrites inside any scenario whose `Scenario:` title matches `/normalizes/i` or `/does not normalize/i`, so normalization-test scenarios that intentionally use bare paths as test inputs are preserved. The gate SHALL be wired into `bun run check` as `bun run scripts/codemod-prepend-app-prefix.ts --verify`.

#### Scenario: Bare app routes get prefixed in --apply mode

- **WHEN** a feature file contains `When the visitor opens /discover`
- **THEN** `bun run scripts/codemod-prepend-app-prefix.ts --apply` rewrites it to `When the visitor opens /app/discover`
- **AND** the rewrite is reported by the script's summary line.

#### Scenario: Localized app routes get prefixed in --apply mode

- **WHEN** a feature file contains `When the visitor opens /en/admin`
- **THEN** `bun run scripts/codemod-prepend-app-prefix.ts --apply` rewrites it to `When the visitor opens /app/en/admin`.

#### Scenario: App routes with query strings get prefixed in --apply mode

- **WHEN** a feature file contains `When the visitor opens /discover?tab=metrics`
- **THEN** `bun run scripts/codemod-prepend-app-prefix.ts --apply` rewrites it to `When the visitor opens /app/discover?tab=metrics`.

#### Scenario: Full URLs are not touched

- **WHEN** a feature file contains `Given the orchestrator is running on http://localhost:4320`
- **THEN** the line is left unchanged
- **AND** `--verify` does not flag it.

#### Scenario: Content-type strings are not touched

- **WHEN** a feature file contains `And the Content-Type is application/json; charset=utf-8`
- **THEN** the line is left unchanged
- **AND** `--verify` does not flag it.

#### Scenario: Orchestrator-owned endpoints are not touched

- **WHEN** a feature file contains `When the visitor opens /healthz` or `When the visitor opens /readyz`
- **THEN** the line is left unchanged
- **AND** `--verify` does not flag it.

#### Scenario: API-owned endpoints are not touched

- **WHEN** a feature file contains `When the visitor opens /api/openapi.json`
- **THEN** the line is left unchanged
- **AND** `--verify` does not flag it.

#### Scenario: Ladle and favicon endpoints are not touched

- **WHEN** a feature file contains a URL under `/ladle/`, `/favicon.ico`, or `/favicon.svg`
- **THEN** the line is left unchanged
- **AND** `--verify` does not flag it.

#### Scenario: Normalization-test scenarios are skipped

- **WHEN** a scenario's `Scenario:` title contains `normalizes` or `does not normalize` (e.g. `Scenario: GET /en/admin normalizes to /app/en/admin`)
- **THEN** the codemod skips URL rewrites for every `Given`/`When`/`Then`/`And`/`But` step inside that scenario
- **AND** the next `Scenario:` or `Background:` header resets the skip flag.

#### Scenario: --verify fails when an un-prefixed app route is left in a feature

- **WHEN** a feature file under `tests/features/**/*.feature` still contains an un-prefixed app-route URL after the `--apply` pass
- **THEN** `bun run scripts/codemod-prepend-app-prefix.ts --verify` exits non-zero
- **AND** the offending file path is printed to stderr
- **AND** `bun run check` fails.

#### Scenario: Gate is wired into bun run check

- **WHEN** `bun run check` runs
- **THEN** `bun run scripts/codemod-prepend-app-prefix.ts --verify` is part of the script chain
- **AND** the gate is enforced on every commit.

#### Scenario: Unit tests pin the regex, exclusion list, and per-scenario skip

- **WHEN** `bun test scripts/codemod-prepend-app-prefix.test.ts` runs
- **THEN** the suite asserts that bare app routes get prefixed
- **AND** the suite asserts that full URLs, content-type strings, and orchestrator-owned endpoints are left alone
- **AND** the suite asserts that normalization-test scenarios are skipped
- **AND** the suite pins the exclusion list (`/healthz`, `/readyz`, `/api/...`, `/ladle/...`, `/favicon.ico`, `/favicon.svg`).

