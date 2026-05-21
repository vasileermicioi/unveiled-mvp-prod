## ADDED Requirements

### Requirement: Booking Transaction Verification Environment
The app SHALL provide a documented and repeatable environment for booking transaction integration tests.

#### Scenario: Transaction test database is configured
- **WHEN** `BOOKING_TRANSACTION_TEST_DATABASE_URL` is set to a migrated dedicated Postgres database
- **THEN** booking transaction integration tests run instead of skipping and verify booking, waitlist, admin ticket, credit ledger, and concurrency outcomes.

#### Scenario: Transaction test database is missing
- **WHEN** the transaction test command runs without a configured database
- **THEN** the command reports the missing configuration clearly rather than silently implying full coverage.

#### Scenario: Transaction tests are rerun
- **WHEN** the transaction integration tests are executed repeatedly
- **THEN** seeded rows are cleaned safely without foreign-key conflicts or cross-test data leakage.
