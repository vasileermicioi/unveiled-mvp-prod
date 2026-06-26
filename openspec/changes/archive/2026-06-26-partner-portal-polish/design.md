## Context

The partner portal (`packages/app/src/components/unveiled/PartnerPortal.tsx`) currently reads the partner's confirmed bookings through a server endpoint backed by `packages/api/src/data-access/repositories.ts` and `packages/api/src/routes/data-access/index.ts`. That loader enforces a hard-coded `.limit(100)` on the partner guest query (see the existing call site) and the check-in mutation returns failures only as silent TanStack Query `isError` flags, so operators see a stale row state and no row-scoped feedback when the server rejects a check-in.

The admin surface (`Admin Dashboard Lists Pagination Controls`) already paginates members, partners, and events through a `<Pagination />` atom plus `?*Page=…&*PageSize=…` query params, so the contract and primitive are proven. This change reuses that contract for the partner guest list and adds row-scoped error feedback that mirrors the admin tab fetch-failure pattern (`ShellStatusBanner` with retry) but is scoped per `bookingId` so individual rows can recover independently.

## Goals / Non-Goals

**Goals:**

- Replace the hard-coded `100` row cap on the partner guest list with a paginated response that supports `pageSize = {10, 20, 50}` (default `20`) and returns `{ guests, totalCount, page, pageSize, hasMore }`.
- Reuse the existing `<Pagination />` atom (admin) for the partner surface so styling, a11y, and query-string wiring are consistent.
- Surface every check-in failure as a per-row `<ShellStatusBanner type="error">` keyed by `bookingId`, dismissed on the next successful refetch.
- Render an "Already used" `<Badge tone="dark">` and disable the "Check in" button for rows whose status is `USED`.

**Non-Goals:**

- Bulk check-in (separate iteration).
- CSV export beyond the existing 100-row cap (out of scope for v1; the export endpoint is unaffected).
- New server-side authorization checks; the existing partner-owns-event check is reused.
- Changing the admin tab pagination contract or the `ShellStatusBanner` primitive.

## Decisions

- **Reuse the admin `<Pagination />` atom.** The atom already speaks `page`, `pageSize`, `totalCount`, `hasMore`, and renders the page-size dropdown that resets `page` to `1`. Wiring it into the partner portal keeps the UX consistent with admin and avoids introducing a partner-specific primitive. The alternative (a bespoke partner paginator) was rejected because it would duplicate behaviour and bypass the `check:atomic-layers` gate's "reuse atoms" pressure.
- **Query string contract mirrors admin tabs.** `?partnerGuestsPage=<n>&partnerGuestsPageSize=<m>` aligns with `?membersPage=…&membersPageSize=…`, so the API route handler can reuse the same numeric-coercion + defaulting helpers and the existing TypeSpec patterns. Defaults are clamped server-side: `page` defaults to `1`, `pageSize` defaults to `20`, max `50`.
- **Server counts once and reuses the page query.** The loader issues a single `count()` and a single `limit/offset` slice so the response is one round-trip and stays cacheable. `hasMore` is computed from `page * pageSize < totalCount`. The alternative (a `nextCursor` cursor) was rejected because the admin surface already commits to offset/limit and consistency wins.
- **Per-row banners are keyed by `bookingId` and live in component state, not the TanStack Query cache.** This guarantees they survive a `refetch()` (which would otherwise clear `mutation.error`) and are scoped to the row that triggered the failure. The component clears the banner for a `bookingId` when the row's status changes away from `PENDING_*` after a successful refetch.
- **"Already used" is a render-time decision, not a server-side mutation.** The check-in mutation must still reject re-check-in on the server (defence in depth); the UI simply hides the trigger by disabling the button. This keeps the existing mutation contract unchanged.
- **TypeSpec contract update.** Add optional `partnerGuestsPage` / `partnerGuestsPageSize` integer query params to the partner data-access route, then regenerate `typespec/output/` and `src/lib/generated/` via `bun run specs:gen`. `bun run specs:check` enforces drift.

## Risks / Trade-offs

- **[Risk] Two concurrent failures across rows render two banners.** → **Mitigation:** the banner list is keyed by `bookingId` and dedupes per row, so the visual stack stays bounded by the visible page (default 20).
- **[Risk] Per-row banner state diverges from server truth after a refetch.** → **Mitigation:** banners are cleared whenever the row's status moves to `USED` (the only path that produces a server-confirmed success) or whenever the row disappears from the page (e.g. on a page change).
- **[Risk] Page-size dropdown drift between partner and admin surfaces if admin changes first.** → **Mitigation:** both surfaces consume the same `<Pagination />` atom; the dropdown options are defined once on the atom. Any future option change ripples automatically.
- **[Risk] Removing the `.limit(100)` cap exposes large-query latency.** → **Mitigation:** the loader keeps the count and slice in a single transaction; at 10 000 confirmed bookings per venue the slice is still O(pageSize) and the count is O(1) via the indexed `bookings.partnerId` filter. No mitigation needed beyond keeping `pageSize` capped at `50`.
- **[Risk] Existing gherkin scenarios against the partner surface expect the old query string.** → **Mitigation:** the default `pageSize = 20` matches the old behaviour for the first page, and the new `partnerGuestsPage` query param is optional (defaulting to `1`), so the absence of a query string still resolves to the same first page as before.

## Migration Plan

1. Land the API changes (`repositories.ts` + `routes/data-access/index.ts`) first so the response shape is available before the UI consumes it.
2. Update the TypeSpec partner data-access route to declare the new optional query params, then `bun run specs:gen` and commit the regenerated artifacts. `bun run specs:check` must pass.
3. Land the `PartnerPortal.tsx` UI changes (pagination wiring, "Already used" badge, disabled button, per-row banner state).
4. Add `tests/features/partner/guest-pagination/` and `tests/features/partner/check-in-failure/` feature folders with co-located Ladle harnesses; `bun run test:ladle` and `bun run ladle:coverage` must pass.
5. Run `bun run check` (which fans out per-package lint/typecheck, `biome check`, `specs:check`, `tokens:check`, `ladle:coverage`, `check:atomic-layers`, `check:styling-ownership`, and the permanent `bun run test:unit`).
6. Rollback: revert the API changes first (the UI tolerates the old shape on the first page), then revert the UI.

## Open Questions

- Should the partner export endpoint honour `partnerGuestsPage` / `partnerGuestsPageSize` for parity, or keep its existing 100-row cap for v1? Decision: **keep the existing cap** for v1 (out of scope; tracked separately).
- Should "Already used" rows be filterable out via a hidden tab, or always rendered? Decision: **always rendered** with the badge and disabled button so the audit trail stays visible.