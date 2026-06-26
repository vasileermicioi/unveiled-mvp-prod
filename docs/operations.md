# Operations

Operational workflows for partner and admin surfaces: seed datasets,
operational smoke testing, and pagination coverage.

## Seed profiles

`scripts/seed-operations-smoke.ts` is the canonical owner of every
seeded dataset. It exposes three profiles, all driven by `--profile`
and optionally `--reset`.

| Profile       | Inserts                                                          | Reset | Use case                                    |
| ------------- | ---------------------------------------------------------------- | ----- | ------------------------------------------- |
| `smoke`       | 1 admin, 1 partner, 1 member, 1 event, 1 booking                 | no    | Default. Fast end-to-end smoke checks.      |
| `pagination`  | 50 members, 42 partners, 65 events, 40 bookings, 5 subscriptions | yes   | Pagination regression coverage.             |
| `full`        | same as `pagination`                                             | yes   | Combined reset + pagination.                |

The `smoke` profile is the default — invoking
`bun scripts/seed-operations-smoke.ts` with no flags preserves the
existing end-to-end smoke dataset.

### Why pagination exists

Admin operations tabs paginate at `pageSize = 20` and the public
discovery feed paginates at `pageSize = 6`. The smoke dataset (1
event, 1 partner, 1 member) does not exercise the Next/Previous
controls — every list has exactly one page. The `pagination` profile
seeds a deterministic multi-page dataset so every paginated surface
can be tested locally and in CI.

### Usage

```bash
# Default smoke profile (unchanged).
bun scripts/seed-operations-smoke.ts

# Pagination dataset for local pagination work.
bun run seed:pagination

# Combined reset + pagination (same as seed:pagination; preferred for CI).
bun scripts/seed-operations-smoke.ts --profile full

# Smoke + reset (idempotent smoke).
bun scripts/seed-operations-smoke.ts --reset

# Pagination without resetting (additive — only useful for re-running).
bun scripts/seed-operations-smoke.ts --profile pagination
```

### Sample output

```
Seeded pagination dataset (members=50, partners=42, events=65, bookings=40).
```

| Table                  | Count after `--profile pagination --reset` |
| ---------------------- | ------------------------------------------ |
| `user`                 | 50                                         |
| `user_profiles`        | 50 (3 ADMIN, 42 PARTNER, 5 USER)           |
| `partners`             | 42                                         |
| `events`               | 65                                         |
| `bookings`             | 40 (30 CONFIRMED, 10 CANCELLED)            |
| `subscriptions`        | 5 (spread across ACTIVE/PAUSED/INACTIVE/ACTION_REQUIRED) |
| `saved_events`         | 0                                          |
| `credit_ledger_entries`| 0                                          |

### Determinism

Pagination rows use predictable identifiers so gherkin scenarios can
target specific rows:

- Users: `pagination-admin-NNN`, `pagination-partner-NNN`,
  `pagination-user-NNN`
- Partners: `pagination-partner-NNN`
- Events: `pagination-event-NNN`
- Bookings: `pagination-booking-NNN`
- Subscriptions: `pagination-subscription-NNN`

Emails follow `smoke-{admin|partner|member}-NNN@unveiled.local`. The
default password for every pagination user is `Pagination-Smoke-2026!`
(passwords are bcrypt-hashed via `Bun.password.hash` with cost 4).

### Reset semantics

`--reset` (and the `full` profile) issue

```sql
TRUNCATE credit_ledger_entries, saved_events, subscriptions,
         bookings, events, partners, user_profiles, "user"
RESTART IDENTITY CASCADE
```

inside a single transaction before inserting. The `RESTART IDENTITY`
clause resets each table's sequence so re-runs produce identical row
counts. The `CASCADE` clause clears the foreign-key dependents
(`credit_ledger_entries` → `bookings`, `saved_events` →
`events`/`user`).

The pagination profile also wraps the inserts in a single transaction,
so a partial run leaves no junk rows.

### Smoke profile compatibility

The smoke profile is preserved verbatim. The seeded admin/partner
event now has `dateTime` set one year in the future so it sorts to
the top of `desc(events.dateTime)` and remains visible on page 1
even when the pagination dataset is also present.

## Pagination coverage in gherkin

`tests/features/operations/pagination/feature.feature` exercises the
admin members, partners, and events tabs at `pageSize = 20` against
the pagination dataset. The Background step points the Playwright step
registry at `bun run seed:pagination`; each scenario also carries
`@seed(profile=pagination,reset=true)` as a human-readable tag.

## Admin loading + error contract

Admin operations tabs (`events`, `partners`, `members`) MUST render a
deterministic loading skeleton on first paint and MUST surface API
errors as a `ShellStatusBanner` with a retry action. The contract is
served by two new design-system primitives:

- `<TableSkeletonPresentational />` lives in
  `packages/design-system/src/organisms/_shared/table-skeleton/`. It
  accepts `columns`, `rows`, an optional `density` (`"comfortable" |
  "compact"`), and an optional `aria-label`. Cells render the brand
  `ui-bf84c38c` shimmer class and the global CSS pins
  `prefers-reduced-motion: reduce` to `animation-duration: 0.001ms`,
  so the skeleton degrades to a static placeholder for motion-sensitive
  operators. The host advertises `role="status"`, `aria-busy="true"`,
  and `aria-live="polite"` so screen readers announce the load.
- `<ShellStatusBannerPresentational />` lives in
  `packages/design-system/src/organisms/_shared/shell-status-banner/`.
  It accepts a `type` (`"error" | "warning" | "info"`), a `title`, an
  optional `body`, and a list of `actions` with an `onSelect` callback
  plus a `variant` and `testId`. The error variant renders as
  `role="alert"` with `aria-live="assertive"`; the others render as
  `role="status"` with `aria-live="polite"`.

The admin context exposes the active tab's fetch state through a
`useAdminTabStatus(tab: "events" | "partners" | "members")` hook
(defined in `packages/app/src/components/unveiled/context.tsx`). The
hook returns `{ data, isPending, isError, refetch }` and computes
`isPending = isFetching && !data` so the skeleton stays visible while
the operator has no rows to look at. `AdminPanel.tsx` uses the hook for
all three tabs:

- When `isPending` is true, the tab body renders a
  `<TableSkeletonPresentational />` instead of the empty-state
  placeholder.
- When `isError` is true, the tab body renders a
  `<ShellStatusBannerPresentational type="error">` above the table
  with a "Retry" action wired to `refetch()`.
- When `isError && data` is true (the most recent fetch failed but
  cached data is still in the TanStack Query cache), the admin page
  header renders a `<Badge tone="yellow">Stale data</Badge>` next to
  the title so operators see the warning even when the banner is below
  the fold.

`tests/features/admin/loading-state/feature.feature` exercises the
first-paint skeleton and the retry path, and
`packages/design-system/src/organisms/_shared/table-skeleton/table-skeleton.test.tsx`
asserts the skeleton's `aria-busy="true"` host, grid template, cell
count, and clamping behaviour.
