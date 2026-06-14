## MODIFIED Requirements

### Requirement: Story Tag Schema Falls Back To The Real Route
A scenario MAY carry a `@story(component=…, story=…)` tag. When the tag is present, the runner SHALL open the Storybook iframe at the corresponding story URL and run the same step dispatcher inside it. When the tag is absent, the runner SHALL run the scenario against the real route. Every gherkin scenario that targets a component (a React island, an Astro component, or any view that has a storybook story) SHALL carry a `@story(component=…, story=…)` tag. The story itself is authored per-feature in 10-iteration at `10-iteration/features/<kind>/<slug>/<component>.stories.tsx`.

#### Scenario: Scenario without a story tag runs against the real route
- **WHEN** a scenario is executed and carries no `@story` tag
- **THEN** the runner loads the real route referenced by the scenario (via `the user navigates to <route>`)
- **AND** the runner does not emit a warning

#### Scenario: Scenario with a story tag opens a Storybook iframe
- **WHEN** a scenario is executed and carries a `@story(component=Foo, story=Bar)` tag
- **THEN** the runner resolves the Storybook iframe URL for `(Foo, Bar)` and dispatches the same step text into the iframe
- **AND** when the Storybook iframe runner is not yet implemented (08-iteration), the runner emits a `console.warn` and falls back to the real route
- **AND** the 09-iteration iframe runner replaces the warning with a real iframe dispatch
- **AND** the story referenced by the tag is authored per-feature in 10-iteration under `10-iteration/features/<kind>/<slug>/<component>.stories.tsx`

#### Scenario: Story tag with a missing story logs a warning
- **WHEN** a scenario carries a `@story(component=…, story=…)` tag whose `(component, story)` pair does not resolve to a known Storybook entry
- **THEN** the runner emits a `console.warn` and falls back to the real route
- **AND** the scenario still executes (the tag is metadata, not a gate)

#### Scenario: Component-targeted scenario carries a story tag
- **WHEN** a contributor authors a gherkin scenario that targets a component (a React island or an Astro component with a storybook story)
- **THEN** the scenario carries a `@story(component=…, story=…)` tag pointing at the per-feature storybook story
- **AND** the story is co-located with the scenario at `10-iteration/features/<kind>/<slug>/<component>.stories.tsx`
- **AND** the scenario is not mergeable until the story exists and passes the storybook coverage check (`bun run storybook:coverage`)
