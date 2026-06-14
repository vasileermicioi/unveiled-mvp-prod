## MODIFIED Requirements

### Requirement: Runner Lives At tests/parity/gherkin.spec.ts And Walks The Per-Domain Feature Tree
The single legacy `core-platform.feature` SHALL be replaced by the per-domain feature files declared by the `gherkin-domain-features` capability, and the runner SHALL live at `tests/parity/gherkin.spec.ts` (renamed from `e2e-gherkin.spec.ts`) and dispatch to the shared step registry under `tests/steps/verbs/`. The runner SHALL delegate any scenario that carries a `@story(component=…, story=…)` tag to the storybook Playwright project under `tests/storybook/` (see the `gherkin-storybook-interaction-tests` capability); the runner SHALL NOT implement its own storybook navigation.

#### Scenario: The runner walks the per-domain feature tree
- **WHEN** the runner at `tests/parity/gherkin.spec.ts` is invoked
- **THEN** it walks every `tests/features/**/*.feature` file
- **AND** it dispatches each step to a handler registered in `tests/steps/verbs/`
- **AND** it does not depend on the legacy `core-platform.feature` content

#### Scenario: The runner delegates tagged scenarios to the storybook project
- **WHEN** the runner reads a scenario that carries a `@story(component=…, story=…)` tag
- **THEN** the runner emits a marker (`test.skip()` with a storybook-project pointer) so the storybook project is the only one that executes the scenario
- **AND** the real-route project does not duplicate the execution of the scenario

#### Scenario: The legacy feature file is reduced to an empty header
- **WHEN** the legacy `tests/features/core-platform.feature` is read
- **THEN** the file contains only an empty `Feature:` header
- **AND** the 09-iteration parity-smoke migration moves the last smoke scenario into `tests/features/infrastructure/parity-smoke.feature`
