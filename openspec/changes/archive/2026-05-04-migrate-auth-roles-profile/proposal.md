## Why

The target app has Better Auth configured and a relational domain schema, but it does not yet hydrate a user domain profile, resolve roles, or protect server-side operations. The old app used Firebase Auth plus Firestore user documents for signup, login, profile state, routing decisions, and role checks; this change recreates those behaviors with Better Auth, Drizzle, and Astro-native server boundaries.

## What Changes

- Add Better Auth email/password flows for signup, login, logout, and password reset or the nearest supported recovery flow.
- Create a linked domain profile row when a visitor signs up.
- Hydrate server-side session and viewer context for Astro pages and React islands.
- Resolve user roles from domain profile rows: `USER`, `ADMIN`, and `PARTNER`.
- Add authorization helpers for signed-in, admin, partner-owned, member, and owner-or-admin access.
- Map hydrated auth/profile state into the migrated app shell view models.
- Keep OAuth, booking/payment operations, partner provisioning, full onboarding, and live Firebase user migration out of scope.

## Capabilities

### New Capabilities

- `auth`: Better Auth session, email/password account flows, linked domain profile creation, role resolution, and server-side authorization helpers.

### Modified Capabilities

- `app-shell`: Shell navigation and counts are hydrated from the authenticated session and domain profile rather than demo state.
- `pages`: Auth-sensitive pages redirect or render using server-resolved viewer/session state.
- `display-data`: Shell and page display data include authenticated viewer context, role, language, credits, saved count, profile visibility, and auth action state.

## Impact

- Affected code: `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/pages/api/auth/[...all].ts`, new auth/profile helper modules, app-shell adapter code, and future page loaders/actions.
- Affected data: Better Auth user/session/account tables and `user_profiles` from `domain-data`.
- Affected routes/API: auth API route remains the Better Auth handler; app/page code gains server-side session/profile resolution.
- Affected UX: signup creates the default member profile; signed-in users see role-aware shell state; protected routes/actions get consistent authorization failures.
