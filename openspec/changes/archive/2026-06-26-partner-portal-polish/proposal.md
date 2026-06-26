## Why

The partner portal renders the partner's guest list and check-in
controls, but two parity gaps block a production deploy: the guest
list is hard-capped at 100 rows (`packages/api/src/data-access/repositories.ts` — `.limit(100)`), so a real venue with more than 100 confirmed bookings cannot see every guest, and the "Check in" mutation does not surface failures (booking already used, partner does not own the event, booking in `CANCELLED_PENDING` status), leaving operators staring at a silent success state in some edge cases.

## What Changes

- Replace the hard-coded `100` cap on the partner guest list with a paginated response (`page`, `pageSize`, `totalCount`, `hasMore`) backed by a `<Pagination />` atom.
- Render an "Already used" `<Badge tone="dark">` on rows whose status is `USED` and disable the "Check in" button.
- Surface check-in failures in a `ShellStatusBanner` keyed by `bookingId` so each row carries its own banner without affecting the rest of the list.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `operations`: extend the **Partner Portal Live Operations UI** requirement so the partner guest list is paginated end-to-end (page + pageSize, `<Pagination />` control, query string contract) and already-used rows render an "Already used" badge with a disabled "Check in" button.
- `operations`: extend the **Partner Checks In Eligible Guest Row** requirement so check-in failures surface as a per-row `ShellStatusBanner` keyed by `bookingId`, and so already-used bookings cannot be re-checked-in from the UI.

## Impact

- **API data access:**
  - `packages/api/src/data-access/repositories.ts` — partner loader gains `partnerGuestsPage` / `partnerGuestsPageSize` parameters (default `pageSize = 20`), returns `{ guests, totalCount, page, pageSize, hasMore }`, and the `.limit(100)` cap is removed.
- **API routes:**
  - `packages/api/src/routes/data-access/index.ts` — accept `partnerGuestsPage` and `partnerGuestsPageSize` query params with the same defaults.
- **App UI:**
  - `packages/app/src/components/unveiled/PartnerPortal.tsx` — render a `<Pagination />` below the guest list, render "Already used" badge + disable the "Check in" button for `USED` rows, surface per-row `ShellStatusBanner` keyed by `bookingId` on check-in failure.
- **Typespec contract:** the partner guest list endpoint gains optional `partnerGuestsPage` / `partnerGuestsPageSize` query params; regenerated artifacts are checked in by `bun run specs:gen`.
- **Tests:** add `tests/features/partner/guest-pagination/` and `tests/features/partner/check-in-failure/` gherkin feature folders with co-located Ladle harnesses.
- **Docs:** `docs/operations.md` updated with the new pagination contract.