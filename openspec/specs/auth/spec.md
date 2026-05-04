## Purpose

Define Better Auth-backed identity, session, domain profile hydration, and server-side authorization behavior.
## Requirements
### Requirement: Better Auth Email Password Flow
The app SHALL use Better Auth for email/password identity, session creation, session clearing, and account recovery entry points through typed server-side form actions.

#### Scenario: Visitor signs up
- **WHEN** a visitor submits valid signup data with email, password, first name, and last name through the signup action
- **THEN** Better Auth creates the identity
- **AND** the app creates a linked domain profile for that identity
- **AND** the action returns a success result with any viewer or query invalidation hints needed by the landing form.

#### Scenario: Signup validation fails
- **WHEN** a visitor submits invalid signup data through the signup action
- **THEN** the action returns field-associated validation messages
- **AND** Better Auth identity creation and domain profile creation do not run.

#### Scenario: User logs in
- **WHEN** a user submits valid email/password credentials through the login action
- **THEN** Better Auth creates an authenticated session
- **AND** subsequent server requests can resolve the session from request headers or cookies
- **AND** the action returns a success result suitable for refreshing authenticated shell state.

#### Scenario: Login validation fails
- **WHEN** a user submits invalid login input through the login action
- **THEN** the action returns field-associated validation messages
- **AND** no authenticated session is created.

#### Scenario: Login credentials are rejected
- **WHEN** a user submits syntactically valid but incorrect credentials through the login action
- **THEN** the action returns a safe form-level error
- **AND** the response does not reveal whether the email address exists.

#### Scenario: User logs out
- **WHEN** an authenticated user selects logout
- **THEN** the Better Auth session is cleared
- **AND** subsequent shell rendering treats the viewer as a guest.

#### Scenario: User requests password recovery
- **WHEN** a user submits a password recovery request for an email address through the recovery action
- **THEN** the app uses the Better Auth-supported recovery flow or returns a safe success response that does not reveal whether the email exists.

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

