## 1. Environment Setup & Configuration

- [x] 1.1 Update `src/lib/booking-transactions.integration.test.ts` to fallback to `PARITY_TEST_DATABASE_URL` when `BOOKING_TRANSACTION_TEST_DATABASE_URL` is missing.
- [x] 1.2 Implement the verification and runner script at `scripts/run-booking-transaction-tests.ts` to load environment variables, validate database URL availability, and execute the tests.
- [x] 1.3 Register the `test:transactions` script target in `package.json` pointing to the new runner script.

## 2. Test Robustness & Execution

- [x] 2.1 Refactor `src/lib/booking-transactions.integration.test.ts` tests with robust `try / finally` cleanups to prevent row leaks on assertion failures.
- [x] 2.2 Run and verify that `bun run test:transactions` detects missing database configuration when executed without any database variables, and exits with a non-zero code.
- [x] 2.3 Run and verify that `bun run test:transactions` passes successfully when a valid database is configured.

## 3. Documentation

- [x] 3.1 Update `docs/testing/parity-suite.md` and `docs/testing/playwright-testing.md` to document the transaction test setup, configuration commands, and execution instructions.
- [x] 3.2 Run the full contract regression suite using `bun run test:parity:contracts` and verify it runs booking transactions tests automatically without skips.
