## 1. API — paginated partner guest loader

- [x] 1.1 In `packages/api/src/data-access/repositories.ts`, add `partnerGuestsPage` and `partnerGuestsPageSize` parameters to the partner loader. Default `pageSize = 20`, clamp to `[1, 50]`. Return `{ guests, totalCount, page, pageSize, hasMore }`.
- [x] 1.2 Remove the hard-coded `.limit(100)` cap on the partner guest query and replace it with the new `limit = pageSize` / `offset = (page - 1) * pageSize`. Issue a single `count()` alongside the slice in the same transaction.
- [x] 1.3 In `packages/api/src/routes/data-access/index.ts`, accept `partnerGuestsPage` and `partnerGuestsPageSize` query params with the same defaults + clamps. Return the new response shape.

## 2. App — PartnerPortal pagination, badge, and per-row banner

- [x] 2.1 In `packages/app/src/components/unveiled/PartnerPortal.tsx`, render a `<Pagination />` below the guest list. Wire the page + pageSize state into the TanStack Query fetcher via the new `partnerGuestsPage` / `partnerGuestsPageSize` query params. Reset `page` to `1` whenever `pageSize` changes.
- [x] 2.2 For each row, render an "Already used" `<Badge tone="dark">` next to the guest name when `row.status === "USED"`, and render the row's "Check in" button in a disabled state.
- [x] 2.3 Maintain a `Map<bookingId, string>` of per-row error messages in component state. On check-in mutation failure, write the failure message keyed by `bookingId`. Render a `<ShellStatusBanner type="error">` above each affected row. Clear the entry when the row's status changes to `USED` after a successful refetch, or when the row drops off the current page.

## 3. TypeSpec contract

- [x] 3.1 In `typespec/`, declare optional `partnerGuestsPage` and `partnerGuestsPageSize` integer query params on the partner data-access route. Run `bun run specs:gen` and commit the regenerated artifacts under `typespec/output/` and `src/lib/generated/`.
- [x] 3.2 Run `bun run specs:check` and confirm no drift.

## 4. Tests — gherkin + Ladle coverage

- [x] 4.1 Add `tests/features/partner/guest-pagination/feature.feature` with two scenarios: paginates (clicks Next, asserts query string updates), and already-used (asserts the badge + disabled button render).
- [x] 4.2 Add `tests/features/partner/guest-pagination/<component>.ladle.tsx` covering the pagination states (default page, last page, page-size change).
- [x] 4.3 Add `tests/features/partner/check-in-failure/feature.feature` with one scenario: a cancellation (`CANCELLED_PENDING`) booking surfaces a per-row `ShellStatusBanner`.
- [x] 4.4 Add `tests/features/partner/check-in-failure/<component>.ladle.tsx` covering the per-row banner states (no banner, error banner keyed by `bookingId`, banner cleared after successful refetch).
- [x] 4.5 Run `bun run test:ladle` and `bun run ladle:coverage` and confirm no drift.

## 5. Docs

- [x] 5.1 Update `docs/operations.md` with the new partner guest list pagination contract (`?partnerGuestsPage=…&partnerGuestsPageSize=…`, default `20`, max `50`) and the per-row banner behaviour.

## 6. Quality gates

- [x] 6.1 Run `bun run check` and confirm green (per-package typecheck + `biome check .` + `specs:check` + `tokens:check` + `ladle:coverage` + `check:atomic-layers` + `check:styling-ownership` + `bun run test:unit`).
- [x] 6.2 Run `bun run test:e2e` and confirm the gherkin parity suite still passes against the orchestrator's port-4320 proxy.
- [x] 6.3 Verify `GET /healthz` returns `200 ok` and `GET /readyz` returns `200` after the changes.