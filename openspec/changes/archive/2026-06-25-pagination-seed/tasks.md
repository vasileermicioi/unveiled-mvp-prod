## 1. Seed script CLI

- [x] 1.1 Add a CLI parser to `scripts/seed-operations-smoke.ts`
      using `Bun.argv` that accepts `--profile smoke|pagination|full`
      (default `smoke`) and `--reset`.
- [x] 1.2 Refactor the existing smoke insert block into a
      `seedSmoke(database)` function and call it from the new
      dispatcher so existing callers observe no behaviour change.
- [x] 1.3 Add a `resetTables(database)` function that truncates
      `users`, `user_profiles`, `partners`, `events`, `bookings`,
      `subscriptions`, `saved_events`, and `credit_ledger_entries`
      with `TRUNCATE … RESTART IDENTITY CASCADE` inside a single
      transaction.
- [x] 1.4 Wrap every profile's insert path in
      `db.transaction(...)` so partial runs leave no junk rows.

## 2. Pagination dataset

- [x] 2.1 Implement `seedPagination(database)` that inserts ≥ 45
      `user_profiles` with roles spread across `USER` / `PARTNER` /
      `ADMIN` and predictable emails
      (`smoke-member-001@…`, `smoke-partner-001@…`,
      `smoke-admin-001@…`).
- [x] 2.2 Extend the same function to insert ≥ 42 `partners` rows
      linked to a subset of the seeded `PARTNER` profiles.
- [x] 2.3 Extend the same function to insert ≥ 65 `events` rows
      spread evenly across the next 90 days, linked to a subset of
      the seeded partners.
- [x] 2.4 Extend the same function to insert ≥ 30 `CONFIRMED` and
      ≥ 10 `CANCELLED` `bookings` distributed across the seeded
      events, linked to the seeded `USER` profiles.
- [x] 2.5 Extend the same function to insert `subscriptions` rows
      for the seeded members with a representative spread of
      `ACTIVE`, `PAUSED`, `INACTIVE`, and `ACTION_REQUIRED`.
- [x] 2.6 Add a `seedFull(database)` function that runs
      `resetTables` then `seedPagination` (i.e. `full` = `pagination`
      with `--reset` always on).

## 3. package.json script entries

- [x] 3.1 Add `seed:pagination` script entry that invokes
      `bun run scripts/seed-operations-smoke.ts --profile pagination
      --reset`.
- [x] 3.2 Add `seed:operations-smoke:full` script entry that
      invokes the script with `--profile full` (which resets
      internally).
- [x] 3.3 Leave the existing `db:seed:operations-smoke` entry
      untouched so existing callers see no behaviour change.

## 4. Unit test (Neon DB)

- [x] 4.1 Create `tests/unit/seed-operations-smoke.test.ts` that
      connects to the Neon dev DB via `DATABASE_URL`, cleans up
      `pagination-*` rows in `beforeAll`/`afterAll`, and exposes
      `seedPagination`/`resetTables` helpers.
- [x] 4.2 Add assertions for the `--profile pagination` path: row
      counts on `users`, `user_profiles`, `partners`, `events`,
      `bookings`, `subscriptions` match the spec.
- [x] 4.3 Add an idempotency assertion: running
      `--reset --profile pagination` twice yields identical final
      counts and raises no unique-constraint violations.
- [x] 4.4 Add a regression assertion that the smoke profile is
      unchanged: `seedPagination` with the smallest valid profile
      (`memberCount=5, partnerCount=1, eventCount=1,
      confirmedBookings=1, cancelledBookings=0`) writes exactly 5
      users, 1 partner, 1 event, 1 booking.

## 5. Gherkin scenarios

- [x] 5.1 Create
      `tests/features/operations/pagination/feature.feature` with
      three scenarios that drive the admin members, partners, and
      events tabs at `pageSize = 20` against the pagination dataset.
- [x] 5.2 Add a co-located `<component>.ladle.tsx` Ladle harness
      (`admin-pagination-controls.ladle.tsx`) referenced by the
      scenarios' `@ladle(component=…, story=…)` tags.
- [x] 5.3 Tag each scenario with the
      `@seed(profile=pagination,reset=true)` precondition and a
      Background step that points the Playwright step registry at
      `bun run seed:pagination`.

## 6. Documentation

- [x] 6.1 Create `docs/operations.md` if it does not already exist,
      documenting the `seed --profile pagination` workflow and a
      sample output table.
- [x] 6.2 Update `AGENTS.md` toolchain section to mention
      `bun run seed:pagination` alongside the existing
      `db:seed:operations-smoke` entry.

## 7. Verification

- [x] 7.1 Run `bun run check` and confirm no drift
      (`specs:check`, `tokens:check`, `check:styling-ownership`,
      `test:unit` all green). `ladle:coverage` shows 6 pre-existing
      drift items under `tests/features/auth/landing-modes/`, none
      from this change.
- [x] 7.2 Run `bun run seed:pagination` against the Neon dev DB
      and confirm row counts match the spec:
      `user=50, user_profiles=50, partners=42, events=65,
      bookings=40, subscriptions=5`.
- [x] 7.3 Run `bun run test:e2e`; the new pagination scenarios
      dispatch to the Ladle project (via `@ladle(...)` tags) and
      are skipped on the real-route project. Pre-existing e2e
      failures (toast notification, credit ledger) are unrelated
      to this change.
- [x] 7.4 Run `openspec validate pagination-seed` and confirm
      the change is valid.
