## Why

The migrated app now covers enough public, member, partner, and admin behavior that parity with `_old_app` needs repeatable automated verification instead of one-off manual checks. Existing unit and data-layer tests cover important internals, but they do not prove that route ownership, visible fields, live seeded data, invalidation, and critical user flows still match the legacy-visible contract.

## What Changes

- Add a parity-oriented regression suite that covers legacy-visible route surfaces across public, member, partner, admin, and venue check-in entry points.
- Add seeded regression fixtures for guest/public events, active and inactive members, partner and admin users, confirmed and used bookings, sold-out and waitlist cases, and redemption-code variants.
- Add smoke coverage that asserts visible landmarks, redirects, and safe authorization outcomes for protected routes.
- Add data-wiring coverage that proves production routes render seeded query/database data and do not leak demo-only fixture rows.
- Add critical flow coverage for booking, waitlist, save/unsave, profile/preferences, partner check-in, and admin event/partner/member mutations, including invalidation expectations.
- Add a generated or maintained parity checklist/matrix that maps OpenSpec-visible requirements to regression coverage.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `pages`: Require automated smoke coverage for all legacy-visible route surfaces, visible landmarks, and redirect behavior.
- `display-data`: Require regression checks that seeded production display data renders expected visible fields and excludes demo-only fixtures on product routes.
- `data-access`: Require regression coverage that protected route loaders and related queries return only authorized seeded data for the active role and refresh affected rows after mutations.
- `forms-actions`: Require regression coverage for typed action flows, safe failures, and invalidation behavior across booking-adjacent, profile, partner, and admin actions.
- `auth`: Require regression coverage for protected route redirects and authorization boundaries before protected route data or actions execute.
- `operations`: Require regression coverage for partner/admin visible flows, live row refresh, and safe authorization outcomes.
- `booking-transactions`: Require regression coverage for booking, waitlist, credit/ledger, capacity, and redemption outcomes as they surface through user-visible flows.

## Impact

- Test harness selection and shared regression utilities under the app test directories.
- Seed and fixture helpers for parity roles, events, bookings, waitlist, and redemption modes.
- Route smoke, authorization, and DOM-visible regression tests for public, member, partner, admin, and venue check-in pages.
- Action and query-layer regression tests tied to booking, profile, partner, and admin flows.
- OpenSpec deltas under `openspec/changes/add-legacy-parity-regression-suite/specs/` for the affected capabilities.
