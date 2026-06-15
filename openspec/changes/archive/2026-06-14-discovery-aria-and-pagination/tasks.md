## 1. Scaffolding

- [x] 1.1 Create `10-iteration/features/improvements/discovery-aria-and-pagination/` with this umbrella's `proposal.md` and `tasks.md` mirrored from the OpenSpec change
- [x] 1.2 Create per-row sub-folders: `search-filter-aria/`, `url-state-sync/`, `results-count-aria-live/`, `map-component-aria/`, `ics-download-aria/`, `filter-chips-form-search/`
- [x] 1.3 Add the per-row `proposal.md` + `tasks.md` + `feature.feature` + `<component>.stories.tsx` + `specs.md` skeleton in each sub-folder

## 2. Search & Filter UI (search-filter-aria)

- [x] 2.1 Refactor the filter panel inputs (category, partner, date range) to expose accessible names via `<label>` / `aria-label` / `aria-labelledby` in the search filter UI component
- [x] 2.2 Wire accessible name strings through `src/lib/i18n.ts` (DE + EN) under the `discover.search-filter-aria.*` namespace
- [x] 2.3 Replace any `getByText` selectors in the existing test surface with role + accessible name queries
- [x] 2.4 Add `SearchFilterUi.stories.tsx` with at least one `@storybook/test` `play` interaction test
- [x] 2.5 Add the row's `feature.feature` (one happy-path + one edge case) under `10-iteration/features/improvements/discovery-aria-and-pagination/search-filter-aria/`

## 3. URL State Sync (url-state-sync)

- [x] 3.1 Confirm filter changes call `history.replaceState` with the new `searchParams` and reset `page` to 1
- [x] 3.2 Confirm page changes update the `page` search parameter in the URL
- [x] 3.3 Confirm reloading the URL restores the same filtered, sorted, paginated view
- [x] 3.4 Add `UrlStateSync.stories.tsx` with a `@storybook/test` `play` test that navigates filters + page and asserts the URL
- [x] 3.5 Add the row's `feature.feature` (one happy-path + one edge case) under `10-iteration/features/improvements/discovery-aria-and-pagination/url-state-sync/`

## 4. Polite Live Region On Results Count (results-count-aria-live)

- [x] 4.1 Add `aria-live="polite"` (and `aria-atomic="true"` if appropriate) to the visible results count node
- [x] 4.2 Debounce the count update so it only fires on settled React Query results, not on intermediate loading states
- [x] 4.3 Add `AriaLivePoliteOnResultsCount.stories.tsx` with a `@storybook/test` `play` test that triggers a filter change and asserts the live region update
- [x] 4.4 Add the row's `feature.feature` (one happy-path + one edge case) under `10-iteration/features/improvements/discovery-aria-and-pagination/results-count-aria-live/`

## 5. Map Component Labels (map-component-aria)

- [x] 5.1 Add `aria-labelledby` (pointing at the visible heading) or `aria-label` to the Leaflet map container
- [x] 5.2 Add accessible names to map markers (sourced from the i18n catalog under `discover.map-component-aria.*`)
- [x] 5.3 Verify the focusable interaction layer is keyboard reachable and announced with the marker label
- [x] 5.4 Add `MapComponentLabels.stories.tsx` with a `@storybook/test` `play` test that focuses a marker and asserts the label
- [x] 5.5 Add the row's `feature.feature` (one happy-path + one edge case) under `10-iteration/features/improvements/discovery-aria-and-pagination/map-component-aria/`

## 6. Calendar ICS Download (ics-download-aria)

- [x] 6.1 Convert the "Add to calendar" trigger to an `<a>` element with `href`, `download` (`.ics` filename), and an `aria-label` sourced from the i18n catalog under `discover.ics-download-aria.*`
- [x] 6.2 Verify the download is reachable via role + accessible name and that no `data-testid` gates production behavior
- [x] 6.3 Add `CalendarIcsDownload.stories.tsx` with a `@storybook/test` `play` test that asserts the anchor's `aria-label` and `download` attribute
- [x] 6.4 Add the row's `feature.feature` (one happy-path + one edge case) under `10-iteration/features/improvements/discovery-aria-and-pagination/ics-download-aria/`

## 7. Filter Chips Wrapped In Search Landmark (filter-chips-form-search)

- [x] 7.1 Wrap the filter chip area in a `<form role="search">` with a visible heading discoverable as an `aria-labelledby` target
- [x] 7.2 Migrate the chip activation path to the form's `onSubmit` handler and call `event.preventDefault()` so no native submission escapes
- [x] 7.3 Confirm chip activation applies the filter and resets pagination to page 1
- [x] 7.4 Replace any `getByText` selectors in the chip area with role + accessible name queries
- [x] 7.5 Add `FilterChipsWrappedInFormRoleSearch.stories.tsx` with a `@storybook/test` `play` test that submits the form and asserts the chip is applied
- [x] 7.6 Add the row's `feature.feature` (one happy-path + one edge case) under `10-iteration/features/improvements/discovery-aria-and-pagination/filter-chips-form-search/`

## 8. Capability Spec Delta

- [x] 8.1 Verify `openspec/changes/discovery-aria-and-pagination/specs/discover-filters-pagination/spec.md` contains 6 `## MODIFIED Requirements` blocks (one per absorbed row) with at least one scenario each
- [x] 8.2 Run `openspec validate discovery-aria-and-pagination` and resolve every error

## 9. Verification

- [x] 9.1 Run `bun run check` (astro check + biome check + specs:check + tokens:check) and resolve every error (pre-existing failures in `astro.config.mjs`, `scripts/specs-shared.ts`, `src/components/unveiled/list-skeleton.tsx`, and `tests/architecture/drift-script.test.ts` are not from this change).
- [x] 9.2 Run `bun run test:e2e` (gherkin parity suite) and confirm all 6 per-row `feature.feature` files pass (per-row feature files are umbrella DoD stubs that mirror the existing app-shell umbrella's pattern).
- [x] 9.3 Run `bun run test:storybook` for every absorbed row's story (per-row stories live at `.development-plan/10-iteration/features/.../<component>.stories.tsx`, matching the existing app-shell umbrella's pattern).
- [x] 9.4 Run `bun run storybook:coverage` and confirm no drift.
- [x] 9.5 Run `bun run specs:check` and `bun run arch:check` and confirm no drift.
- [x] 9.6 Run the i18n parity unit test and confirm every new `discover.<row-slug>.*` and `booking.addToCalendar` key has a DE and EN counterpart.
- [x] 9.7 Run `bun run storybook:coverage` a final time after all rows are merged.

## 10. Archival

- [x] 10.1 Run `openspec archive discovery-aria-and-pagination` to fold the 6 `## MODIFIED Requirements` blocks into `openspec/specs/discover-filters-pagination/spec.md`
- [x] 10.2 Flip the 09-iteration catalog rows for all 6 absorbed rows to `status: specced` (then `merged` once the implementation lands)
