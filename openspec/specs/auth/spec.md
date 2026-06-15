## Purpose

Define Better Auth-backed identity, session, domain profile hydration, and server-side authorization behavior.
## Requirements
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

### Requirement: Domain Profile Creation
The app SHALL maintain a `user_profiles` row for each signed-up product user.

#### Scenario: Signup creates default profile
- **WHEN** signup succeeds for a standard member
- **THEN** a linked domain profile is created with role `USER`, zero or configured starting credits, selected/default language, default subscription state, default empty preferences, and onboarding incomplete.

#### Scenario: Profile creation is idempotent
- **WHEN** profile creation is attempted for an identity that already has a domain profile
- **THEN** the existing profile is preserved and no duplicate profile row is created.

#### Scenario: Missing profile is repaired safely
- **WHEN** session hydration finds an authenticated Better Auth user without a domain profile
- **THEN** the app either creates a safe default profile for standard user flows or returns a typed profile-missing failure for privileged flows.

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

### Requirement: Authorization Helpers
The app SHALL expose reusable server-side authorization helpers for pages, API routes, and Astro Actions.

#### Scenario: Signed-in access is required
- **WHEN** a protected member route or action requires authentication
- **THEN** the helper rejects guest requests before protected data is read or mutated.

#### Scenario: Admin access is required
- **WHEN** an admin route or action runs
- **THEN** the helper permits only viewers with role `ADMIN`.

#### Scenario: Partner ownership is required
- **WHEN** a partner route or action accesses partner-owned data
- **THEN** the helper permits admins or partners whose profile partner ID matches the resource partner ID.

#### Scenario: Owner or admin access is required
- **WHEN** a route or action accesses user-owned data
- **THEN** the helper permits the owning user or an admin and rejects other viewers.

#### Scenario: Authorization fails safely
- **WHEN** an authorization helper rejects access
- **THEN** it returns or throws a typed unauthenticated or forbidden failure without exposing protected data.

### Requirement: Auth Runtime Boundaries
The app SHALL keep target auth behavior independent from Firebase runtime code and legacy client store internals.

#### Scenario: Firebase runtime is absent
- **WHEN** auth/profile functionality is implemented
- **THEN** it does not import Firebase Auth, Firestore, Firebase Functions, Firebase Storage, or `_old_app/store.ts`.

#### Scenario: Better Auth adapter remains authoritative
- **WHEN** session or identity data is read
- **THEN** Better Auth adapter tables remain the source of identity/session truth and domain profile rows remain the source of product role/profile truth.

### Requirement: Cloudflare Auth Runtime
The app SHALL run Better Auth session creation, session clearing, cookie handling, and viewer hydration correctly in Cloudflare preview and production environments.

#### Scenario: Preview login establishes session
- **WHEN** a user logs in through a Cloudflare preview deployment with valid credentials
- **THEN** Better Auth creates a session cookie scoped to the preview origin
- **AND** subsequent server-rendered requests resolve the authenticated viewer.

#### Scenario: Production login establishes session
- **WHEN** a user logs in through the production Cloudflare deployment with valid credentials
- **THEN** Better Auth creates a session cookie scoped to the production origin
- **AND** subsequent server-rendered requests resolve the authenticated viewer.

#### Scenario: Logout clears Cloudflare session
- **WHEN** an authenticated user logs out from preview or production
- **THEN** Better Auth clears the session cookie for the active origin
- **AND** subsequent server-rendered requests resolve a guest viewer.

### Requirement: Auth Environment Configuration
The app SHALL configure Better Auth URL, public auth URL, app URL, and auth secret per local, preview, and production environment.

#### Scenario: Required auth secret is missing
- **WHEN** a Cloudflare runtime handles an auth request without `BETTER_AUTH_SECRET`
- **THEN** the request fails safely and health/readiness reports a configuration failure without exposing secret values.

#### Scenario: Auth URL matches deployment origin
- **WHEN** Better Auth creates redirects, callbacks, or cookies in preview or production
- **THEN** it uses the configured URL for that environment rather than a localhost or Firebase origin.

#### Scenario: Public auth URL is exposed to client code
- **WHEN** client code needs an auth endpoint origin
- **THEN** it reads only the public auth URL value and never receives `BETTER_AUTH_SECRET`.

### Requirement: Role-Aware Route Redirects
The app SHALL redirect users away from routes their current role cannot own before protected data is loaded.

#### Scenario: Guest opens protected route
- **WHEN** a guest opens `/app`, `/saved`, `/bookings`, `/profile`, `/partner`, or `/admin`
- **THEN** the app routes them to the login or landing experience with visible sign-in affordance
- **AND** protected member, partner, or admin data is not loaded.

#### Scenario: Partner opens member or admin route
- **WHEN** a partner opens `/app`, `/saved`, `/bookings`, `/profile`, or `/admin`
- **THEN** the app routes them to `/partner`.

#### Scenario: Partner opens public route
- **WHEN** a partner opens `/`, `/discover`, `/how-it-works`, `/membership`, or `/faq`
- **THEN** the public route remains accessible.

#### Scenario: Admin opens partner route
- **WHEN** an admin opens `/partner` without partner ownership
- **THEN** the app routes them to `/admin`.

#### Scenario: Admin opens member route
- **WHEN** an admin opens `/app`, `/saved`, `/bookings`, or `/profile`
- **THEN** the app routes them to `/admin` unless the implementation explicitly supports admin impersonation for that route.

### Requirement: Route Ownership Helpers
The app SHALL expose reusable server-side helpers for mapping a route surface and viewer role to render, redirect, or forbidden outcomes.

#### Scenario: Public ownership is checked
- **WHEN** a public route is evaluated
- **THEN** guest, member, partner, and admin viewers can render it without protected data access.

#### Scenario: Member ownership is checked
- **WHEN** a member route is evaluated
- **THEN** only an authenticated `USER` viewer can render it as the route owner.

#### Scenario: Partner ownership is checked
- **WHEN** a partner route is evaluated
- **THEN** only a partner with partner ownership context or an explicitly permitted admin-owned partner context can render partner-owned data.

#### Scenario: Admin ownership is checked
- **WHEN** an admin route is evaluated
- **THEN** only an authenticated `ADMIN` viewer can render it.

### Requirement: Member Onboarding Redirect Authorization
Auth routing SHALL direct authenticated members with incomplete profile or onboarding state to onboarding before member discovery while preserving role authorization.

#### Scenario: Incomplete member requests discovery
- **WHEN** an authenticated member with incomplete onboarding or profile state requests regular member discovery
- **THEN** auth-aware routing redirects them to onboarding

#### Scenario: Complete member requests onboarding
- **WHEN** an authenticated member with completed onboarding requests onboarding directly
- **THEN** auth-aware routing allows a safe redirect to member discovery or a read-only completed state according to route behavior

### Requirement: Authorized Member Data And Actions
Auth helpers SHALL ensure member-only route data and actions operate only on the authenticated member's own data.

#### Scenario: Member route data is loaded
- **WHEN** member discovery, saved, bookings, profile, membership, or shell data is loaded
- **THEN** repositories receive the authenticated member identity and return only authorized member data

#### Scenario: Member action is submitted
- **WHEN** a member submits onboarding, saved event, profile, preference, billing, newsletter, language, booking, or waitlist actions
- **THEN** the action authorizes against the authenticated member identity before mutating data

#### Scenario: Member onboarding preferences are synchronized
- **WHEN** an authenticated member submits onboarding preferences (including districts, interests, weekdays, and languages)
- **THEN** the onboarding action validates the inputs against schema constraints
- **AND** updates the profile language
- **AND** persists the preferences reliably to the database

### Requirement: Authorization Regression Coverage
The app SHALL have automated regression coverage for route and action authorization outcomes across guest, member, partner, and admin roles.

#### Scenario: Protected route redirects are covered
- **WHEN** the parity suite requests `/app`, `/saved`, `/bookings`, `/profile`, `/partner`, or `/admin` as a guest or wrong role
- **THEN** the expected redirect target or safe denied outcome is asserted before protected data is loaded.

#### Scenario: Protected action authorization is covered
- **WHEN** the parity suite submits booking-adjacent, profile, partner, or admin actions as an unauthorized role
- **THEN** the action returns the expected unauthenticated or forbidden result and no protected state is disclosed.

#### Scenario: Authorized role access is covered
- **WHEN** a seeded authorized role requests its owned route or action
- **THEN** the suite verifies the request reaches seeded protected data or mutation behavior without cross-role leakage.

### Requirement: Language Preference Persistence
Auth and viewer hydration SHALL resolve, persist, and refresh selected language consistently for guest and authenticated member flows.

#### Scenario: Guest language resolves from cookie
- **WHEN** a request has no authenticated session
- **THEN** viewer and shell hydration use the persisted guest language cookie when valid
- **AND** fall back to the default supported language when the cookie is missing or invalid

#### Scenario: Member language resolves from profile
- **WHEN** a request has an authenticated member, partner, or admin session
- **THEN** viewer and shell hydration use the selected language stored on the authenticated profile when valid
- **AND** fall back to the default supported language when the stored profile language is missing or invalid

#### Scenario: Member language update is authorized
- **WHEN** an authenticated member submits a language preference update
- **THEN** the action authorizes against the current member identity before mutating the profile language
- **AND** subsequent viewer, shell, and member route display data use the updated language

#### Scenario: Guest language update does not require profile mutation
- **WHEN** a guest switches language
- **THEN** the app updates only the guest language cookie
- **AND** no authenticated profile mutation is attempted

