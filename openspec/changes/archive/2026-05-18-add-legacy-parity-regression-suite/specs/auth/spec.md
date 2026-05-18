## ADDED Requirements

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
