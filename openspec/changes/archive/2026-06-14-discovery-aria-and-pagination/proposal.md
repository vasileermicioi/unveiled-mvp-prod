## Why

The 09-iteration catalog flagged 6 P0 rows on the `discover-filters-pagination` capability that share the same mechanical shape: surface-level violations of selector discipline and missing ARIA semantics. The 10-iteration Definition of Done requires every UI surface to be selector-disciplinable, accessible, bilingual, and traceable through a single OpenSpec capability. Bundling these 6 rows into one umbrella change keeps the review surface tight (one proposal, one capability delta) while preserving the per-row gherkin + storybook story the Definition of Done requires.

## What Changes

- Refactor each of the 6 absorbed surfaces to comply with the proximity+layout selector discipline.
- Add the missing `aria-*` attributes, labels, and landmark wrappers required for selector-disciplinable selection on every absorbed row.
- Localize any new copy in DE and EN via `src/lib/i18n.ts` (i18n parity unit test must pass).
- Add a `<component>.stories.tsx` story for every absorbed row that touches a component (`SearchFilterUi.stories.tsx`, `UrlStateSync.stories.tsx`, `AriaLivePoliteOnResultsCount.stories.tsx`, `MapComponentLabels.stories.tsx`, `CalendarIcsDownload.stories.tsx`, `FilterChipsWrappedInFormRoleSearch.stories.tsx`). Each story gets at least one `@storybook/test` `play` interaction test.
- Add a `feature.feature` per absorbed row (one happy-path + one edge case) under the per-feature folder, using only proximity + layout selectors.
- Update the `discover-filters-pagination` capability spec with one `## MODIFIED Requirements` block per absorbed row.

Absorbed rows:

1. `search-filter-aria` — **Search & filter UI** (`discover-filters-pagination, forms-actions`) — `selector-discipline-violation, missing-aria`
2. `url-state-sync` — **URL state sync (filters, sort, page)** (`discover-filters-pagination, routing`) — `no issues flagged`
3. `results-count-aria-live` — **`aria-live="polite"` on results count** (`discover-filters-pagination`) — `missing-aria`
4. `map-component-aria` — **Map component labels** (`discover-filters-pagination`) — `missing-aria`
5. `ics-download-aria` — **Calendar `.ics` download** (`discover-filters-pagination, data-access`) — `missing-aria`
6. `filter-chips-form-search` — **Filter chips wrapped in `<form role="search">`** (`discover-filters-pagination`) — `selector-discipline-violation`

Each absorbed row keeps its own per-feature sub-folder under `10-iteration/features/improvements/discovery-aria-and-pagination/<row-slug>/` with `proposal.md`, `tasks.md`, `feature.feature`, `<component>.stories.tsx`, and `specs.md` so the per-row Definition of Done is satisfied. This umbrella's `proposal.md` is the single OpenSpec change proposal; the per-row folders are the implementation unit.

## Capabilities

### New Capabilities

_None_ — refactor of an existing capability.

### Modified Capabilities

- `discover-filters-pagination`: 6 rows add a `## MODIFIED Requirements` block (search-filter-aria, url-state-sync, results-count-aria-live, map-component-aria, ics-download-aria, filter-chips-form-search).

## Impact

- New files:
  - One OpenSpec change at `openspec/changes/discovery-aria-and-pagination/` containing `proposal.md` + `design.md` + `tasks.md` + `specs/discover-filters-pagination/spec.md`.
  - One per-feature folder at `10-iteration/features/improvements/discovery-aria-and-pagination/` with this umbrella's `proposal.md` (mirrored) + `tasks.md` (mirrored), plus a `<row-slug>/` sub-folder per absorbed row containing the per-row `proposal.md` + `tasks.md` + `feature.feature` + `<component>.stories.tsx` + `specs.md`.
- Modified files: the components under `src/components/` or `src/lib/` that the absorbed rows touch; the `openspec/specs/discover-filters-pagination/spec.md` capability spec; `src/lib/i18n.ts` for any new copy.
- Dependencies: none new.
- Out of scope: any other 09-iteration row whose capability is not in this umbrella's absorbed set; those land in their own umbrella.
