## 1. Existing Auth And Domain Context

- [x] 1.1 Review current Better Auth server/client setup, auth API route, Drizzle schema, and app-shell view model inputs.
- [x] 1.2 Review old Firebase auth/profile references for signup, login, logout, password reset, role checks, onboarding state, and shell routing behavior.
- [x] 1.3 Confirm implementation boundaries: no Firebase runtime imports, no `_old_app` imports, no partner provisioning, no booking/payment business workflows.

## 2. Domain Profile And Viewer Services

- [x] 2.1 Add typed default profile creation helpers for new Better Auth users with role `USER`, default credits, default language, default subscription state, empty preferences, and onboarding incomplete.
- [x] 2.2 Make profile creation idempotent so an existing `user_profiles` row is preserved and duplicate rows are not created.
- [x] 2.3 Add server-side viewer hydration that resolves guest, member, partner, and admin contexts from Better Auth session data plus `user_profiles`.
- [x] 2.4 Include derived viewer fields needed by display data: selected language, credits, subscription state, onboarding state, saved count, linked partner ID, and profile visibility.
- [x] 2.5 Add typed auth/profile failure results for unauthenticated, forbidden, and missing-profile states.

## 3. Better Auth Account Flows

- [x] 3.1 Implement signup server flow that creates the Better Auth identity and then creates the linked domain profile.
- [x] 3.2 Implement login flow wiring so successful email/password login produces a Better Auth session usable by SSR requests.
- [x] 3.3 Implement logout flow wiring so the Better Auth session is cleared and shell rendering returns to guest state.
- [x] 3.4 Implement the Better Auth-supported password recovery entry point or a safe recovery contract that does not reveal whether an email exists.
- [x] 3.5 Add form/action validation for auth flows using the project form validation pattern.

## 4. Authorization Helpers

- [x] 4.1 Add reusable server helpers for `getViewer`, `requireUser`, `requireMember`, `requireAdmin`, `requirePartnerForResource`, and `requireOwnerOrAdmin`.
- [x] 4.2 Ensure helpers reject guests before protected data is read or mutated.
- [x] 4.3 Ensure partner ownership checks allow admins or matching partner profile IDs only.
- [x] 4.4 Ensure owner-or-admin checks allow the owning user or an admin only.
- [x] 4.5 Map authorization failures to safe redirects, responses, or form errors without exposing protected data.

## 5. Shell, Pages, And Display Data

- [x] 5.1 Add an adapter that maps hydrated viewer context into the existing app-shell view model shape.
- [x] 5.2 Wire shell logout and profile actions to Better Auth-backed behavior and protected profile access.
- [x] 5.3 Add auth-aware page handling for public, member, partner, and admin surfaces using server-resolved viewer state.
- [x] 5.4 Add display-data states for guest/member/partner/admin viewers and auth form loading, success, error, disabled, unauthenticated, and forbidden states.
- [x] 5.5 Preserve SSR authority by passing server-resolved initial viewer/shell data to React islands instead of relying on client-only auth state.

## 6. Verification

- [x] 6.1 Add focused tests or smoke checks for signup profile creation, idempotent profile creation, viewer hydration, and authorization helper outcomes.
- [x] 6.2 Verify signup creates both a Better Auth user and a linked `user_profiles` row in the configured development database.
- [x] 6.3 Run project checks and formatting.
- [x] 6.4 Run OpenSpec validation for the change and all specs.
