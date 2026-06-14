## Why

The 08-iteration proposals established the spec layer (LikeC4, TypeSpec, design tokens, gherkin, `AGENTS.md`) but did not yet define the **catalog of per-feature work** that 10-iteration must author. Without a pinned catalog, contributors and agents picking up 10-iteration have no authoritative list of which existing surfaces need improvement specs, which net-new features still need specs, the per-feature folder format, the definition of done, or the selector discipline that the 08-iteration gherkin spec introduced. Decisions get made ad-hoc per PR and the project accumulates drift between the spec layer and the implementation.

This change creates the **09-iteration hub & catalog**: a folder at `.development-plan/09-iteration/` containing an entry-point summary, two catalog tables (improvements and net-new features), and an empty appendix for discoveries during 10-iteration. It also wires the hub into `AGENTS.md` and the 08-iteration `summary.md`, and codifies the per-feature folder format, the 10-item definition of done, the selector discipline, and the storybook-is-per-feature rule in the OpenSpec capability spec.

## What Changes

- Create the folder `.development-plan/09-iteration/` (the catalog, not an implementation iteration).
- Author `.development-plan/09-iteration/00-summary.md` — the entry point: per-feature folder format, the 10-item definition of done, the selector discipline, the storybook-is-per-feature rule, the out-of-scope list, the recommended work order, and next-step pointers.
- Author `.development-plan/09-iteration/01-review-existing-features.md` — the improvement catalog, one row per existing surface that needs an improvement spec in 10-iteration, with per-row `expected-slug`, `priority`, and `status`.
- Author `.development-plan/09-iteration/02-remaining-features-to-prod.md` — the net-new feature catalog, one row per new feature that needs a spec in 10-iteration, with per-row `expected-slug`, `priority` (P0 / P1 / P2), and `status`.
- Create `.development-plan/09-iteration/discovered-during-10-iteration.md` as an empty placeholder appendix.
- Add a one-line pointer to `09-iteration/00-summary.md` under the "Iteration cycle" section in `AGENTS.md`.
- Add a "Next iteration" section to `.development-plan/08-iteration/summary.md` that points at `09-iteration/00-summary.md` and notes that 10-iteration is where the per-feature specs are authored.
- Repurpose the 07, 08, and 09 pointer files in `.development-plan/08-iteration/` so they refer to the new 09-iteration structure (catalogs, not full specs).
- **Do not** create per-feature folders, per-feature gherkin files, per-feature storybook stories, or per-feature OpenSpec changes in 09-iteration. Those are 10-iteration work.

## Capabilities

### New Capabilities

- `iteration-09-catalog`: The `.development-plan/09-iteration/` folder, its three files (`00-summary.md`, `01-review-existing-features.md`, `02-remaining-features-to-prod.md`), and the `discovered-during-10-iteration.md` appendix. The folder is a **catalog** — not an implementation iteration — that lists which features need specs in 10-iteration and pins the per-feature folder format, the 10-item definition of done, the selector discipline, and the storybook-is-per-feature rule.

### Modified Capabilities

- `architecture-and-guidelines`: The project SHALL have a `.development-plan/09-iteration/00-summary.md` that satisfies the format rules in the new `iteration-09-catalog` spec. The summary is the entry point for any contributor (human or agent) picking up a 10-iteration task.
- `gherkin-domain-features`: Every gherkin scenario that targets a component SHALL have a `@story(component=…, story=…)` tag pointing at a storybook story. The story is authored per-feature in 10-iteration. The runner falls back to the real route if the story is missing, with a warning.

## Impact

- New files: `.development-plan/09-iteration/00-summary.md`, `.development-plan/09-iteration/01-review-existing-features.md`, `.development-plan/09-iteration/02-remaining-features-to-prod.md`, `.development-plan/09-iteration/discovered-during-10-iteration.md` (empty placeholder).
- Modified files: `AGENTS.md` (one-line pointer under "Iteration cycle"), `.development-plan/08-iteration/summary.md` ("Next iteration" section), the 07 / 08 / 09 pointer files in `.development-plan/08-iteration/` (repointed at the 09-iteration catalogs and the storybook-is-per-feature rule).
- New spec file: `openspec/specs/iteration-09-catalog/spec.md` (new capability).
- Modified spec files: `openspec/specs/architecture-and-guidelines/spec.md` (MODIFIED Requirements pointing at the new hub), `openspec/specs/gherkin-domain-features/spec.md` (MODIFIED Requirements requiring the `@story` tag on every component scenario, with the story authored per-feature in 10-iteration).
- No runtime, no database, no UI primitive, no test changes. The 09-iteration folder is a plan, not code, until 10-iteration begins.
- No new dependency, no migration, no breaking change.
