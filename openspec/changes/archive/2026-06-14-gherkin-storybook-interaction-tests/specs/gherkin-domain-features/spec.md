## MODIFIED Requirements

### Requirement: Story Tag Schema Falls Back To The Real Route
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
