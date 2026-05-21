# Parity Suite

## Required environment

- `PARITY_TEST_DATABASE_URL`: dedicated Postgres database for parity seeding and integration tests.
- `BOOKING_TRANSACTION_TEST_DATABASE_URL` (Optional): database URL specifically for the transaction integration tests (falls back to `PARITY_TEST_DATABASE_URL` if not configured).
- `BETTER_AUTH_SECRET`
- `PUBLIC_APP_URL`
- `BETTER_AUTH_URL` or `PUBLIC_BETTER_AUTH_URL`

When `PARITY_TEST_DATABASE_URL` is set, the parity scripts copy it into `DATABASE_URL` so the app, Better Auth, and seeded tests all run against the same dedicated database.

> [!NOTE]
> Booking transaction integration tests require interactive transactions and row-level locks (`FOR UPDATE`). When running against Neon databases, a direct (unpooled) database URL must be used to prevent transaction hangs. The runner script and test suite automatically attempt to convert pooled connection hostnames (containing `-pooler`) to direct unpooled hostnames.

## Commands

- `bun run parity:seed`: seed the deterministic parity fixture world.
- `bun run test:parity:contracts`: run Bun contract and integration coverage for seeded parity behavior.
- `bun run test:parity:smoke`: run Playwright route smoke coverage against the seeded app.
- `bun run test:parity`: run both parity layers in sequence.
- `bun run test:transactions`: execute the booking transaction integration tests (verifying atomic booking, concurrency, waitlists, and admin adjustment ledger entries).

## Seeded fixture world

The parity seed creates:

- public, secret-code, voucher, sold-out, and check-in events
- active and frozen members
- partner and admin users
- confirmed and used bookings
- a sold-out waitlist entry
- saved-event, ledger, subscription, and freeze-override rows

The canonical fixture identifiers and demo-only denylist live in [parity-fixtures.ts](/root/dev/deepcode/unveiled-mvp-prod/src/lib/testing/parity-fixtures.ts).
