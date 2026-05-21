## Why

The booking transaction integration tests are currently skipped unless `BOOKING_TRANSACTION_TEST_DATABASE_URL` is manually configured. Providing a clear, repeatable, and validated test environment—including fallback to `PARITY_TEST_DATABASE_URL` when appropriate—ensures core concurrency, waitlist, ledger, and capacity behaviors are reliably tested.

## What Changes

- Update `booking-transactions.integration.test.ts` to fallback to `PARITY_TEST_DATABASE_URL` when `BOOKING_TRANSACTION_TEST_DATABASE_URL` is not set, enabling integration tests to run by default in parity test environments.
- Add database configuration validation to the test runner so missing database URLs are reported as failures rather than silently skipped when running a transaction test command.
- Ensure integration tests clean their seeded rows reliably across repeated runs.
- Document local and CI environment setup for the transaction database, including Neon branch/database recommendations and row-locking/concurrency guidance.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `booking-transactions`: Define requirements for the transaction test-environment, repeated execution cleanup, and test execution outcomes.
- `operations`: Define regression coverage verification for transaction integrations and admin adjustments.
- `deployment`: Define environment configuration validation for test databases and command-line execution wrappers.

## Impact

- `src/lib/booking-transactions.integration.test.ts`: Updated to support fallback configurations, robust cleanup, and execution checks.
- `package.json`: A wrapper script or command to execute booking transaction integration tests and validate configuration.
- `docs/testing/parity-suite.md` and `docs/testing/playwright-testing.md`: Documentation updates for setting up and running transaction tests locally and in CI.
