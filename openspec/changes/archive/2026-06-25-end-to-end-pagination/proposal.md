## Why

The pagination seed dataset (50 members, 42 partners, 65 events, 40
bookings) landed in proposal 04 but no surface in the migrated app
actually consumes it. The admin `AdminPanel` already tracks
`membersPage`, `partnersPage`, `eventsPage` in local React state and
renders a `<Pagination>` component, yet its fetcher calls still default
to `page=1&pageSize=20` so a click on "Next page" never reaches the
API. The public discover endpoint (`getPublicDiscoveryData`) only
accepts `page` (no `pageSize` knob; page size hard-coded to 6) and the
public `PublicDiscover` UI never renders the `<Pagination>` component,
so `/discover?page=3` returns an empty grid and there is no "Next"
button on the public surface.

Without this change, the seeded pagination dataset has no consumer and
both the admin tabs and the public discover surface are stuck on page
1. Closing the loop is a prerequisite for the admin and discover BDD
parity specs in proposal 11.

## What Changes

- Wire the admin `membersPage` / `membersPageSize`, `partnersPage` /
  `partnersPageSize`, and `eventsPage` / `eventsPageSize` React state
  into the admin data fetcher URL on every refetch, and reset
  `membersPage` / `partnersPage` / `eventsPage` to 1 when the
  matching `pageSize` or filter set changes.
- Extend `getPublicDiscoveryData` (and its Zod query schema) to accept
  a `pageSize` parameter (default 6, capped at 48) and to return
  `page`, `pageSize`, `totalCount`, `hasMore`.
- Render the existing `<Pagination>` component below the public
  discover grid, sourced from `useSearchParams` so deep links such as
  `/discover?page=3&pageSize=24` (locale-prefixed) work.
- Wire the discovery fetcher's query key to `page` and `pageSize` so
  changing the URL triggers a refetch and filter changes reset to
  page 1.
- Cover the wired admin tabs and the public discover pagination with
  BDD feature specs at `tests/features/operations/pagination/` and
  `tests/features/discover/pagination/`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `operations`: extend the existing **Admin Dashboard Lists Pagination
  Controls** requirement so the admin fetcher MUST send `page` and
  `pageSize` query params for each tab on every refetch and MUST
  reset `page` to 1 on filter or page-size change.
- `discover-filters-pagination`: extend the existing **Public
  Discovery Pagination** requirement so the public discover endpoint
  accepts `pageSize` (default 6, max 48) in addition to `page`, the
  response carries `page`, `pageSize`, `totalCount`, `hasMore`, and
  the UI renders the `<Pagination>` component below the grid driven
  by `useSearchParams`.

## Impact

- **Touched code:**
  - `packages/app/src/components/unveiled/context.tsx` — pipe the
    per-tab `page` / `pageSize` state into the admin data fetchers
    via `useEffect` dependencies and search-param serialization.
  - `packages/app/src/components/unveiled/AdminPanel.tsx` — render a
    `pageSize` `<Select>` next to each tab's `<Pagination>` and call
    `setXxxPage(1)` on change.
  - `packages/app/src/components/admin/admin-pagination.tsx` —
    optional surface change to expose a `pageSize` slot (no behavior
    change unless needed).
  - `packages/api/src/data-access/repositories.ts` — accept `pageSize`
    on `getPublicDiscoveryData` and return `page`, `pageSize`,
    `totalCount`, `hasMore`.
  - `packages/api/src/routes/data-access/index.ts` — extend the Zod
    query schema for the public discover endpoint with `pageSize`
    (`z.coerce.number().int().min(1).max(48).default(6)`).
  - `packages/app/src/components/unveiled/PublicDiscover.tsx` —
    render `<Pagination />` below the grid and read `page` /
    `pageSize` from `useSearchParams`.
  - `typespec/data-access/index.tsp` — re-run `bun run specs:gen` to
    reflect the new `pageSize` query param and response shape.
- **Tests:** new gherkin feature files at
  `tests/features/operations/pagination/feature.feature` and
  `tests/features/discover/pagination/feature.feature`; co-located
  Ladle harnesses.
- **No new external dependencies.** No DB migration. No new env vars.

## Out of Scope

- Server-side cursor pagination (offset/limit is sufficient at this
  scale).
- Sorting (covered by a separate iteration).
- Persisting admin page state across navigation (admin URL stays
  stable; admins deep-link to events, not to pages).