# iteration-09-catalog Specification

## Purpose

Define the `.development-plan/09-iteration/` folder as the **catalog** that lists which features need per-feature specs in 10-iteration, and pin the per-feature folder format, the 10-item definition of done, the selector discipline, and the storybook-is-per-feature rule that every 10-iteration feature spec must satisfy.

## Requirements

### Requirement: 09-iteration folder is a catalog, not an implementation iteration

The project SHALL maintain a folder at `.development-plan/09-iteration/` whose sole output is planning documentation (catalogs, per-feature format, definition of done, work order). The folder SHALL NOT contain per-feature gherkin files, per-feature storybook stories, per-feature OpenSpec changes, per-feature proposals, or any runtime code. Per-feature authoring is reserved for 10-iteration.

#### Scenario: A contributor checks the folder for per-feature work
- **WHEN** a contributor opens `.development-plan/09-iteration/` looking for the per-feature spec for a given feature
- **THEN** they find only the three catalog files plus the `discovered-during-10-iteration.md` appendix
- **AND** no `features/`, `gherkin/`, `stories/`, or `openspec/` subdirectories are present in the folder
- **AND** the per-feature work is clearly deferred to `.development-plan/10-iteration/`

#### Scenario: A contributor adds a discovered item
- **WHEN** a new improvement or net-new feature is identified during 10-iteration
- **THEN** the contributor appends the row to `.development-plan/09-iteration/discovered-during-10-iteration.md` (the appendix)
- **AND** the contributor does NOT create a per-feature folder under `09-iteration/`

### Requirement: 09-iteration entry-point summary

The folder SHALL contain a `00-summary.md` file that is the entry point for any contributor (human or agent) picking up a 10-iteration task. The summary SHALL be no more than 200 lines, SHALL link to the two catalog files, and SHALL document all of the following:

- The per-feature folder format (`tests/features/<domain>/<surface>/{feature.feature, <component>.ladle.tsx}`).
- The 10-item definition of done that every 10-iteration feature spec must satisfy.
- The selector discipline (proximity + layout only; `data-testid` and CSS class selectors forbidden).
- The ladle-is-per-feature rule (no shared ladle runner; one story per feature; a thin runner extension is implemented once, in the first 10-iteration spec that needs it).
- The out-of-scope list (native mobile, new billing provider, marketing site rebuild, brand redesign, new map provider, new email provider, multi-region Cloudflare, A/B testing, feature flags, i18n beyond DE/EN).
- The recommended work order (runner extension → improvements top-to-bottom → new features top-to-bottom → close the loop).
- A "Next step" section that points at the two catalog files.

#### Scenario: An agent answers "where do I start a 10-iteration task?"
- **WHEN** an agent (or human) is assigned a 10-iteration feature spec
- **THEN** the agent opens `.development-plan/09-iteration/00-summary.md` first
- **AND** finds the per-feature folder format, the 10-item definition of done, the catalog links, and the work order without needing to read any other file in the repo
- **AND** the file is no more than 200 lines

#### Scenario: The summary links to both catalogs
- **WHEN** a reader scans the summary
- **THEN** it contains a relative link to `01-review-existing-features.md` and a relative link to `02-remaining-features-to-prod.md`
- **AND** both links resolve to existing files in the same folder

### Requirement: Improvement catalog file

The folder SHALL contain a `01-review-existing-features.md` file that catalogs every existing surface (page, component, lib module, Astro Action, HTTP route) that needs an improvement spec in 10-iteration. Each row SHALL include all of the following columns: `domain` (the epic from `docs/epics.md`), `surface` (the specific surface), `openspec-capability` (the capability spec the surface belongs to), `current-state` (`keep` / `refactor` / `replace`), `issues` (comma-separated tags from a fixed vocabulary), `priority` (`P0` / `P1` / `P2`), `expected-slug` (kebab-case), and `status` (`pending` / `specced` / `merged`).

#### Scenario: Every existing surface has a row
- **WHEN** a contributor scans the improvement catalog
- **THEN** every existing production surface in the codebase has a corresponding row
- **AND** no `expected-slug` is empty
- **AND** every row has a non-empty `priority`

#### Scenario: A row is updated when the spec lands
- **WHEN** a 10-iteration spec is authored for a row in the improvement catalog
- **THEN** the row's `status` is updated from `pending` to `specced`
- **AND** the row's `spec-path` and `openspec-change` columns (when present) are filled in

### Requirement: Net-new feature catalog file

The folder SHALL contain a `02-remaining-features-to-prod.md` file that catalogs every net-new feature (page, component, lib module, Astro Action, HTTP route) that still needs a spec in 10-iteration in order for the application to be production-ready. Each row SHALL include all of the following columns: `domain` (the epic from `docs/epics.md`), `feature` (short name), `openspec-capability` (the new or existing capability the feature introduces), `rationale` (why the feature is required for production), `priority` (`P0` / `P1` / `P2`), `expected-slug` (kebab-case), and `status` (`pending` / `specced` / `merged`).

#### Scenario: Every net-new feature has a row
- **WHEN** a contributor scans the new-feature catalog
- **THEN** every net-new feature required for production has a corresponding row
- **AND** no `expected-slug` is empty
- **AND** every row has a non-empty `priority`
- **AND** every `P0` row is required for 10-iteration to close

#### Scenario: Priority tiers are documented at the top
- **WHEN** a reader opens the new-feature catalog
- **THEN** the file documents what `P0` (must ship for 10-iteration), `P1` (must ship for 11-iteration), and `P2` (deferred) mean
- **AND** the priority column on every row matches one of the three tiers

### Requirement: Discovery appendix

The folder SHALL contain a `discovered-during-10-iteration.md` file as an empty placeholder. The file SHALL exist and SHALL be empty (or contain only a header explaining its purpose) at the end of 09-iteration. During 10-iteration, new rows may be appended to this file when a contributor identifies an improvement or a net-new feature that is not in either catalog.

#### Scenario: The appendix is empty at the end of 09-iteration
- **WHEN** a contributor opens `discovered-during-10-iteration.md`
- **THEN** the file contains at most a header line explaining its purpose
- **AND** the file contains no data rows (those are appended during 10-iteration)

#### Scenario: A contributor appends a discovered item during 10-iteration
- **WHEN** a contributor identifies an improvement or net-new feature that is not in the catalogs
- **THEN** the contributor appends the row to `discovered-during-10-iteration.md` using the same column schema as the relevant catalog
- **AND** the contributor does not edit `01-review-existing-features.md` or `02-remaining-features-to-prod.md` directly to add the row (the appendix is the staging area)

### Requirement: Per-feature folder format

The summary SHALL document the per-feature folder format that 10-iteration will use to author one BDD spec per feature. The format SHALL be `tests/features/<domain>/<surface>/` where `<domain>` is the epic from `docs/epics.md` and `<surface>` is the specific surface the feature covers. Each per-feature folder SHALL contain exactly two files: `feature.feature` (the gherkin scenarios) and `<component>.ladle.tsx` (the Ladle harness referenced by the scenarios' `@ladle(component=…, story=…)` tags). The OpenSpec proposal (`openspec/changes/<change-name>/proposal.md` + `tasks.md`) is the single source of truth for intent and tasks; no per-feature `proposal.md`, `tasks.md`, or `specs.md` is duplicated under `tests/features/`.

#### Scenario: A 10-iteration spec creates the per-feature folder
- **WHEN** a contributor picks up a row from either catalog in 10-iteration
- **THEN** the contributor creates `tests/features/<domain>/<surface>/` with `feature.feature` and `<component>.ladle.tsx`
- **AND** the corresponding OpenSpec change (`openspec/changes/<change-name>/`) carries the umbrella `proposal.md` + `tasks.md` and the per-capability `specs/.../spec.md` delta

#### Scenario: The domain matches the catalog
- **WHEN** a 10-iteration spec is created
- **THEN** a row from `01-review-existing-features.md` lands in `tests/features/<epic-domain>/<slug>/`
- **AND** a row from `02-remaining-features-to-prod.md` lands in `tests/features/<epic-domain>/<slug>/`

### Requirement: Selector discipline binding for every 10-iteration spec

The summary SHALL document the selector discipline inherited from the `gherkin-domain-features` capability: gherkin scenarios and Ladle interaction tests SHALL use only proximity (`getFieldNearestTo`, `getButtonNearestTo`, `getLinkNearestTo`, `getTextNearestTo`) and layout (`getByRole`, `getByLabel`, `getByLandmark`, `getInside` with a semantic landmark parent) selectors. The summary SHALL explicitly forbid `data-testid`, `getByText` chains, CSS class selectors, XPath, `nth-child` / `nth-of-type`, and positional selectors that depend on copy.

#### Scenario: A feature is impossible to specify without UI changes
- **WHEN** a 10-iteration spec for a row cannot be expressed with proximity + layout selectors
- **THEN** the spec includes a "Make UI selector-disciplinable" task in its `tasks.md` (e.g. "Add `aria-label` to the export button", "Wrap the filter chips in `<form role=\"search\">`")
- **AND** no gherkin scenario is written until that task is done
- **AND** the spec is not mergeable until the task is checked off

#### Scenario: A step uses a forbidden selector
- **WHEN** a contributor introduces a step that uses `data-testid`, a CSS class selector, a `getByText` chain, XPath, or a positional selector
- **THEN** the runner rejects the step at module-load time
- **AND** `bun run check` fails
