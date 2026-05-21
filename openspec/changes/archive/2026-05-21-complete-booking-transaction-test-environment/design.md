## Context

The booking transaction integration tests verify critical atomic transactions, Waitlists, Admin adjustments, and concurrency/row-locking behaviors. Currently, these tests are skipped by default because they require a separate environment variable, `BOOKING_TRANSACTION_TEST_DATABASE_URL`, which is undocumented and unconfigured in local environments. This proposal outlines how we will unify database configurations, implement validation scripts, and update documentation.

## Goals / Non-Goals

**Goals:**
- Enable booking transaction integration tests to reuse `PARITY_TEST_DATABASE_URL` as a safe fallback when `BOOKING_TRANSACTION_TEST_DATABASE_URL` is not defined.
- Provide a dedicated wrapper command/script to execute booking transaction tests, which asserts configuration presence and reports descriptive setup errors if missing.
- Ensure that integration tests reliably clean up their own seeded rows across repeated runs without colliding with the static parity fixture world.
- Update documentation explaining how to set up, configure, and execute transaction tests.

**Non-Goals:**
- Running transaction integration tests against production databases.
- Replacing row-locking Postgres assertions with PGlite mocks.

## Decisions

### 1. Database Reuse & Isolation Strategy
- **Decision**: Allow booking transaction integration tests to fallback to `PARITY_TEST_DATABASE_URL` if `BOOKING_TRANSACTION_TEST_DATABASE_URL` is not set.
- **Rationale**: The integration tests use random UUIDs (`crypto.randomUUID()`) for all user, partner, event, and booking IDs, and target only these IDs in cleanup functions. Therefore, they do not collide with static parity fixtures seeded in `PARITY_TEST_DATABASE_URL` and can safely share the database.
- **Alternatives Considered**: Requiring a separate database for transaction tests. While cleaner in theory, in practice it increases developer setup overhead (needing two test databases) and causes CI setup friction.

### 2. Validation Wrapper Script
- **Decision**: Create a dedicated launcher script `scripts/run-booking-transaction-tests.ts` and add a script target `test:transactions` in `package.json`.
- **Rationale**: Having a dedicated command makes it easy for developers to run only transaction tests. The wrapper script ensures that the environment is validated first, failing fast with a clear error message instead of silently skipping.

### 3. Cleanup Reliability
- **Decision**: Wrap the test execution in `try / finally` inside the tests to ensure the `cleanup()` function is executed even if assertions fail.
- **Rationale**: Standard integration tests must leave the database in a clean state so that subsequent runs do not leak state or cause unique-constraint/foreign-key violations.

## Risks / Trade-offs

- **Risk**: Concurrency/Database lock exhaustion if parity smoke tests and transaction integration tests run simultaneously on the same database.
  - **Mitigation**: Parity smoke tests run in Playwright serially (`workers: 1`). The `bun test` suite for contracts runs in a separate process/command, avoiding simultaneous operations during normal workflow runs.
- **Risk**: Leftover rows if a test process is forcefully killed (e.g. SIGKILL).
  - **Mitigation**: The runner script can recommend standard database cleanup or re-seeding commands (`bun run parity:seed` runs `resetParityWorld` which deletes all matching test records).
