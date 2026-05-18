## Context

The current repository already has `bun:test` coverage for route ownership helpers, data-access contracts, booking transactions, and some admin operation helpers, but it does not exercise the full app surface the way a migrated user sees it. The missing layer is parity-oriented verification across route rendering, redirects, seeded display data, demo-fixture absence, and end-to-end invalidation after critical actions.

This change is cross-cutting because it spans route pages, auth gates, data loaders, action handlers, seeded fixtures, and booking/admin transactional behavior. It also needs a stable way to express "legacy-visible parity" so future migrations can extend the suite without reconstructing the checklist from `_old_app` each time.

## Goals / Non-Goals

**Goals:**

- Add an automated regression layer that proves legacy-visible route parity for public, member, partner, admin, and venue check-in surfaces.
- Reuse the current `bun:test` investment for data/action contracts while adding a browser-capable smoke layer for redirects and rendered DOM landmarks.
- Seed deterministic role, event, booking, waitlist, and redemption fixtures that drive both page smoke tests and action/data assertions.
- Keep parity expectations explicit through a permanent matrix artifact that maps OpenSpec-visible requirements to tests.
- Preserve implementation flexibility by testing user-visible contracts instead of internal component structure.

**Non-Goals:**

- Pixel-perfect screenshot regression.
- Mocking or validating Stripe, Resend, Better Auth internals, or production service providers.
- Replacing existing unit/integration tests that already cover isolated business logic.
- Using `_old_app` code as a runtime dependency.

## Decisions

1. Use a layered suite: `bun:test` for contract/integration checks plus Playwright for route and DOM smoke coverage.

   `bun:test` is already the repository standard for server-side and transactional tests, so parity assertions that target loaders, invalidation hints, action envelopes, and booking/admin data effects should stay there. Browser-visible route parity, redirect chains, and DOM landmarks need a real navigation/render layer, so a small Playwright suite should cover those surfaces against the built Astro app.

   Alternatives considered:
   - Astro test utilities only: insufficient for broad redirect plus user-visible DOM flow coverage without rebuilding additional browser helpers.
   - Vitest plus jsdom: acceptable for component-level tests, but weaker than Playwright for server-rendered route parity and adds a second general-purpose unit runner beside `bun:test`.
   - Playwright only: too heavy for transaction and action-layer assertions that are already well-served by the current test style.

2. Back the parity suite with seeded dedicated Postgres data rather than PGlite.

   The repo already uses Postgres-backed booking integration tests and has known concurrency-sensitive behavior around booking capacity, idempotency, credits, and ledger writes. The parity suite should use the same database family so seeded route smoke and action/invalidation coverage observe the same SQL semantics, ownership filters, and locking behavior as production paths.

   Alternatives considered:
   - PGlite for all parity tests: simpler startup, but it is not a safe authority for row-locking, concurrent booking, or production-like SQL behavior.
   - Split databases by layer: increases fixture drift risk because route smoke and transaction assertions stop sharing the same seeded world.

3. Add a shared regression seed module with scenario-named fixtures.

   The suite should expose a single seeding entry point that creates named roles and entities such as `guestPublicEvent`, `activeMember`, `frozenMember`, `partnerViewer`, `adminViewer`, `confirmedBooking`, `usedBooking`, `soldOutEvent`, `waitlistEntry`, `voucherEvent`, and `secretCodeEvent`. The same fixture vocabulary should be consumed by page smoke, action tests, and transaction assertions to keep parity expectations aligned.

   Alternatives considered:
   - Per-test ad hoc inserts: faster to start, but duplicates setup logic and causes coverage drift.
   - Reusing only the existing smoke seed script: too narrow for route parity, waitlist, and redemption-mode coverage.

4. Store the parity checklist as a permanent repository artifact, not a transient `.tmp` file.

   The matrix should live under a durable docs or test-support path, referenced by the new regression tests and updated when route/spec parity changes. That makes the checklist reviewable alongside code and keeps it available after the OpenSpec change archives.

   Alternatives considered:
   - Keep the matrix in `.tmp`: too easy to lose and not review-friendly.
   - Encode the checklist only in test names: discoverable to maintainers, but poor for gap analysis against OpenSpec requirements.

5. Assert demo-fixture absence explicitly on production routes.

   Some migrated surfaces previously relied on demo rows and local workbench state. The parity suite should maintain a denylist of known demo-only labels and prove that seeded production routes do not render them unless intentionally seeded in the database. This turns a migration risk into a concrete regression contract.

   Alternatives considered:
   - Implicitly rely on seeded rows being present: catches missing data, but not accidental fixture leakage.

## Risks / Trade-offs

- [New Playwright dependency and runtime cost] → Keep Playwright focused on route smoke, redirects, and visible landmarks; leave data-heavy assertions in `bun:test`.
- [Seed complexity grows across multiple roles and flows] → Centralize fixture builders and use scenario-named seeds shared across all parity tests.
- [Flaky state when page smoke and action tests share mutable data] → Reset the test schema between suites and isolate mutation-heavy tests with per-suite fixture setup.
- [Parity matrix drifts from tests] → Require each matrix row to reference the owning test file or test identifier and update it in the same task slice as new coverage.
- [Dedicated Postgres setup increases local/CI requirements] → Reuse the existing Postgres-backed integration-test environment pattern and document the required test database URL explicitly.

## Migration Plan

1. Introduce a parity test support layer: seed helpers, fixture naming, demo-row denylist, and matrix artifact.
2. Add `bun:test` coverage for authorization boundaries, invalidation scopes, booking/waitlist/profile/admin action results, and seeded data-access expectations.
3. Add Playwright route smoke coverage for public, member, partner, admin, and venue check-in surfaces using the seeded dataset.
4. Wire the suite into repository scripts and CI so it runs with the dedicated test database configuration.
5. Roll back by removing the new parity scripts and artifacts if the suite proves unstable; no production schema or runtime contract changes are required.

## Open Questions

- Whether the permanent parity matrix should live under `docs/testing/` or under a test-support directory adjacent to the new suites.
- Whether route smoke should run against `astro dev` or `astro preview` in CI once the Playwright harness is wired.
