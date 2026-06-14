# Per-Domain Gherkin Features

One feature file per epic × surface under `tests/features/<domain>/<surface>.feature`. Every scenario is executed by the runner at `tests/parity/gherkin.spec.ts`, which dispatches to the step registry in `tests/steps/verbs/`.

## Background templates

Every feature file declares a single `Background:` block that pins one role (per the `viewer-session` capability) and reads its fixture data from `tests/steps/seed.ts`. The two templates:

```gherkin
Feature: <domain> surface
  Background:
    Given the user is logged in as Guest
    # ...
```

```gherkin
Feature: <domain> surface
  Background:
    Given the user is logged in as Member
    # ...
```

`Partner` and `Admin` follow the same pattern. There is no `Background:` that mixes roles — the runner asserts exactly one role per file.

## Step registry

Step text is dispatched by kind to the matching verb module:

- `auth.steps.ts` — `the user is logged in as <role>`, `the user logs out`
- `navigation.steps.ts` — `the user navigates to <route>`
- `forms.steps.ts` — `the user submits <form> with <values>`, `the user toggles <control>`
- `lists.steps.ts` — `the user opens the <nth> item in <list>`, `the user asserts the <nth> item in <list> shows <text>`
- `modals.steps.ts` — `the user confirms the modal`, `the user dismisses the modal`
- `visual.steps.ts` — `the user asserts <assertion>`
- `network.steps.ts` — `the user waits for <request> to complete`, `the user asserts the response is <status>`
- `data.steps.ts` — `the user asserts the <surface> data contains <values>`, `the user asserts the <surface> data does not contain <values>`
- `i18n.steps.ts` — `the user switches the language to <lang>`, `the user asserts the active language is <lang>`
- `time.steps.ts` — `the user advances the clock by <duration>`, `the user asserts the current time is <time>`

## Selector discipline

Selectors come from two modules only:

- `tests/steps/selectors/proximity.ts` — `getFieldNearestTo(label)`, `getButtonInside(landmark, name)`, `getLinkNearestTo(label)`
- `tests/steps/selectors/layout.ts` — `byRole`, `byLabel`, `byExactText` (literal text only), `getRegion(landmark)`, `getNthInside(landmark, role, n)`, `withinRegion(landmark, selector)`

No `data-testid`, no `getByText` chains, no raw CSS strings, no `.unveiled-border` class names. The TypeScript compiler rejects any import that does not go through the two helper modules.

## `@story(...)` tag

A scenario may carry `@story(component=…, story=…)` to opt into a Storybook iframe dispatch (09-iteration). In 08-iteration the runner logs a warning and falls back to the real route:

```
@story(EventCard, default) tag present on "Member sees the event card" (tests/features/core-platform/discovery.feature)
but Storybook iframe runner is not yet implemented; falling back to the real route (see 09-iteration)
```

Scenarios without the tag run against the real route with no warning.

## Subset selection

`bun run test:e2e` runs every scenario. To run a representative subset during development, set the `BUN_GHERKIN_TAGS` env override:

```sh
BUN_GHERKIN_TAGS=@smoke bun run test:e2e
```

Multiple tags are comma-separated; a feature is selected if any of its scenarios carries any of the requested tags.
