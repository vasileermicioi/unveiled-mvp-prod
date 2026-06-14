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

### Requirement: Story Tag Schema Routes Tagged Scenarios To The Storybook Project
A scenario MAY carry a `@story(component=…, story=…)` tag. When the tag is present, the runner SHALL navigate to the Storybook URL for `(component, story)` and run the same step dispatcher against the resulting Storybook page. When the tag is absent, the runner SHALL run the scenario against the real route. Every gherkin scenario that targets a component (a React island, an Astro component, or any view that has a storybook story) SHALL carry a `@story(component=…, story=…)` tag. The story itself is authored per-feature in 10-iteration at `10-iteration/features/<kind>/<slug>/<component>.stories.tsx`. The Storybook page is dispatched to by the helper exported from `tests/steps/storybook.ts` (see the `gherkin-storybook-interaction-tests` capability); the real-route runner SHALL NOT implement its own storybook navigation.

#### Scenario: Scenario without a story tag runs against the real route
- **WHEN** a scenario is executed and carries no `@story` tag
- **THEN** the runner loads the real route referenced by the scenario (via `the user navigates to <route>`)
- **AND** the runner does not emit a warning

#### Scenario: Scenario with a story tag navigates to a Storybook page
- **WHEN** a scenario is executed and carries a `@story(component=Foo, story=Bar)` tag
- **THEN** the runner resolves the Storybook URL for `(Foo, Bar)` and dispatches the same step text against the resulting Storybook page via `tests/steps/storybook.ts`
- **AND** the runner does NOT fall back to the real route when the storybook project is registered (the storybook project is the second Playwright project, opt-in via `STORYBOOK_URL`)
- **AND** the story referenced by the tag is authored per-feature in 10-iteration under `10-iteration/features/<kind>/<slug>/<component>.stories.tsx`

#### Scenario: Story tag with a missing story fails the build
- **WHEN** a scenario carries a `@story(component=…, story=…)` tag whose `(component, story)` pair does not resolve to a known Storybook entry
- **THEN** the coverage script `bun run storybook:coverage` fails the build (the tag is a hard contract enforced by `tests/steps/storybook.ts` plus the coverage script, not a soft warning)

#### Scenario: Component-targeted scenario carries a story tag
- **WHEN** a contributor authors a gherkin scenario that targets a component (a React island or an Astro component with a storybook story)
- **THEN** the scenario carries a `@story(component=…, story=…)` tag pointing at the per-feature storybook story
- **AND** the story is co-located with the scenario at `10-iteration/features/<kind>/<slug>/<component>.stories.tsx`
- **AND** the scenario is not mergeable until the story exists and passes the storybook coverage check (`bun run storybook:coverage`)
