## Context

The migrated app already exposes pagination state in two places that
are not wired through to the data layer:

1. **Admin surface.** `packages/app/src/components/unveiled/context.tsx`
   tracks `membersPage`, `membersPageSize`, `partnersPage`,
   `partnersPageSize`, `eventsPage`, `eventsPageSize` in React state.
   The `AdminPanel` organism renders a `<Pagination>` component (see
   `packages/app/src/components/admin/admin-pagination.tsx`) and
   exposes previous/next buttons, but its `useEffect` issues
   `fetchAdminData(...)` without serializing those state slices into
   the request URL. The API defaults to `page=1&pageSize=20`, so a
   "Next page" click visually advances the local counter but never
   advances the dataset.

2. **Public discover surface.** `packages/app/src/components/unveiled/PublicDiscover.tsx`
   renders the discovery grid but no `<Pagination>` component. The
   loader `getPublicDiscoveryData` in
   `packages/api/src/data-access/repositories.ts` accepts only a
   `page` query param (page size hard-coded to 6) and returns
   `{ items, totalCount, hasMore }`. The route's Zod schema in
   `packages/api/src/routes/data-access/index.ts` does not declare a
   `pageSize` knob. Deep links like
   `/de/discover?page=3&pageSize=24` therefore fall back to
   `pageSize=6`.

The pagination seed dataset (50 members, 42 partners, 65 events, 40
bookings) landed in proposal 04 but no surface consumes it; the BDD
parity specs in proposal 11 cannot assert end-to-end pagination
behavior until this change lands.

## Goals / Non-Goals

**Goals:**

- One click on "Next" in any admin tab advances the dataset via the
  API Worker using `*Page` / `*PageSize` query params.
- Public discover is paginated end-to-end through URL search params
  (deep-linkable: `/de/discover?page=3&pageSize=24`).
- Changing the page size on any tab resets the matching page index
  to 1.
- The TypeSpec contract under `typespec/data-access/index.tsp` is
  regenerated and `bun run specs:check` is green.

**Non-Goals:**

- Infinite scroll.
- Sorting (separate iteration).
- Persisting admin page state across navigation (admin URLs stay
  stable; admin deep-links target events, not pages).
- Server-side cursor pagination (offset/limit is sufficient at this
  scale).

## Decisions

- **URL search params are the source of truth for `page` /
  `pageSize` on the public discover surface.** Rationale: deep links
  must reproduce the same view (already required by the existing
  `URL State Sync For Filters Sort And Page` requirement in
  `discover-filters-pagination`). The `PublicDiscover` component
  reads `useSearchParams()` and feeds both `page` and `pageSize`
  into the React Query key for `getPublicDiscoveryData`. Filter
  mutations drop the `page` param and keep `pageSize`.
- **Admin surface uses React local state for `page` / `pageSize`,
  not URL params.** Rationale: the admin URL is reserved for deep
  links into specific events, partners, and members. Persisting
  pagination in the URL would clutter the back/forward stack and
  break the existing redirect pipeline that builds the
  `redirectTo` query string from `/admin`. The state already lives
  in `unveiled/context.tsx`; we only need to wire it into the
  fetcher.
- **`getPublicDiscoveryData` accepts `pageSize` and clamps to
  `[1, 48]`, defaulting to 6.** Rationale: matches the existing
  curated-events page-size cap (48, surfaced via the
  `<Pagination>` page-size dropdown) and the historical 6-per-page
  default. We clamp server-side rather than reject to keep the
  surface resilient to slightly stale URL state.
- **The response carries `page`, `pageSize`, `totalCount`,
  `hasMore`** (already returned) so the client can highlight the
  active page and disable Previous/Next at the bounds without a
  second round-trip.
- **Filter changes drop `page` (reset to 1) and keep `pageSize`.**
  Rationale: keeps the existing `Filtering resets pagination page`
  requirement in `discover-filters-pagination` working for both
  `page` and `pageSize`. The page-size dropdown stays sticky across
  filter changes.
- **AbortController in the React Query client cancels in-flight
  requests on rapid "Next" clicks.** Rationale: the TanStack Query
  client is configured with abort signals already; we only need to
  ensure the data-access fetchers pass through an
  `AbortSignal`.

## Risks / Trade-offs

- **Race condition on rapid "Next" clicks** → use the existing
  TanStack Query `AbortSignal` so the slower response does not
  overwrite the newer one.
- **`getPublicDiscoveryData` returns 4 fields now (`page`,
  `pageSize`, `totalCount`, `hasMore`); existing callers may
  destructure the old shape.** → grep for destructures of the
  return value before regenerating types and update them in lockstep
  with the spec. The TypeSpec emitter will surface the new shape via
  `src/lib/generated/`.
- **Admin page-size dropdown can reset to a value that yields zero
  rows for the current filter set.** → the existing `<Pagination>`
  already handles empty results; no additional state needed.
- **Filter changes on the public surface must reset `page` to 1 but
  keep `pageSize`.** → encoded as a single `useSearchParams`
  update helper so the page-size and filter reducers do not drift.

## Migration Plan

- Land the API change first (Zod schema + repository signature),
  regenerate TypeSpec via `bun run specs:gen`, and verify
  `bun run specs:check` is green.
- Wire the admin `useEffect` dependencies and the public discover
  fetcher key in lockstep with the API change so the UI is never
  reading from an out-of-sync contract.
- Add the new gherkin feature files and run `bun run test:e2e`
  against the orchestrator's port-4320 proxy plus
  `bun run test:ladle` for any new stories.
- Roll back by reverting the change; no DB migration is involved and
  the admin state is local React state, so the worst-case regression
  is "Next page" again doing nothing locally — the pre-change
  behavior.

## Open Questions

None — all surface decisions are pinned by existing capability
specs (`Pagination Controls And Limits`, `URL State Sync For Filters
Sort And Page`, `Filtering resets pagination page`).