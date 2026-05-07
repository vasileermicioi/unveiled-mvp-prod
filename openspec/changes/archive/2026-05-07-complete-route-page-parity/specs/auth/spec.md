## ADDED Requirements

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
