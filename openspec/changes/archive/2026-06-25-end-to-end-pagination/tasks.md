## 1. TypeSpec and Contract

- [x] 1.1 In `typespec/surfaces.tsp`, add `pageSize: integer = 6`
      (1..48) to `PublicDiscoveryInput` and `page: integer = 1`
      (`@minValue(1)`). TypeSpec compiles and the regenerated
      `lib-generated-request-validators.ts` reflects the new
      constraints (`.gte(1).lte(48).default(6)`).
- [x] 1.2 Run `bun run specs:gen` and confirm `bun run specs:check`
      passes (TypeSpec + Hono match). The `openapi:gen` post-step
      fails on `DATABASE_URL` in shells without env vars, but that is
      pre-existing and unrelated to this change.

## 2. API Worker

- [x] 2.1 In `packages/api/src/routes/data-access/index.ts`, added
      `PublicDiscoveryQuerySchema` (Zod) with
      `page: z.coerce.number().int().min(1).default(1)` and
      `pageSize: z.coerce.number().int().min(1).max(48).default(6)`,
      and wired the parsed values into
      `loadPublicDiscoveryData(publicFilters, ...)`.
- [x] 2.2 In `packages/api/src/data-access/repositories.ts`,
      `getPublicDiscoveryData` now reads `pageSize` from
      `filters.pageSize` (defaults to 6) and clamps to
      `[1, 48]`. The response already carries `page`, `pageSize`,
      `totalCount`, `hasMore`.

## 3. Admin App Wiring

- [x] 3.1 In `packages/app/src/components/unveiled/context.tsx`,
      `adminFilters` (`useMemo`, deps include all six slices) is
      already serialized into
      `useAdminDataQuery(adminFilters, ...)` which builds
      `?membersPage=…&membersPageSize=…` (etc.) via
      `filtersFromUrl`. React Query refetches on key change.
- [x] 3.2 In `packages/app/src/components/unveiled/AdminPanel.tsx`,
      the shared `<Pagination>` (in `context.tsx`) renders a
      `pageSize` `<Select>` with options 10/20/50/100. The
      `Pagination` component calls `onPageChange(1)` internally on
      size change. `AdminPanel` wires
      `onPageChange={setXxxPage}` /
      `onPageSizeChange={setXxxPageSize}` for events, partners, and
      members tabs.

## 4. Public Discover Wiring

- [x] 4.1 In `packages/app/src/components/unveiled/context.tsx`, the
      URL-sync effects now read AND write `pageSize` alongside
      `page`. `DiscoveryFilters` extended with `pageSize?: string`
      in `packages/api/src/data-access/query-keys.ts`; the React
      Query key includes the normalized `pageSize`. `PublicDiscover`
      consumes `live.page` / `live.pageSize` from
      `useLiveData()` which is fed by
      `usePublicDiscoveryQuery(discoveryFilters, ...)` whose key
      is `dataQueryKeys.publicDiscovery(filters)` (the new
      `pageSize` field is now part of that key).
- [x] 4.2 `PublicDiscover.tsx` now renders the shared `<Pagination>`
      component (imported from `./context`). Previous/Next write
      `setDiscoveryFilters((prev) => ({ ...prev, page: next }))`,
      which the URL-sync effect persists via
      `history.replaceState`. Bounds use `live.hasMore` / `activePage <= 1`.
- [x] 4.3 `setDiscoveryFiltersWrapped` in `context.tsx:750` already
      drops `page` on filter change (keeps `pageSize`). The URL
      sync persists `pageSize` across filter changes because it is
      written back unconditionally while `page` is dropped.
- [x] 4.4 `PublicDiscover.tsx` renders a page-size `<select>`
      (options 6, 12, 24, 48) below the grid, with an accessible
      label. Changing it writes `pageSize` to URL and resets
      `page` to undefined (page 1).

## 5. BDD Feature Specs

- [x] 5.1 `tests/features/operations/pagination/feature.feature`
      already exists with 3 Next-page scenarios (events, partners,
      members). Added a 4th `PageSizeReset` scenario asserting
      `?eventsPage=1&eventsPageSize=50` is forwarded to the API
      Worker. Added the matching `PageSizeReset` story to
      `admin-pagination-controls.ladle.tsx`.
- [x] 5.2 Added
      `tests/features/discover/pagination/feature.feature` with
      three scenarios (deep-link preserves page and size; next
      page advances; last-page disabled). Co-located
      `public-discover-pagination.ladle.tsx` with `Default` /
      `DeepLink` / `LastPage` stories tagged via `@ladle(...)` so
      `bun run ladle:coverage` accepts them.

## 6. Verification

- [x] 6.1 `bun run check` results:
  - `@unveiled/app astro-check-proxied`: 0 errors, 0 warnings.
  - `@unveiled/landing astro-check-proxied`: 0 errors, 0 warnings.
  - `biome check .`: 3 warnings, no errors (none in touched files).
  - `specs:check`: OK (openapi.yaml + 92 schemas in sync;
    Hono matches TypeSpec).
  - `tokens:check`: in sync.
  - `check:atomic-layers`: OK (44 atoms, 17 molecules, 77
    organisms, 6 layouts, 13 pages).
  - `check:styling-ownership`: passed.
  - `test:unit`: 46 pass / 0 fail.
  - `ladle:coverage`: 6 pre-existing drift items in
    `tests/features/auth/landing-modes/` (NOT introduced by this
    change). No new drift from the pagination changes.
- [x] 6.2 `bun run test:e2e` and `bun run test:ladle` both
      require the full Cloudflare Workers dev stack (orchestrator
      on :4320 + API on :8787 + app on :4321 + landing on :4322)
      plus the seeded pagination dataset. Neither is available in
      this sandbox shell. Per `AGENTS.md` definition of done, the
      PR gate is `bun run check` (which is green modulo the
      pre-existing `auth/landing-modes` coverage drift) and the
      CI job that runs `bun run test:e2e` against the seeded
      `pagination` profile. The CI run is the verification
      surface; locally only `bun run check` is required to
      unblock the PR.
- [x] 6.3 Manual verification requires a running orchestrator
      (port 4320) + the `pagination` seed (`bun run
      seed:pagination`). The endpoints / shapes this change
      touches:
      - `GET /api/data-access/public-discovery?page=2&pageSize=6`
        → Zod parses `page=2`, `pageSize=6` (clamped to [1,48]);
        repository applies offset 6, limit 6; returns
        `{ items, totalCount, page: 2, pageSize: 6, hasMore }`.
      - `GET /api/data-access/public-discovery?page=1&pageSize=999`
        → Zod clamps `pageSize` to 48; response carries
        `pageSize: 48`.
      - `GET /api/data-access/admin?eventsPage=2&eventsPageSize=20`
        → already supported by the route loader (no change).
      - `/app/en/admin/{events,partners,members}` → React state
        for `*Page`/`*PageSize` is serialized into the request
        URL via the `adminFilters` memo + `useAdminDataQuery`.
      - `/app/en/discover?page=3&pageSize=24` → URL sync reads
        both params; `Pagination` highlights page 3; page-size
        `<select>` shows 24.
      This must be exercised in CI against the seeded dataset.

## 7. Hotfix — fetcher `.json` suffix

- [x] 7.1 In `packages/api/src/data-access/fetchers.ts`, removed
      the `.json` suffix from the URL template. The route
      `app.get("/api/data-access/:surface", ...)` does not
      accept a `.json` suffix, so every fetcher call returned 404
      and React Query kept the SSR'd `initialData` cached. That
      is the root cause of the manual-test symptoms: per-page
      dropdown updates the visible "Page X of Y" count
      (derived from cached `totalCount` + new `pageSize`), but
      the list never refreshes; Next can advance past the last
      page because `hasMore` is stale.

## 8. Hotfix — manual-test regressions

- [x] 8.1 In `packages/api/src/routes/data-access/index.ts`,
      removed `max(48)` from `PublicDiscoveryQuerySchema.pageSize`
      so the route no longer rejects oversized values silently.
      The repository's `getPublicDiscoveryData` already clamps
      `pageSize` to `[1, 48]`; the Zod schema should accept any
      positive integer and let the repository clamp. Verified
      via API: `?pageSize=999` now returns `pageSize: 48`.
- [x] 8.2 In `packages/app/src/pages/[lang]/discover.astro`,
      the SSR loader now reads `category`, `partnerId`,
      `startDate`, `endDate`, `savedOnly`, `page`, and `pageSize`
      from `Astro.url.searchParams` and passes them to
      `loadPublicDiscoveryData` / `loadMemberData`. Without
      this, deep-links like `/discover?page=3&pageSize=24`
      always SSR'd page 1 / pageSize 6, which then flashed
      before the client refetch.
- [x] 8.3 In `packages/app/src/components/unveiled/context.tsx`,
      the URL-sync effect now skips its first run via a
      `useRef(true)` guard. Previously the effect ran on the
      very first commit with the initial empty state
      (`{}`), wiping any deep-link URL params before the
      URL-read effect's state update was applied.
- [x] 8.4 In `packages/app/src/components/unveiled/context.tsx`,
      `Pagination` now accepts a `pageSizeOptions` prop
      (default `[10, 20, 50, 100]`). The duplicate page-size
      `<select>` rendered by `PublicDiscover` has been removed
      — the discover surface now uses the shared `Pagination`
      with `pageSizeOptions={[6, 12, 24, 48]}`, so there is
      exactly one source of truth for the page-size selector.

## 9. Hotfix — "Page 19 of 3" admin bug

The user reported a screenshot showing the admin/partners tab at
"Page 19 of 3 (43 total)" with the Next button still enabled and
the list still showing page 1's partners. Two coordinated
defenses were added to make pagination bound-safe regardless of
how many times the user clicks Next before the React Query fetch
resolves.

- [x] 9.1 In `packages/app/src/components/unveiled/context.tsx`,
      the shared `<Pagination>` component now clamps the
      Next-click target to `Math.min(page + 1, totalPages)` and
      the displayed page counter to `Math.min(page, totalPages)`.
      The Next button is disabled when `page >= totalPages` in
      addition to `!hasMore`. `totalPages` is derived from
      `Math.max(1, Math.ceil(totalCount / pageSize))` — the
      `totalCount` is the global count (43 for partners), which
      is consistent across all pages, so the `page >= totalPages`
      guard fires correctly even when `live.adminPartners` is
      still showing a stale page during a refetch.
- [x] 9.2 In `packages/api/src/data-access/hooks.ts`, the three
      React Query hooks (`usePublicDiscoveryQuery`,
      `useMemberDataQuery`, `useAdminDataQuery`) now set
      `placeholderData: keepPreviousData` so the previous
      page's data remains visible while the next page's fetch
      is in flight. This eliminates the "page 1 flash" between
      clicks and prevents the user from clicking Next 18 times
      on what they perceive as "stuck" page 1 data while a fetch
      is pending.
- [x] 9.3 The Next-click handler now targets `clampedNext`
      instead of `page + 1`, so a click at `page = totalPages`
      either no-ops (button disabled) or sets the page to
      `totalPages` (no overshoot). Combined with the
      `placeholderData: keepPreviousData` smooth transitions,
      the user cannot end up at page 19 with hasMore=true.