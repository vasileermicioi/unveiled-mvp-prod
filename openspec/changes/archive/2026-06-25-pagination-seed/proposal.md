## Why

The admin operations UI and the public discovery feed both paginate
their lists (`pageSize = 20` in admin, `pageSize = 6` on public
discover), but the only seed script (`scripts/seed-operations-smoke.ts`)
inserts a single admin, a single partner, a single member, a single
event, and a single booking. As a result the "next page" / "previous
page" controls and the page-size filter cannot be exercised locally or
in CI — every list has exactly one page. Pagination regressions can
therefore ship unnoticed.

## What Changes

- Extend `scripts/seed-operations-smoke.ts` with a `--profile
  <smoke|pagination|full>` flag and a `--reset` flag so the smoke
  dataset stays minimal (default unchanged) and the pagination dataset
  is opt-in and idempotent.
- Add a `seedPagination(database)` function that inserts a
  deterministic, reproducible dataset:
  - **Members** — 45 `user_profiles` rows spanning roles
    `USER` / `PARTNER` / `ADMIN` (≥ 3 pages at `pageSize = 20`).
  - **Partners** — 42 `partners` rows (≥ 3 pages at `pageSize = 20`).
  - **Events** — 65 `events` rows (≥ 4 pages at `pageSize = 20`,
    ≥ 11 pages at `pageSize = 6`).
  - **Bookings** — 30 `CONFIRMED` and 10 `CANCELLED` rows spread
    across the seeded events.
  - **Subscriptions** — a representative spread of `ACTIVE`,
    `PAUSED`, `INACTIVE`, `ACTION_REQUIRED`.
- Add a `resetTables(database)` function that truncates
  `users`, `user_profiles`, `partners`, `events`, `bookings`,
  `subscriptions`, `saved_events`, and `credit_ledger_entries`
  with `TRUNCATE … RESTART IDENTITY CASCADE` before inserting, so
  re-running the command produces identical counts.
- Add `package.json` script entries: `seed:operations-smoke:full`
  (`--profile full --reset`) and `seed:pagination`
  (`--profile pagination --reset`).
- Add a Bun unit test
  (`tests/unit/seed-operations-smoke.test.ts`) that boots a PGlite
  instance and asserts the seeded row counts.
- Add gherkin scenarios
  (`tests/features/operations/pagination/feature.feature`) that
  exercise the admin members, partners, and events tabs at
  `pageSize = 20` and assert that pages 2 and 3 contain seeded rows.
- Document the workflow in `docs/operations.md` (create if absent).

## Capabilities

### New Capabilities

- `pagination-seed-dataset`: deterministic, opt-in seed dataset that
  makes every paginated admin and discovery surface testable locally
  and in CI.

### Modified Capabilities

- `operations`: extend **Operational Flow Regression Coverage** so
  the seeded dataset MUST cover at least three pages of events,
  two pages of members, and two pages of partners when run with
  `--profile pagination`.
- `data-access`: extend the seed-dataset rule so
  `scripts/seed-operations-smoke.ts` is the canonical owner of the
  pagination dataset and exposes the `--profile` and `--reset`
  flags.

## Impact

- **Touched files:**
  - `scripts/seed-operations-smoke.ts` — add CLI parser,
    `seedPagination()`, `resetTables()`, and the new profiles.
  - `package.json` — add `seed:pagination` and
    `seed:operations-smoke:full` script entries.
  - `tests/unit/seed-operations-smoke.test.ts` (new) — Bun unit test
    asserting row counts against a PGlite instance.
  - `tests/features/operations/pagination/feature.feature` (new) —
    gherkin scenarios driving the seeded dataset through the admin UI.
  - `tests/features/operations/pagination/<component>.ladle.tsx`
    (new) — Ladle harness for the gherkin scenarios' `@ladle(...)`
    tags.
  - `docs/operations.md` (new or updated) — workflow documentation.
- **No breaking changes** — `--profile smoke` is the default; existing
  callers (`bun run db:seed:operations-smoke`) see no behaviour
  change.
- **No new dependencies** — uses Bun's built-in `Bun.argv` and
  `@electric-sql/pglite` (already a dev dependency for local
  database tests).
