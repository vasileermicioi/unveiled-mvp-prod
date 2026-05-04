## ADDED Requirements

### Requirement: Auth-Aware Page Access
Pages SHALL use server-resolved viewer/session state to decide protected rendering and redirects.

#### Scenario: Guest accesses public page
- **WHEN** a guest accesses landing, public discover, how-it-works, FAQ, or membership pages
- **THEN** the page renders without requiring a session.

#### Scenario: Guest accesses member page
- **WHEN** a guest accesses discovery, saved events, bookings, or profile routes that require membership
- **THEN** the page redirects or renders an auth-required state before protected member data is loaded.

#### Scenario: Partner accesses partner page
- **WHEN** a partner viewer accesses partner portal routes
- **THEN** the page renders only partner-owned data after server-side partner ownership is resolved.

#### Scenario: Admin accesses admin page
- **WHEN** an admin viewer accesses admin routes
- **THEN** the page renders only after server-side admin authorization succeeds.

### Requirement: Auth Form Surfaces
Pages SHALL expose migrated auth form behavior backed by Better Auth and domain profile creation.

#### Scenario: Signup form succeeds
- **WHEN** a visitor submits valid signup form data
- **THEN** the page creates the Better Auth identity, creates the default domain profile, and routes the viewer according to onboarding/profile state.

#### Scenario: Login form succeeds
- **WHEN** a visitor submits valid login credentials
- **THEN** the page creates a Better Auth session and routes the viewer according to role and profile state.

#### Scenario: Auth form fails
- **WHEN** signup, login, or recovery submission fails validation or authentication
- **THEN** the page renders a safe user-facing error without leaking protected account details.
