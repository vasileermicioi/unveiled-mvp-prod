## Context

The 08-iteration proposals (01–05) introduced a code-first spec layer — LikeC4, TypeSpec, design tokens, per-domain gherkin features, and `AGENTS.md` — that the project had been missing. 08-iteration proposal 06 (`06-09-iteration-hub.md`) sketched the 09-iteration folder but stopped at the proposal stage: the catalog itself (the three files) and the wire-up to `AGENTS.md` / the 08-iteration `summary.md` / the 07-08-09 pointer files still need to land, and the catalog needs to be codified in an OpenSpec capability so future contributors cannot accidentally delete or silently mutate it.

09-iteration is intentionally **not** an implementation iteration. It produces no code, no migration, no test, no UI primitive. Its sole output is **planning documentation** that pins:

- The per-feature folder format that 10-iteration will use to author one spec per feature.
- The 10-item definition of done that every 10-iteration feature spec must satisfy.
- The selector discipline (proximity + layout only) inherited from 08-iteration proposal 04.
- The storybook-is-per-feature rule — there is no separate "storybook runner" spec; every feature adds its own story and gherkin scenario with a `@story(...)` tag.
- Two catalog tables (improvements and net-new features) listing every surface that still needs a spec.

The constraints are: docs-only change, no runtime impact, no new dependency, no migration, and the change MUST be reviewable by reading four files plus the diffs on `AGENTS.md` and `08-iteration/summary.md`.

## Goals / Non-Goals

**Goals:**

- Create `.development-plan/09-iteration/` with the three catalog files (`00-summary.md`, `01-review-existing-features.md`, `02-remaining-features-to-prod.md`) and the empty `discovered-during-10-iteration.md` appendix.
- Wire the hub into the rest of the project: `AGENTS.md` (one-line pointer), `08-iteration/summary.md` ("Next iteration" section), the 07 / 08 / 09 pointer files in `08-iteration/` (repointed at the catalogs and the storybook-is-per-feature rule).
- Codify the hub in a new OpenSpec capability (`iteration-09-catalog`) and in two MODIFIED requirements on existing capabilities (`architecture-and-guidelines` and `gherkin-domain-features`).
- Make the catalog and its rules self-verifying: an agent picking up a 10-iteration task can answer "where do I start?" by reading `09-iteration/00-summary.md` and finding the per-feature folder format, the 10-item definition of done, the catalog links, and the work order.

**Non-Goals:**

- No per-feature folder, gherkin file, storybook story, or OpenSpec change is authored in 09-iteration. Those are 10-iteration work.
- No new dependency, no new tool, no new script in `package.json`. The catalog is plain Markdown.
- No new public route, no new Astro Action, no new HTTP endpoint, no TypeSpec change, no LikeC4 change. The hub has no runtime surface.
- No automated check (`bun scripts/check-catalog-coverage.ts`, `bun scripts/check-internal-links.ts`) is added in this change. The 10-item definition of done references those scripts as targets for 10-iteration; the scripts themselves are out of scope for 09-iteration.

## Decisions

- **09-iteration is a catalog, not an implementation iteration.** This is the most important decision: a folder of planning docs that lists *what* needs to be specced next, not *how* to spec it. The per-feature *how* lives in each 10-iteration spec folder. The folder also contains a placeholder `discovered-during-10-iteration.md` so discoveries during 10-iteration have a home.

- **One OpenSpec change for the hub, not five.** The 08-iteration proposal 06 lists 07 / 08 / 09 as separate proposals for index-readability, but the underlying work (catalog files + wire-up) is one cohesive change. The three pointer files in 08-iteration are updated as part of this change and become historical artifacts in the archive; they exist so the 08-iteration folder reads linearly.

- **The 10-item definition of done lives in `00-summary.md`, not in the spec.** The spec codifies *what* the hub is and the rules a row must satisfy; the *10-item checklist* a 10-iteration feature must hit is a process document that lives with the catalog. Splitting them keeps the spec testable (it can be checked by `openspec validate`) and the definition of done iterative (it can be updated without re-validating an OpenSpec change).

- **No automated catalog-coverage or internal-link check in this change.** The 10-item definition of done in `00-summary.md` references `bun scripts/check-catalog-coverage.ts` and `bun scripts/check-internal-links.ts` as the scripts that *should* exist for 10-iteration. Adding those scripts in 09-iteration would couple the catalog to a toolchain that does not exist yet and create a "build the runner before any feature can be specced" blocker, which is exactly the trap the storybook-is-per-feature rule is designed to avoid.

- **The 07 / 08 / 09 pointer files in 08-iteration are repurposed, not deleted.** They become historical artifacts that point at the 09-iteration catalogs and the storybook-is-per-feature rule. Deleting them would orphan cross-references from the 08-iteration `summary.md` and from any agent that has cached the 08-iteration index.

## Risks / Trade-offs

- **Catalog scope creep** — the `02-remaining-features-to-prod.md` list is intentionally large. Every row is marked `P0` (must ship for 10-iteration to close), `P1` (must ship for 11-iteration), or `P2` (deferred). Only `P0` items are required for 10-iteration to ship. → Mitigation: the priority column is binding; P1 / P2 rows are explicitly listed so they are not silently dropped, but they are not blockers for closing 10-iteration.

- **Selector discipline surprises** — some existing features may be impossible to specify with proximity + layout selectors without UI changes (missing `aria-label`, missing landmark, copy-dependent `getByText`). → Mitigation: the 10-item definition of done and the catalog preamble both state that a feature spec MUST include a "Make UI selector-disciplinable" task in its `tasks.md` before any gherkin can be written. The spec is not mergeable until that task is done.

- **Catalog drift** — the catalogs in this folder are a snapshot at the start of 10-iteration. As 10-iteration progresses, new improvements and new features will be discovered. → Mitigation: the `discovered-during-10-iteration.md` appendix is the home for these. It is reviewed at the end of 10-iteration, the catalogs are re-baselined for 11-iteration, and a `10-iteration/summary.md` is written.

- **Storybook coverage** — the `@story(...)` tag on every gherkin scenario is enforced by `bun run storybook:coverage` (added in 08-iteration proposal 04). A feature that adds a new component without a story fails the coverage check. → Mitigation: the 10-item definition of done (item 3) and the storybook-is-per-feature rule in `00-summary.md` both state the requirement; the runner extension spec in 10-iteration is the first one to be picked up (work order, step 1) so every subsequent spec has the runner available.

- **Definition of done becomes a moving target** — the 10-item checklist is process, not spec, and may need updates as 10-iteration progresses. → Mitigation: changes to the checklist require updating `09-iteration/00-summary.md` (Markdown only, no OpenSpec re-validation) and a note in the changelog. The spec (`iteration-09-catalog`) only requires the *existence* of the summary and a minimum structural bar; it does not pin the 10 items.

- **The 09-iteration folder is structural, not code.** Reviewers used to "this change does nothing" may struggle to evaluate it. → Mitigation: the 4.6 verification step in `tasks.md` (an agent answers "Where do I start a 10-iteration task?") is the reviewability check. If the answer is unambiguous after reading the four files, the change is good.

## Migration Plan

This is a docs-only change. The migration is the same as the apply step:

1. Create the four files under `.development-plan/09-iteration/`.
2. Edit `AGENTS.md` to add one line under "Iteration cycle".
3. Edit `.development-plan/08-iteration/summary.md` to add the "Next iteration" section.
4. Edit the three pointer files (`07-…`, `08-…`, `09-…`) in `.development-plan/08-iteration/` to point at the new catalogs and the storybook-is-per-feature rule.
5. Run `openspec validate add-09-iteration-catalog` to confirm the new capability and the two MODIFIED requirements parse.
6. Run `bun run check` to confirm no tooling drift.
7. Archive the change once the PR merges (`openspec archive add-09-iteration-catalog`).

Rollback is `git revert` of the PR; no state to undo, no migration to reverse.

## Open Questions

- None. The 08-iteration proposal 06 already resolved the structural questions (catalog vs. spec, per-feature folder format, storybook-is-per-feature, no separate storybook runner spec). This change executes that plan.
