## Context

The admin operations UI paginates events, partners, and members at
`pageSize = 20` and the public discovery feed paginates at
`pageSize = 6`. The seed script
(`scripts/seed-operations-smoke.ts`) is currently single-record: one
admin, one partner, one member, one event, one booking. Pagination
controls are therefore unreachable from the seeded environment, so
regressions ship unnoticed.

The seed script is the canonical entrypoint owned by the operations
team — extending it preserves a single source of truth and avoids a
parallel fixture system. PGlite is already a dev dependency and
backs `bun run db:migrate:local`, so unit tests can boot an
ephemeral database against the same Drizzle schema without
introducing a new dependency.

## Goals / Non-Goals

**Goals:**

- ≥ 3 pages of events (≥ 65 rows), ≥ 3 pages of members (≥ 45 rows),
  ≥ 3 pages of partners (≥ 42 rows) under `pageSize = 20`.
- The same events cover ≥ 11 pages of public discovery under
  `pageSize = 6`.
- Opt-in via `--profile pagination`, default remains `smoke`.
- Idempotent across runs via `--reset`.
- Deterministic identifiers so gherkin scenarios can target specific
  rows.
- Existing `bun run db:seed:operations-smoke` callers see no
  behaviour change.

**Non-Goals:**

- Removing the existing single-record smoke profile.
- Generating realistic German/English copy for each seeded event.
- Time-of-day-aware seeding (events spread evenly across the next
  90 days, no random offsets).
- Touching the Drizzle schema or migration history — this is a
  data-only change.

## Decisions

- **Single seed script, profile flag.** Keep
  `scripts/seed-operations-smoke.ts` as the canonical owner; add
  `--profile smoke|pagination|full` instead of creating a second
  script. Avoids two scripts drifting out of sync and keeps the
  package.json surface small.
- **`TRUNCATE … RESTART IDENTITY CASCADE` for `--reset`.** Re-starts
  primary keys from 1 and clears dependent rows in
  `credit_ledger_entries` via `CASCADE`. `DELETE FROM` would leave
  gaps in the PK sequence and require manual cascade handling.
- **Default profile stays `smoke`.** Existing callers
  (`bun run db:seed:operations-smoke`) pass no flags and observe no
  change. The new behaviours are strictly opt-in.
- **Deterministic emails and IDs.** Predictable emails
  (`smoke-member-001@…`, `smoke-partner-001@…`) and stable UUIDs
  derived from the row index let gherkin scenarios pin to specific
  rows without snapshotting the entire dataset.
- **Single transaction per profile.** Wrapping the inserts in a
  single `db.transaction(...)` so a partial run never leaves the
  database in a half-seeded state.
- **PGlite for the unit test.** Reuses the existing
  `@electric-sql/pglite` dev dependency and the
  `bun:test`-driven `tests/unit/` harness; no new test framework.
- **`Bun.argv` parsing, no new CLI dependency.** Two flags
  (`--profile`, `--reset`) plus a positional `profile` shorthand
  fall out of a 20-line parser. Avoids `commander`/`yargs` for what
  is a two-flag CLI.
- **Script entries in `package.json`.** `seed:pagination` calls the
  script with `--profile pagination --reset`; the existing
  `db:seed:operations-smoke` script entry stays untouched.

## Risks / Trade-offs

- **Slow seeding for the pagination profile.** 45 users with hashed
  passwords + 65 events + 30+10 bookings adds ~2–3 s. Acceptable
  for an opt-in profile; mitigated by keeping the smoke profile
  single-record.
- **Foreign-key cascade ordering.** Truncating `bookings` cascades
  to `credit_ledger_entries`; both must appear in the `TRUNCATE`
  list (using `CASCADE` covers it but listing both keeps the
  dependency explicit).
- **PGlite schema drift.** If the Drizzle schema changes between
  migrations, the unit test must re-run migrations before inserting
  the pagination dataset. The existing `db:migrate:local` script
  already does this for the dev database — the unit test mirrors
  the same pattern.
- **Stale `subscriptions.status` enum.** The spec calls for
  `ACTION_REQUIRED`. If the enum changes before this lands, the
  unit test will fail loudly, which is the desired signal.

## Migration Plan

- The change is additive: it extends an existing script and adds
  two new `package.json` entries. There is no production migration.
- Rollback is the absence of the new flags — existing callers
  continue to hit the smoke profile.
- Documentation lands in `docs/operations.md` (created if absent)
  so contributors discover the new profile when reading the
  operations docs.

## Open Questions

- Should `seed:operations-smoke:full` also seed the
  `discover-filters-pagination` capability surfaces (saved searches,
  filter presets), or is that deferred to a follow-up change?
