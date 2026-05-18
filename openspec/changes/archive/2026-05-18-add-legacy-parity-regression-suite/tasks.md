## 1. Parity Harness Foundation

- [x] 1.1 Add the regression test dependencies, scripts, and runner configuration needed for a layered `bun:test` plus Playwright parity suite.
- [x] 1.2 Create shared parity test-support utilities for database reset, seeded fixture loading, role-scoped viewer helpers, and demo-fixture denylist assertions.
- [x] 1.3 Add a permanent parity matrix artifact that maps OpenSpec-visible route and flow requirements to planned or implemented regression tests.

## 2. Seeded Regression Fixtures

- [x] 2.1 Implement shared seeded fixtures for guest/public events, active member, frozen or unpaid member, partner user, admin user, confirmed booking, used booking, sold-out event, waitlist entry, voucher event, and secret-code event scenarios.
- [x] 2.2 Expose seed helpers so route smoke, action tests, and booking or operations integration tests can reuse the same named fixture world.
- [x] 2.3 Document and validate the dedicated Postgres test database configuration required for parity seeding and concurrency-sensitive assertions.

## 3. Contract And Authorization Regression Tests

- [x] 3.1 Extend `bun:test` coverage for route authorization and protected route ownership assertions across guest, member, partner, admin, and venue check-in access paths.
- [x] 3.2 Add regression tests that prove member, partner, admin, and venue loaders return only authorized seeded data and never depend on demo-only fixture rows.
- [x] 3.3 Add regression tests for precise invalidation hints and query-key refresh scope after covered booking, profile, partner, and admin mutations.

## 4. Critical Flow Regression Tests

- [x] 4.1 Add booking and waitlist regression tests that verify capacity, credits, ledger entries, redemption outcomes, and visible member-surface refresh expectations.
- [x] 4.2 Add regression tests for save or unsave and profile or preferences actions, including safe unauthorized outcomes and member-surface invalidation behavior.
- [x] 4.3 Add regression tests for partner check-in and admin event, partner, and member mutations, including safe failures and affected operational data refresh expectations.

## 5. Route Smoke And DOM Parity

- [x] 5.1 Add Playwright smoke coverage for public routes and member routes that asserts redirects, core visible landmarks, and seeded data fields on landing, discover, membership, app, saved, bookings, and profile surfaces.
- [x] 5.2 Add Playwright smoke coverage for partner, admin, and venue check-in surfaces that asserts role ownership, visible operational rows, and post-mutation used or refreshed state.
- [x] 5.3 Add smoke assertions that known demo-only labels do not appear on production product routes unless intentionally seeded by the parity fixture set.

## 6. Verification And CI

- [x] 6.1 Wire the parity suite into repository verification scripts so maintainers can run the contract, smoke, and seeded regression layers consistently.
- [x] 6.2 Add CI or documented automation steps for preparing the test database, seeding parity fixtures, and running the new parity suites in dependency order.
- [x] 6.3 Run the relevant checks locally and record any remaining environment assumptions or follow-up gaps in the parity matrix or test documentation.
