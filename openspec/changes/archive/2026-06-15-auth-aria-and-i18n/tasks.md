## 1. Umbrella Setup

- [x] 1.1 Create the per-feature folder at `10-iteration/features/improvements/auth-aria-and-i18n/` and seed the umbrella `proposal.md` (mirrors `openspec/changes/auth-aria-and-i18n/proposal.md`), umbrella `tasks.md` (this file), and umbrella `specs.md` (pointer to the OpenSpec capability delta).
- [x] 1.2 Add five per-row sub-folders at `10-iteration/features/improvements/auth-aria-and-i18n/{signup-form-aria-and-i18n,login-form-aria-and-i18n,logout-flow-aria,password-recovery-aria-and-i18n,better-auth-error-i18n}/` and seed each with `proposal.md` + `tasks.md` + `feature.feature` + `<component>.stories.tsx` + `specs.md` (one absorbed row per folder).
- [x] 1.3 Update `09-iteration/01-review-existing-features.md` rows 51–54 and 57 to `status: specced` and fill in the `openspec-change` column with `openspec/changes/auth-aria-and-i18n/`.
- [x] 1.4 Confirm the umbrella change is `applyRequires: [tasks]` ready and run `openspec validate auth-aria-and-i18n`.

## 2. i18n Dictionary Extension

- [x] 2.1 Extend `src/lib/i18n.ts` with the `auth.forms.signup.*`, `auth.forms.login.*`, `auth.forms.logout.*`, and `auth.forms.passwordRecovery.*` bundles in DE and EN, covering every visible string on the four auth forms (title, field labels, placeholders, submit button, link copy, success / error alert copy, "back to login" affordance).
- [x] 2.2 Extend `src/lib/i18n.ts` with the `auth.errors.*` bundle in DE and EN, keyed by the Better Auth error codes surfaced through the auth actions (`USER_ALREADY_EXISTS`, `INVALID_EMAIL`, `INVALID_PASSWORD`, `INVALID_EMAIL_OR_PASSWORD`, `TOO_MANY_REQUESTS`, `EMAIL_NOT_VERIFIED`, plus the `unknown` fallback).
- [x] 2.3 Export the typed `AuthFormCopy` and `AuthErrorCopy` shapes from `src/lib/i18n.ts` so the type checker enforces DE/EN parity of the new keys; mirror the `ShellCopy` precedent from the app-shell umbrella.
- [x] 2.4 Extend the i18n parity unit test (`src/lib/i18n.test.ts`) to assert that every key in `AuthFormCopy` and `AuthErrorCopy` is defined in both DE and EN.
- [x] 2.5 Add a `mapAuthError(code, language)` helper that returns the typed `AuthErrorCopy` entry, falls back to `auth.errors.unknown`, and finally to the `{i18n.missing:<key>}` placeholder for unmapped codes (with a console warning per the i18n-copy spec).
- [x] 2.6 Run `bun run check` to confirm the new typed shapes pass the type check and the parity test passes.

## 3. Forms-Actions Error Mapping

- [x] 3.1 Update `src/lib/auth-account-actions.ts` (and any helper module in `src/lib/auth-forms.ts` or `src/lib/auth.ts` that builds the failure envelope) to call `mapAuthError(code, viewer.language)` before returning the `safe.error` shape.
- [x] 3.2 Confirm the action result envelope (`safe` / `data` / `error`) is unchanged and that no English literal is embedded in the response payload.
- [x] 3.3 Add a unit test (or extend the existing `parity-actions.integration.test.ts`) asserting that a returned Better Auth error code is rendered through `mapAuthError` and that the string is the DE/EN entry for that code.

## 4. Row 1 — Signup Form (`signup-form-aria-and-i18n`)

- [x] 4.1 Refactor `SignupForm.tsx` to wrap the form in `<form role="form" aria-label>` and add real `<label htmlFor>` (or wrapped `<label>`) for email, password, first name, and last name inputs.
- [x] 4.2 Add `aria-describedby` to each input pointing at the field-error region; render the field-error region with `role="alert"` and a localized message from `i18n.auth.forms.signup.fieldErrors.*`.
- [x] 4.3 Add localized `aria-label` to the submit control, the "back to login" link, and the password-visibility toggle; route the visible button text through `i18n.auth.forms.signup.submit`.
- [x] 4.4 Replace any hard-coded English strings on the signup form with `copyFor(viewer.language).auth.forms.signup.*` lookups; confirm the typed `AuthFormCopy` shape covers every new key.
- [x] 4.5 Add `tests/features/identity/signup-form.feature` with one happy-path scenario (`WHEN` the visitor submits valid signup data, `THEN` the success alert renders and the viewer is routed to onboarding) and one edge-case scenario (invalid email → field error renders via `role="alert"` with the localized `INVALID_EMAIL` mapping); use only `getFieldNearestTo`, `getButtonNearestTo`, `getLinkNearestTo`, `getByRole`, `getByLabel`, `getInside` selectors.
- [x] 4.6 Add `SignupForm.stories.tsx` with a "happy path" story and an "invalid input" story; both stories mount the form with mock auth context and mock i18n, and carry a `play` interaction test that drives the same flow as the gherkin scenario. Tag both stories with `@story(component=SignupForm, story=…)` and reference the scenario id from `feature.feature`.
- [x] 4.7 Add the per-row sub-folder at `10-iteration/features/improvements/auth-aria-and-i18n/signup-form-aria-and-i18n/` with `proposal.md` + `tasks.md` (this row's checklist) + `feature.feature` + `SignupForm.stories.tsx` + `specs.md` (pointing at the `auth` and `forms-actions` capability deltas).

## 5. Row 2 — Login Form (`login-form-aria-and-i18n`)

- [x] 5.1 Refactor `LoginForm.tsx` to wrap the form in `<form role="form" aria-label>` and add real `<label htmlFor>` for email and password inputs.
- [x] 5.2 Add `aria-describedby` to each input pointing at the field-error region; render the form-level error region with `role="alert"` and a localized message from `i18n.auth.errors.<code>` via `mapAuthError`.
- [x] 5.3 Add localized `aria-label` to the submit control, the "forgot password" link, and the "create account" link; route the visible button text through `i18n.auth.forms.login.submit`.
- [x] 5.4 Replace any hard-coded English strings on the login form with `copyFor(viewer.language).auth.forms.login.*` lookups; confirm the typed `AuthFormCopy` shape covers every new key.
- [x] 5.5 Add `tests/features/identity/login-form.feature` with one happy-path scenario (`WHEN` the user submits valid credentials, `THEN` the success state refreshes the shell) and one edge-case scenario (incorrect credentials → form-level alert renders the localized `INVALID_EMAIL_OR_PASSWORD` mapping); use only proximity + layout selectors.
- [x] 5.6 Add `LoginForm.stories.tsx` with a "happy path" story and an "invalid credentials" story; both stories carry a `play` interaction test that drives the same flow as the gherkin scenario and are tagged with `@story(component=LoginForm, story=…)` referencing the scenario id from `feature.feature`.
- [x] 5.7 Add the per-row sub-folder at `10-iteration/features/improvements/auth-aria-and-i18n/login-form-aria-and-i18n/` with `proposal.md` + `tasks.md` + `feature.feature` + `LoginForm.stories.tsx` + `specs.md` (pointing at the `auth` and `forms-actions` capability deltas).

## 6. Row 3 — Logout Flow (`logout-flow-aria`)

- [x] 6.1 Refactor the logout affordance surfaced in `src/components/unveiled/app-shell.tsx` (and the member profile island's "log out everywhere" affordance) so the trigger is a `<button>` with `aria-haspopup="menu"` and `aria-expanded` reflecting open / closed state.
- [x] 6.2 Wrap the dropdown in `<ul role="menu">` with localized menu item labels (e.g. "open profile", "log out", "log out everywhere") routed through `i18n.auth.forms.logout.*`; mark the active item (if any) with `aria-current`.
- [x] 6.3 Confirm the logout submit calls the existing Better Auth sign-out action through the typed server action envelope (no change to the action contract).
- [x] 6.4 Replace any hard-coded English strings on the logout affordance with `copyFor(viewer.language).auth.forms.logout.*` lookups; confirm the typed `AuthFormCopy` shape covers every new key.
- [x] 6.5 Add `tests/features/identity/logout-flow.feature` with one happy-path scenario (`WHEN` the authenticated viewer opens the menu and selects "log out", `THEN` the session is cleared and the shell resolves a guest viewer) and one edge-case scenario (open menu → "log out everywhere" → typed action returns success → shell resolves a guest viewer); use only proximity + layout selectors.
- [x] 6.6 Add `LogoutFlow.stories.tsx` with an "open menu" story and a "log out" story; both stories carry a `play` interaction test that drives the same flow as the gherkin scenario and are tagged with `@story(component=LogoutFlow, story=…)` referencing the scenario id from `feature.feature`.
- [x] 6.7 Add the per-row sub-folder at `10-iteration/features/improvements/auth-aria-and-i18n/logout-flow-aria/` with `proposal.md` + `tasks.md` + `feature.feature` + `LogoutFlow.stories.tsx` + `specs.md` (pointing at the `auth` capability delta).

## 7. Row 4 — Password Recovery Form (`password-recovery-aria-and-i18n`)

- [x] 7.1 Refactor `PasswordRecoveryForm.tsx` to wrap the form in `<form role="form" aria-label>` and add a real `<label htmlFor>` for the email input.
- [x] 7.2 Add `aria-describedby` to the email input pointing at the field-error region; render the success region with `role="status"` and a localized message from `i18n.auth.forms.passwordRecovery.success` that does not reveal whether the email exists.
- [x] 7.3 Add localized `aria-label` to the submit control and the "back to login" link; route the visible button text through `i18n.auth.forms.passwordRecovery.submit`.
- [x] 7.4 Replace any hard-coded English strings on the recovery form with `copyFor(viewer.language).auth.forms.passwordRecovery.*` lookups; confirm the typed `AuthFormCopy` shape covers every new key.
- [x] 7.5 Add `tests/features/identity/password-recovery.feature` with one happy-path scenario (`WHEN` the user submits a valid email, `THEN` the success status renders the localized "check your inbox" message) and one edge-case scenario (invalid email format → field error renders via `role="alert"` with the localized `INVALID_EMAIL` mapping); use only proximity + layout selectors.
- [x] 7.6 Add `PasswordRecoveryForm.stories.tsx` with a "happy path" story and an "invalid input" story; both stories carry a `play` interaction test that drives the same flow as the gherkin scenario and are tagged with `@story(component=PasswordRecoveryForm, story=…)` referencing the scenario id from `feature.feature`.
- [x] 7.7 Add the per-row sub-folder at `10-iteration/features/improvements/auth-aria-and-i18n/password-recovery-aria-and-i18n/` with `proposal.md` + `tasks.md` + `feature.feature` + `PasswordRecoveryForm.stories.tsx` + `specs.md` (pointing at the `auth` and `forms-actions` capability deltas).

## 8. Row 5 — Better Auth Error Messages Localized (`better-auth-error-i18n`)

- [x] 8.1 Verify that `mapAuthError` is wired into every Better Auth failure path in `src/lib/auth-account-actions.ts`, `src/lib/auth-forms.ts`, and the auth islands (signup, login, recovery, logout); add a unit test asserting the mapping is invoked for every code the auth surface can return.
- [x] 8.2 Add `tests/features/identity/better-auth-errors.feature` with one happy-path scenario (DE viewer submits invalid signup data → form renders the DE `INVALID_EMAIL` string) and one edge-case scenario (EN viewer triggers an unmapped code → the form renders the `{i18n.missing:auth.errors.<code>}` placeholder and a console warning is logged); use only proximity + layout selectors.
- [x] 8.3 Add `BetterAuthErrorMessagesLocalized.stories.tsx` with a "mapped error" story and an "unmapped error" story; both stories render a `MockAuthErrorSurface` (or the actual form's error region) with mock Better Auth codes and mock i18n, and carry a `play` interaction test that drives the same flow as the gherkin scenario. Tag both stories with `@story(component=BetterAuthErrorMessagesLocalized, story=…)` referencing the scenario id from `feature.feature`.
- [x] 8.4 Add the per-row sub-folder at `10-iteration/features/improvements/auth-aria-and-i18n/better-auth-error-i18n/` with `proposal.md` + `tasks.md` + `feature.feature` + `BetterAuthErrorMessagesLocalized.stories.tsx` + `specs.md` (pointing at the `forms-actions` and `i18n-copy` capability deltas).

## 9. Selector Discipline Migration

- [x] 9.1 Audit every gherkin step and storybook `play` test added by this umbrella against `tests/steps/lint/selectors.ts` to confirm the proximity + layout selector discipline is preserved.
- [x] 9.2 Confirm no `data-testid`, no `getByText` chains, no CSS class selectors, no XPath, no `nth-child` / `nth-of-type`, and no positional selectors are used in any of the new files.
- [x] 9.3 Run `bun run check` (which runs the selector lint) and confirm it passes.

## 10. Verification

- [x] 10.1 Run `bun run check` and confirm it passes (`astro check` + `biome check .` + `bun run specs:check` + `bun run tokens:check`).
- [x] 10.2 Run the gherkin parity suite (`bun run test:e2e`) and confirm the 10 new scenarios (2 per absorbed row × 5 rows) pass.
- [x] 10.3 Run `bun run test:storybook` and confirm the new stories' `play` interaction tests pass.
- [x] 10.4 Run `bun run storybook:coverage` and confirm no drift for every new `@story(...)` tag.
- [x] 10.5 Run the i18n parity unit test (`bun run test:unit src/lib/i18n.test.ts` or the wired-in test runner) and confirm the new `AuthFormCopy` and `AuthErrorCopy` shapes pass full DE/EN parity.
- [x] 10.6 Confirm `openspec validate auth-aria-and-i18n` passes and run `openspec archive auth-aria-and-i18n`.
- [x] 10.7 Update `09-iteration/01-review-existing-features.md` rows 51–54 and 57 from `status: specced` to `status: merged` once the implementation lands.
