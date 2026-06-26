## Why

The admin operations panel renders an empty table for ~200 ms on first paint while the API Worker warms up, and silently keeps showing stale cached data when the API returns a 5xx. Operators hit both states daily: the empty state looks like "no data" and forces a manual refresh, and a failed fetch leaves them reading yesterday's bookings without realising. Both gap into the `operations` capability so the contract has to be extended, not replaced.

## What Changes

- Always render a `<TableSkeleton />` for the active admin tab on first paint and during refetches with no cached data, so the page never flashes an empty row set.
- Surface any per-tab fetch error as a `<ShellStatusBanner type="error">` with a "Retry" action that calls `refetch()`; the cached rows (when present) stay visible below the banner.
- Add a "Stale data" badge next to the admin page title when the most recent fetch failed but cached data is still in the TanStack Query cache, so operators know the rows they're looking at are not fresh.
- Expose a `useAdminTabStatus(tab)` hook from the admin context that returns `{ data, isPending, isError, refetch }` for `events`, `partners`, and `members`.
- Ship the new `<TableSkeleton />` as a presentational design-system organism (restyled on the existing `Card` + `Skeleton` atoms) with a Ladle story and a `motion-safe` shimmer that respects `prefers-reduced-motion`.

## Capabilities

### Modified Capabilities

- `operations`: extend the admin contract so that fetch failures surface as a `ShellStatusBanner` with a retry action, and so that the first paint always renders a loading skeleton for at least the duration of the active tab's first fetch instead of an empty table.

## Impact

- **Touched files (estimated):**
  - `packages/design-system/src/organisms/_shared/table-skeleton/` — new organism (index barrel, `table-skeleton.tsx`, mock + Ladle story) using the existing `Card` + `Skeleton` atoms and a `motion-safe` token-driven shimmer.
  - `packages/design-system/src/index.ts` — re-export the new organism under `Organisms` and the page barrel so Ladle and `app/` can import it.
  - `packages/app/src/components/unveiled/AdminPanel.tsx` — compute `isPending` / `isError` per tab and render the skeleton, banner, and stale-data badge.
  - `packages/app/src/components/unveiled/context.tsx` — add the `useAdminTabStatus` hook and pass `isError` / `refetch` to consumers.
  - `tests/features/admin/loading-state/feature.feature` — two scenarios (first paint skeleton, retry on 5xx).
  - `tests/unit/table-skeleton.test.ts` — snapshot the Ladle story and assert `aria-busy="true"`.
  - `docs/operations.md` — document the new loading + error contract.
- **Behavioural surface:** purely UI; no API Worker contract changes, no Drizzle migrations, no TypeSpec deltas.
- **Dependencies:** none new — reuses the existing `Card`, `Skeleton`, `ShellStatusBanner`, and `Badge` design-system primitives plus the design-token `motion-safe` shimmer.