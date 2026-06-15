## MODIFIED Requirements

### Requirement: Better Auth Email Password Flow
The app SHALL use Better Auth for email/password identity, session creation, session clearing, and account recovery entry points through typed server-side form actions, and SHALL expose the signup, login, logout, and password-recovery forms as selector-disciplinable, accessible, and bilingual surfaces that route every user-facing string through the typed `AuthFormCopy` dictionary.

#### Scenario: Visitor signs up
- **WHEN** a visitor submits valid signup data with email, password, first name, and last name through the signup action
- **THEN** Better Auth creates the identity
- **AND** the app creates a linked domain profile for that identity
- **AND** the action returns a success result with any viewer or query invalidation hints needed by the landing form.

#### Scenario: Signup validation fails
- **WHEN** a visitor submits invalid signup data through the signup action
- **THEN** the action returns field-associated validation messages localized in the active viewer language
- **AND** Better Auth identity creation and domain profile creation do not run.

#### Scenario: User logs in
- **WHEN** a user submits valid email/password credentials through the login action
- **THEN** Better Auth creates an authenticated session
- **AND** subsequent server requests can resolve the session from request headers or cookies
- **AND** the action returns a success result suitable for refreshing authenticated shell state.

#### Scenario: Login validation fails
- **WHEN** a user submits invalid login input through the login action
- **THEN** the action returns field-associated validation messages localized in the active viewer language
- **AND** no authenticated session is created.

#### Scenario: Login credentials are rejected
- **WHEN** a user submits syntactically valid but incorrect credentials through the login action
- **THEN** the action returns a safe form-level error localized in the active viewer language and mapped from the Better Auth error code through the typed `AuthErrorCopy` dictionary
- **AND** the response does not reveal whether the email address exists.

#### Scenario: User logs out
- **WHEN** an authenticated user selects logout
- **THEN** the Better Auth session is cleared
- **AND** subsequent shell rendering treats the viewer as a guest.

#### Scenario: User requests password recovery
- **WHEN** a user submits a password recovery request for an email address through the recovery action
- **THEN** the app uses the Better Auth-supported recovery flow or returns a safe success response that does not reveal whether the email exists.

#### Scenario: Signup form is selector-disciplinable
- **WHEN** a gherkin scenario or storybook `play` test targets the signup form
- **THEN** every input is reachable through `getByLabel` (a real `<label htmlFor>` or wrapped `<label>`)
- **AND** the form is wrapped in a `<form role="form" aria-label>` landmark
- **AND** the submit control carries a localized accessible name from `i18n.auth.forms.signup.submit`
- **AND** the field-error regions use `role="alert"` and are associated with their input via `aria-describedby`.

#### Scenario: Login form is selector-disciplinable
- **WHEN** a gherkin scenario or storybook `play` test targets the login form
- **THEN** the email and password inputs are reachable through `getByLabel`
- **AND** the "remember me" toggle (when present) is reachable through `getByRole('checkbox')` with a localized `aria-label`
- **AND** the submit control carries a localized accessible name from `i18n.auth.forms.login.submit`
- **AND** the form-level error region uses `role="alert"` and renders the localized `AuthErrorCopy` entry for the Better Auth error code.

#### Scenario: Password recovery form is selector-disciplinable
- **WHEN** a gherkin scenario or storybook `play` test targets the password recovery form
- **THEN** the email input is reachable through `getByLabel`
- **AND** the submit control carries a localized accessible name from `i18n.auth.forms.passwordRecovery.submit`
- **AND** the success state uses `role="status"` with a localized message that does not reveal whether the email exists.

#### Scenario: Logout affordance is accessible
- **WHEN** an authenticated viewer opens the shell's logout affordance
- **THEN** the trigger is a `<button>` with `aria-haspopup="menu"` and `aria-expanded` reflecting open / closed state
- **AND** the dropdown is a `<ul role="menu">` with localized menu item labels (e.g. "open profile", "log out", "log out everywhere") from `i18n.auth.forms.logout.*`
- **AND** the active item (if any) is marked with `aria-current`.

#### Scenario: Auth form copy is DE/EN parity-enforced
- **WHEN** the i18n module is type-checked
- **THEN** the typed `AuthFormCopy` shape requires every `auth.forms.signup.*`, `auth.forms.login.*`, `auth.forms.logout.*`, and `auth.forms.passwordRecovery.*` key to exist in both the DE and EN bundles
- **AND** adding a key to one language without the other fails `bun run check`.

#### Scenario: Better Auth error codes are localized
- **WHEN** a Better Auth action returns a known error code (e.g. `USER_ALREADY_EXISTS`, `INVALID_EMAIL`, `INVALID_PASSWORD`, `INVALID_EMAIL_OR_PASSWORD`, `TOO_MANY_REQUESTS`, `EMAIL_NOT_VERIFIED`)
- **THEN** the rendered string is the `i18n.auth.errors.<code>` entry in the active viewer language
- **AND** unknown codes render the `i18n.auth.errors.unknown` fallback
- **AND** codes that exist in Better Auth but are absent from the typed `AuthErrorCopy` shape render the `{i18n.missing:<key>}` placeholder (per the i18n-copy spec) rather than an English literal.

### Requirement: Session Viewer Hydration
The app SHALL resolve authenticated viewer context from Better Auth session data plus the linked domain profile.

#### Scenario: Guest viewer is resolved
- **WHEN** no valid session exists on the request
- **THEN** viewer hydration returns a guest context with no domain profile and no protected privileges.

#### Scenario: Member viewer is resolved
- **WHEN** a valid session exists for a `USER` profile
- **THEN** viewer hydration returns user identity, role, profile fields, selected language, credits, subscription state, saved count, and onboarding state.

#### Scenario: Partner viewer is resolved
- **WHEN** a valid session exists for a `PARTNER` profile
- **THEN** viewer hydration returns user identity, role, linked partner ID, selected language, and partner ownership context.

#### Scenario: Admin viewer is resolved
- **WHEN** a valid session exists for an `ADMIN` profile
- **THEN** viewer hydration returns user identity, role, selected language, and admin privilege context.
