## Why

The five Better Auth surfaces that own the public identity journey
(`SignupForm`, `LoginForm`, `LogoutFlow`, `PasswordRecoveryForm`, and the
Better Auth error-message channel rendered by the auth islands and the
`auth-account-actions` actions) currently fail the 10-iteration selector
discipline, the `aria-*` completeness check, and the DE/EN copy parity
enforcement. The 09-iteration catalog flags all five rows as P0 with
`selector-discipline-violation`, `untranslated-copy`, or `missing-aria`.
The four form/flow rows also have no gherkin scenarios and no storybook
`play` tests, and the Better Auth error messages are surfaced in English
regardless of the active language. Shipping this umbrella unblocks the
gherkin and storybook coverage for every absorbed row and is required
before the auth capability can be considered selector-disciplinable for
later 10-iteration rows that depend on it (onboarding, member profile,
bookings).

## What Changes

- Refactor `SignupForm`, `LoginForm`, `LogoutFlow`, and
  `PasswordRecoveryForm` so every interactive element is reachable with
  proximity + layout selectors: every input gets a real `<label>`
  (or `aria-label` for icon-only controls), every form gets a
  `role="form"` landmark with a localized `aria-label`, every submit
  control carries a localized accessible name, and the success /
  error alert regions use `role="alert"` with a localized message.
- Localize the form copy, button labels, link copy, success messages,
  and field validation hints for the four auth forms in DE and EN via
  `src/lib/i18n.ts`. The typed `AuthFormCopy` shape exported from
  `i18n.ts` enforces DE/EN parity at type-check time, and the i18n
  parity unit test asserts full coverage of the new keys.
- Add the missing `aria-*` attributes to the logout affordance surfaced
  in `app-shell.tsx` (the avatar / dropdown that triggers the logout
  server action) and the "log out everywhere" affordance in the
  member profile island: `aria-haspopup`, `aria-expanded`,
  `role="menu"`, localized menu item labels, and `aria-current` on
  the active item.
- Localize the Better Auth error envelope that `auth-account-actions`
  and the auth islands surface. Every error code returned by Better
  Auth (`USER_ALREADY_EXISTS`, `INVALID_EMAIL`, `INVALID_PASSWORD`,
  `INVALID_EMAIL_OR_PASSWORD`, `TOO_MANY_REQUESTS`, `EMAIL_NOT_VERIFIED`,
  etc.) is mapped to a typed `AuthErrorCopy` shape in `i18n.ts` with DE
  and EN strings, and the rendering helper falls back to the
  `{i18n.missing:<key>}` placeholder for any unmapped code.
- Add one `<component>.stories.tsx` story per absorbed row
  (`SignupForm.stories.tsx`, `LoginForm.stories.tsx`,
  `LogoutFlow.stories.tsx`, `PasswordRecoveryForm.stories.tsx`,
  `BetterAuthErrorMessagesLocalized.stories.tsx`). Each story renders
  the component with mock data, mock auth context, and mock i18n, and
  has at least one `@storybook/test` `play` interaction test that
  exercises the same flow as the gherkin scenario.
- Add one `feature.feature` gherkin file per absorbed row
  (`tests/features/identity/signup-form.feature`,
  `tests/features/identity/login-form.feature`,
  `tests/features/identity/logout-flow.feature`,
  `tests/features/identity/password-recovery.feature`,
  `tests/features/identity/better-auth-errors.feature`) with a
  happy-path scenario and an edge-case scenario, all using proximity
  + layout selectors only.
- Update the `auth` capability spec with one `## MODIFIED Requirements`
  block per absorbed row, each declaring the new a11y / i18n
  contract for that surface.
- Update the `i18n-copy` capability spec with a `## MODIFIED
  Requirements` block declaring the `AuthFormCopy` and
  `AuthErrorCopy` typed dictionary shapes.
- The umbrella keeps the per-feature sub-folder format at
  `10-iteration/features/improvements/auth-aria-and-i18n/<row-slug>/`
  (one sub-folder per absorbed row) so the per-row Definition of Done
  (gherkin + storybook + tasks + proposal + specs.md) is satisfied
  without losing the per-row coverage.

## Capabilities

### New Capabilities

- _None_ — refactor of the existing `auth`, `forms-actions`, and
  `i18n-copy` capabilities.

### Modified Capabilities

- `auth`: 5 absorbed rows add one `## MODIFIED Requirements` block
  each (signup form, login form, logout flow, password recovery,
  Better Auth error messages). The new requirements codify the
  `aria-*` completeness, the proximity+layout selector discipline,
  and the DE/EN copy parity contract for each surface.
- `forms-actions`: Add one `## MODIFIED Requirements` block declaring
  that the signup, login, logout, and password-recovery typed
  server actions localize their validation and authorization
  failure envelopes through the same `AuthErrorCopy` dictionary.
- `i18n-copy`: Add one `## MODIFIED Requirements` block declaring
  the `AuthFormCopy` (per-form copy bundle) and `AuthErrorCopy`
  (Better Auth error-code copy bundle) typed dictionary shapes, the
  DE/EN parity enforcement, and the missing-key fallback contract
  for unmapped Better Auth error codes.

## Impact

- `src/components/unveiled/auth/` (or the current auth island
  location): `SignupForm.tsx`, `LoginForm.tsx`, `LogoutFlow.tsx`,
  `PasswordRecoveryForm.tsx` refactored to add labels, `aria-*`
  attributes, and routed copy. The error-message helper used by
  each form is updated to consult the new `AuthErrorCopy` shape.
- `src/components/unveiled/app-shell.tsx` and the member profile
  island: the logout affordance gets `aria-haspopup`,
  `aria-expanded`, `role="menu"`, and localized menu item labels.
- `src/lib/i18n.ts`: add the `auth.forms.signup.*`,
  `auth.forms.login.*`, `auth.forms.logout.*`,
  `auth.forms.passwordRecovery.*`, and `auth.errors.*` bundles in
  DE and EN; export the typed `AuthFormCopy` and `AuthErrorCopy`
  shapes that the type checker uses to enforce parity.
- `src/lib/auth-account-actions.ts`, `src/lib/auth-forms.ts`,
  `src/lib/auth.ts`: the error envelope returned to the client is
  mapped through `AuthErrorCopy` so the rendered string follows the
  active viewer language; the server-side action does not embed
  English literals.
- `tests/features/identity/signup-form.feature`,
  `tests/features/identity/login-form.feature`,
  `tests/features/identity/logout-flow.feature`,
  `tests/features/identity/password-recovery.feature`,
  `tests/features/identity/better-auth-errors.feature` (new):
  one happy-path + one edge-case scenario per row, all using
  proximity + layout selectors.
- `src/components/unveiled/auth/<Component>.stories.tsx` (one new
  file per absorbed row): each story renders the component with
  mock data, mock auth context, and mock i18n; each story has at
  least one `play` interaction test.
- `openspec/specs/auth/spec.md`: add 5 `## MODIFIED Requirements`
  blocks (one per absorbed row).
- `openspec/specs/forms-actions/spec.md`: add 1 `## MODIFIED
  Requirements` block for auth-form action error localization.
- `openspec/specs/i18n-copy/spec.md`: add 1 `## MODIFIED
  Requirements` block for the new typed `AuthFormCopy` and
  `AuthErrorCopy` dictionary shapes.
- `10-iteration/features/improvements/auth-aria-and-i18n/` (new):
  umbrella `proposal.md` + umbrella `tasks.md` + per-row
  `<row-slug>/{proposal.md, tasks.md, feature.feature,
  <component>.stories.tsx, specs.md}` sub-folders.
- Dependencies: none new. Storybook 8.6, `@storybook/test`, and
  the `@story(...)` tag schema are already shipped under
  `openspec/changes/archive/2026-06-14-gherkin-storybook-interaction-tests/`.
