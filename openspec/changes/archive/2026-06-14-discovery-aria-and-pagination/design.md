## Context

The `discover-filters-pagination` capability currently passes its functional requirements (instant filter updates, 6-per-page pagination, bounds-aware controls) but fails the 10-iteration Definition of Done on accessibility and selector discipline. Six discrete UI surfaces on the discovery experience (search/filter inputs, URL state sync, results count, map component, `.ics` download, filter chips) are either missing `aria-*` attributes, missing landmark wrappers, or are addressed in tests via raw text/role chains instead of proximity+layout selectors.

The 09-iteration catalog surfaces 6 P0 rows that all target the same capability. Bundling them into one umbrella change keeps the OpenSpec review surface tight (one proposal, one capability delta) while preserving the per-row `feature.feature` + `<component>.stories.tsx` artifacts the 10-iteration Definition of Done requires for each individual row.

Stakeholders: the discovery team owns the surfaces; the platform team owns the design tokens and i18n harness; the QA team owns the gherkin parity harness and storybook coverage gate.

## Goals / Non-Goals

**Goals:**

- Make every absorbed surface selector-disciplinable (proximity + layout only — no `getByText` chains, no `data-testid` for production behavior).
- Add the missing `aria-*` attributes, labels, and landmark wrappers required for accessible discovery interactions (screen-reader announce, focus order, role exposure).
- Localize any new visible copy in DE and EN via the existing `src/lib/i18n.ts` harness.
- Ship a per-row `feature.feature` (one happy-path + one edge case) and a per-row `<component>.stories.tsx` (with a `@storybook/test` `play` interaction test) so each absorbed row passes the 10-iteration Definition of Done individually.
- Keep the OpenSpec review surface to a single change with a single capability delta; per-row folders are the implementation unit, not separate OpenSpec changes.

**Non-Goals:**

- Any new feature work, microservice, or new dependency.
- Touching the legacy `_old_app/` tree.
- Editing the generated `typespec/output/` or `src/lib/generated/` artifacts by hand.
- Adding `data-testid` attributes that gate production logic.
- Changing the functional behavior of filters, pagination, or sort beyond what's required to expose the new accessibility hooks and landmark wrappers.
- Backing out the existing `discover-filters-pagination` requirements (instant filter update, 6-per-page, bounds-aware controls) — these stay; we only add the accessibility + selector discipline MODIFIED requirements.

## Decisions

- **One OpenSpec change, six implementation units.** The umbrella `proposal.md` is the single OpenSpec change; the per-row `<row-slug>/` folders under `10-iteration/features/improvements/discovery-aria-and-pagination/` carry the per-row `proposal.md` + `tasks.md` + `feature.feature` + `<component>.stories.tsx` + `specs.md`. This keeps the proposal:delta ratio 1:1 and satisfies the per-row Definition of Done without inflating the OpenSpec change set.
- **Landmark strategy: `<form role="search">` for filter chips, `<section aria-labelledby>` for the map and results regions.** These are the two landmark patterns the absorbed rows need; we use them consistently so screen-reader rotor navigation is predictable across the discovery page.
- **`aria-live="polite"` on the results count node, not on the grid container.** Putting the live region on the count string means the screen reader announces the new total without re-announcing the whole grid, which would be noisy.
- **Map labels via `<a role="button" aria-label>` on the marker control + a single `aria-label` on the map container keyed off the visible heading.** Leaflet markers are `<img>`-like elements; we label the interactive layer, not the raw tile images.
- **URL state sync stays inside the existing TanStack Query key, no new store.** We keep `searchParams` as the single source of truth and let the existing filter/pagination reducer write back to the URL via `history.replaceState`. We do not introduce a new state library.
- **`.ics` download uses `<a href="..." download aria-label="...">` rather than a `<button>`.** A real anchor with `download` is the only reliable way to trigger a file download in a no-JS context and exposes the filename to assistive tech; a `<button>` would need a hidden iframe or blob hack.
- **i18n keys are namespaced per row.** New keys land under `discover.<row-slug>.*` so the i18n parity unit test can scope to the absorbed rows and reviewers can diff cleanly.
- **Stories use `@storybook/test` `play` functions with `expect(...).toBeInTheDocument` and role/label lookups.** This keeps stories aligned with the proximity+layout selector discipline the gherkin uses; the storybook coverage gate will catch any drift.
- **No new TypeSpec route / Astro Action added.** None of the absorbed rows introduce a new HTTP route or typed server action; the URL state sync happens in the client and the `.ics` download reuses the existing endpoint. `bun run specs:check` will continue to pass without regeneration.

## Risks / Trade-offs

- **[Risk]** Six surfaces change in one umbrella — a single reviewer's diff is large. → **[Mitigation]** Each absorbed row owns its `<row-slug>/` folder and its own `tasks.md`; reviewers can approve row-by-row. The umbrella PR description links to each row's tasks list.
- **[Risk]** Adding `aria-labelledby` requires the visible heading to be a real heading element (`<h2>`/`<h3>`) — refactoring the discovery page to use semantic headings may touch CSS. → **[Mitigation]** Discover page already uses semantic headings; the new `id` attributes are additive. We run `bun run check` and a visual smoke to confirm layout integrity.
- **[Risk]** The `<form role="search">` wrapper changes how Enter-to-submit behaves; if any absorbed filter currently relies on per-input `onChange` only, wrapping in a real form will start intercepting Enter. → **[Mitigation]** We migrate the filter chips to use the form's `onSubmit` and call `event.preventDefault()`; the URL state sync decision above keeps the client reducer the source of truth so no native form submission escapes.
- **[Risk]** `aria-live="polite"` can over-announce if the count updates on every keystroke. → **[Mitigation]** Debounce the count update to match the existing React Query refetch cadence; the spec scenario asserts the live region updates only on settled results, not on intermediate loading states.
- **[Risk]** Storybook coverage drift — the gate will fail if any `@story(...)` tag is added without a matching story. → **[Mitigation]** The per-row `tasks.md` includes a `bun run storybook:coverage` step that runs before the umbrella is considered done.
- **[Risk]** i18n parity unit test will fail if a new English key is added without a German counterpart (or vice versa). → **[Mitigation]** The per-row `tasks.md` lists adding both locales as a single checkbox; CI runs the parity test on every commit.

## Migration Plan

- Land the per-row `<row-slug>/` folders first (proposal + tasks + feature.feature + stories + specs.md) so the Definition of Done is reviewable per row.
- Apply the component refactors row-by-row against the umbrella OpenSpec change; each row's PR keeps the umbrella green.
- Once all six rows land and `bun run check` + `bun run test:e2e` + `bun run test:storybook` + `bun run storybook:coverage` + `bun run specs:check` + `bun run arch:check` + `bun run tokens:check` are all green, run `openspec archive discovery-aria-and-pagination` to fold the MODIFIED requirements into the live `openspec/specs/discover-filters-pagination/spec.md` and flip the 09-iteration catalog rows for every absorbed row to `status: specced` (then `merged` after the implementation lands).
- Rollback: each absorbed row is independent — a regression in one row can be reverted by reverting the matching `<row-slug>/` folder and the matching component commit without touching the other five rows.

## Open Questions

- None. The absorbed rows are scoped tightly enough that the catalog flags + Definition of Done requirements fully determine the work.
