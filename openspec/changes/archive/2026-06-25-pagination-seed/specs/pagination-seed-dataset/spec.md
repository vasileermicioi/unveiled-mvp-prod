## ADDED Requirements

### Requirement: Pagination Profile Produces Multi-Page Dataset

The `scripts/seed-operations-smoke.ts` script SHALL provide a
deterministic `pagination` profile that produces at least three pages
of admin events, at least three pages of admin members, and at least
three pages of admin partners under the admin operations UI's
`pageSize = 20`.

#### Scenario: Pagination profile seeds at least 65 events

- **WHEN** the seed script runs with `--profile pagination`
- **THEN** at least 65 `events` rows are inserted into the local
  database
- **AND** those events are spread evenly across at least 4 pages at
  `pageSize = 20`
- **AND** the same events span at least 11 pages at `pageSize = 6`
  for the public discovery feed

#### Scenario: Pagination profile seeds at least 45 user profiles

- **WHEN** the seed script runs with `--profile pagination`
- **THEN** at least 45 `user_profiles` rows are inserted
- **AND** those rows include a spread of roles across `USER`,
  `PARTNER`, and `ADMIN`
- **AND** the rows span at least 3 pages at `pageSize = 20`

#### Scenario: Pagination profile seeds at least 42 partners

- **WHEN** the seed script runs with `--profile pagination`
- **THEN** at least 42 `partners` rows are inserted
- **AND** those partners span at least 3 pages at `pageSize = 20`

#### Scenario: Pagination profile seeds representative bookings

- **WHEN** the seed script runs with `--profile pagination`
- **THEN** at least 30 `bookings` rows with status `CONFIRMED` are
  inserted
- **AND** at least 10 `bookings` rows with status `CANCELLED` are
  inserted
- **AND** the bookings are distributed across the seeded events

#### Scenario: Pagination profile seeds subscription variety

- **WHEN** the seed script runs with `--profile pagination`
- **THEN** seeded members include rows with `subscriptions.status` of
  `ACTIVE`, `PAUSED`, `INACTIVE`, and `ACTION_REQUIRED`

#### Scenario: Pagination profile uses deterministic identifiers

- **WHEN** the seed script runs with `--profile pagination`
- **THEN** seeded users use predictable email addresses
  (e.g. `smoke-member-001@…`, `smoke-partner-001@…`)
- **AND** re-running the seed against a freshly reset database
  produces identical row counts and identifiers

### Requirement: Reset Flag Truncates Seeded Tables

The seed script SHALL expose a `--reset` flag that truncates the
seven tables owned by the seed dataset with `TRUNCATE … RESTART
IDENTITY CASCADE` before inserting rows.

#### Scenario: `--reset` truncates seed-owned tables

- **WHEN** the seed script runs with `--reset` followed by
  `--profile pagination`
- **THEN** the tables `users`, `user_profiles`, `partners`, `events`,
  `bookings`, `subscriptions`, `saved_events`, and
  `credit_ledger_entries` are truncated
- **AND** the truncating statement uses `RESTART IDENTITY` so that
  primary keys restart from 1
- **AND** the truncating statement uses `CASCADE` so dependent
  foreign keys (`credit_ledger_entries` → `bookings`) are cleared

#### Scenario: Re-running `--reset` is idempotent

- **WHEN** the seed script runs twice with `--reset --profile
  pagination`
- **THEN** the second run reports the same final row counts as the
  first run
- **AND** the second run does not raise unique-constraint violations
