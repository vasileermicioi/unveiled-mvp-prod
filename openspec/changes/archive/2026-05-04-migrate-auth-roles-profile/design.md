## Context

The old app used Firebase Auth for email/password identity and a Firestore `users/{uid}` document for product identity: role, partner linkage, credits, selected language, profile, preferences, subscription state, and behavior counters. Route transitions and shell state were driven by the client-side store after Firebase auth hydration.

The target app uses Astro SSR with React islands, Better Auth with a Drizzle adapter, and a relational `domain-data` schema that includes `user_profiles`, `partners`, `saved_events`, and role/subscription state. Current auth code exposes the Better Auth handler and client, but the app does not yet create profile rows, hydrate viewer context on the server, or provide authorization helpers for actions/routes.

This change should add the auth/profile integration layer while keeping business workflows out of scope. Booking, payment, partner provisioning, and full onboarding actions should consume these helpers later rather than being implemented here.

## Goals / Non-Goals

**Goals:**

- Keep Better Auth as the identity/session system and `user_profiles` as the product profile/role system.
- Create a default `USER` domain profile during email/password signup.
- Provide server-side helpers to resolve the current session, Better Auth user, domain profile, role, and partner ownership.
- Provide authorization helpers for signed-in, member, admin, partner-owned, and owner-or-admin access.
- Map server-resolved viewer state into the migrated shell view model shape.
- Provide minimal auth page/action integration enough to exercise signup, login, logout, and password recovery where supported by Better Auth.

**Non-Goals:**

- No OAuth/social login.
- No live Firebase user migration.
- No booking, payment, partner portal provisioning, check-in, or admin workflow implementation.
- No full onboarding wizard or preference-management workflow beyond default profile creation and basic account/profile update support needed by auth.
- No redesign of the migrated UI system or app shell.

## Decisions

1. **Create profile rows outside Better Auth adapter tables.**

   Better Auth owns `user`, `session`, `account`, and `verification`. Product data should stay in `user_profiles`, linked by `user_profiles.user_id = user.id`. Signup should create both identity and profile in one server-controlled flow when possible, and profile creation should be idempotent if Better Auth creates identity first.

   Alternative considered: store role/credits/language on the Better Auth `user` table. Rejected because it couples product schema to Better Auth adapter internals and conflicts with the domain-data design.

2. **Hydrate viewer context on the server.**

   Astro pages and server actions should resolve the current Better Auth session from request headers/cookies, then load the related `user_profiles` row and derived counts. React islands can receive initial viewer/shell data from server-rendered props or use a small client auth state only for interactive auth forms.

   Alternative considered: rely on client-side auth state to decide shell and page access. Rejected because SSR pages and server actions need authoritative access checks before rendering or mutating data.

3. **Use explicit authorization helper functions.**

   Implement helpers such as `getViewer`, `requireUser`, `requireAdmin`, `requireMember`, `requirePartnerForResource`, and `requireOwnerOrAdmin`. Helpers should throw or return typed failures that page loaders/actions can translate into redirects, 401/403 responses, or form errors.

   Alternative considered: inline role checks in every route/action. Rejected because later booking, partner, admin, and payment changes would duplicate security-sensitive logic.

4. **Treat language as profile state with a future cookie bridge.**

   The domain profile should be the durable selected language. This change can expose language from profile and allow later page/action work to update it. A cookie may later provide guest language preference, but signed-in profile state should win after login.

   Alternative considered: store language only in local React state. Rejected because app shell and SSR pages need consistent localized display data.

5. **Defer partner portal user creation mechanics.**

   Partner users require admin-initiated provisioning or invitation flows. This change should support `PARTNER` role resolution and partner ownership checks, but not implement partner account creation. A later operations change can decide between temporary password, invite link, or reset-link based provisioning.

   Alternative considered: implement partner provisioning here. Rejected because it crosses into admin partner operations, which is a separate proposed change.

6. **Use Better Auth-supported recovery flow rather than inventing password reset.**

   Password reset/recovery should use Better Auth's supported plugin/configuration if available in the installed version. If the exact recovery flow requires email provider integration beyond this change, implement the server/client contract and document any provider stub as a follow-up.

   Alternative considered: custom token/password reset table. Rejected unless Better Auth lacks a supported path, because custom auth token handling is security-sensitive.

## Risks / Trade-offs

- **Risk: signup identity succeeds but profile creation fails** -> Mitigation: make profile creation idempotent and add a session hydration repair path that creates a default profile for missing standard users where safe.
- **Risk: authorization helpers leak implementation details to UI** -> Mitigation: return typed auth failures and map them to redirects or generic user-facing messages at page/action boundaries.
- **Risk: Better Auth password recovery needs email/provider configuration not yet implemented** -> Mitigation: keep the recovery contract in scope, but isolate provider-specific sending behind a helper and document any required follow-up.
- **Risk: shell counts require extra database reads** -> Mitigation: derive credits from `user_profiles` and saved count from indexed `saved_events`; batch reads in the viewer hydration helper.
- **Risk: partner ownership checks are incomplete before partner provisioning exists** -> Mitigation: enforce role plus `partner_id` matching where partner-owned resources are checked; leave account creation to operations work.

## Migration Plan

1. Add auth/profile service modules for session lookup, profile creation, viewer hydration, and role helpers.
2. Extend Better Auth signup or create target-app signup action so default domain profiles are inserted after account creation.
3. Add auth form/action or page glue for signup, login, logout, and password recovery.
4. Add app-shell adapter that maps viewer context to `AppShellViewModel`.
5. Add minimal protected-route/action examples or tests for member/admin/partner/owner helper behavior.
6. Run project checks and verify signup creates a Better Auth user plus `user_profiles` row.

Rollback is code-level for this change: remove the auth/profile helper modules and revert auth page/action wiring. The domain schema remains valid because it was introduced by `migrate-domain-data-model`.

## Open Questions

- Which Better Auth API/plugin path should be used for password recovery in the installed version?
- Should initial signup immediately create a session, or should the user log in after signup depending on Better Auth behavior?
- Should guest language preference be stored in a cookie before the profile language update flow exists?
