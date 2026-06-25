## ADDED Requirements

### Requirement: Seed Datasets Are Script-Owned And Profile-Switched

The seed datasets SHALL be owned by
`scripts/seed-operations-smoke.ts`, SHALL expose a `--profile` flag
that selects between `smoke`, `pagination`, and `full` profiles, and
SHALL expose a `--reset` flag that truncates the seven seed-owned
tables before inserting rows.

#### Scenario: Smoke profile is the default

- **WHEN** the seed script is invoked with no `--profile` flag
- **THEN** it produces the existing smoke dataset (1 admin, 1
  partner, 1 member, 1 event, 1 booking)
- **AND** existing callers of `bun run db:seed:operations-smoke`
  observe no behaviour change

#### Scenario: Pagination profile is opt-in

- **WHEN** the seed script is invoked with `--profile pagination`
- **THEN** it produces the deterministic pagination dataset defined
  in the `pagination-seed-dataset` capability
- **AND** it does not affect smoke-profile callers unless the
  `--profile` flag is explicitly passed

#### Scenario: Full profile resets and seeds every surface

- **WHEN** the seed script is invoked with `--profile full --reset`
- **THEN** it truncates the seven seed-owned tables and inserts the
  pagination dataset
- **AND** it is exposed via the `bun run seed:operations-smoke:full`
  script entry in `package.json`

#### Scenario: Pagination profile is exposed via its own script entry

- **WHEN** a contributor runs `bun run seed:pagination`
- **THEN** the script invokes `scripts/seed-operations-smoke.ts` with
  `--profile pagination --reset`
- **AND** the resulting dataset matches the row counts asserted by
  the `pagination-seed-dataset` capability
