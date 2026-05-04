## 1. Shared Contracts

- [x] 1.1 Create shared UI Zod schema modules for auth, onboarding/preferences, profile/account, membership inputs, partner forms, event forms, event series, member admin actions, and check-in actions.
- [x] 1.2 Preserve visible legacy validation messages from `_old_app/utils/formSchemas.ts` and related form components in the new schema messages or message keys.
- [x] 1.3 Add a typed action result envelope with `ok`, `fieldErrors`, `formError`, `notice`, `data`, and `invalidate` support.
- [x] 1.4 Add helpers to convert Zod issues into path-keyed field errors compatible with React Hook Form.
- [x] 1.5 Define shared TanStack Query invalidation key helpers for auth viewer, profile, preferences, events, partners, bookings, admin member rows, and check-in views.

## 2. Astro Actions

- [x] 2.1 Implement auth actions for signup, login, password recovery, and logout using Better Auth and the shared auth schemas.
- [x] 2.2 Implement onboarding and preference update actions that persist validated profile preference data and onboarding completion.
- [x] 2.3 Implement profile/account update actions for editable member profile and account settings fields.
- [x] 2.4 Implement membership-status input actions for current placeholder billing/member status behavior without adding full payment provider integration.
- [x] 2.5 Implement partner management actions for creating and updating partner form data with admin authorization.
- [x] 2.6 Implement admin event create/update actions, including event series builder validation and persistence mapping.
- [x] 2.7 Implement member admin actions for role/status/credit adjustments with admin authorization and ledger-safe mutation behavior where credits change.
- [x] 2.8 Implement partner/admin check-in actions with partner ownership or admin authorization.
- [x] 2.9 Ensure every protected action resolves viewer context and rejects unauthenticated, forbidden, or ownership-invalid submissions before mutation.

## 3. React Form Integration

- [x] 3.1 Add a client helper that submits actions, applies returned field errors to React Hook Form, shows form errors/notices, and invalidates returned query keys.
- [x] 3.2 Update the landing auth form island to use auth actions while preserving login/register/recovery visible states.
- [x] 3.3 Update onboarding and profile preference form islands to use action submissions while keeping local wizard and draft field state.
- [x] 3.4 Update membership form UI to submit only in-scope placeholder membership inputs and render action validation/status states.
- [x] 3.5 Update admin partner, event, event series, member admin, and check-in form islands to use the corresponding actions.
- [x] 3.6 Keep discovery filters, sorting, map toggles, modal state, and other non-mutating controls local or URL-backed without action submissions.

## 4. Runtime Boundaries

- [x] 4.1 Remove migrated form mutation dependencies on `_old_app/store.ts` and legacy Firebase runtime modules.
- [x] 4.2 Keep generated Drizzle insert schemas out of direct UI form contracts unless wrapped by UI-specific schemas.
- [x] 4.3 Verify action errors use safe user-facing messages and do not expose protected resource details on authorization failure.

## 5. Tests and Verification

- [x] 5.1 Add schema tests for valid and invalid auth, preference, partner, event, event series, member admin, and check-in inputs.
- [x] 5.2 Add action tests for validation failure, authorization failure, and successful mutation envelopes.
- [x] 5.3 Add React integration tests or focused component tests for mapping server field errors into React Hook Form state.
- [x] 5.4 Add tests or smoke coverage that successful actions include the expected invalidation hints.
- [x] 5.5 Run the project validation, typecheck, and relevant test commands for the changed form/action surface.
