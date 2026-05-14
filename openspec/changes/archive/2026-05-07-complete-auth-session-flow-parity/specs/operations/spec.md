## ADDED Requirements

### Requirement: Venue QR Check-In Continuation
The venue check-in operation SHALL support guest initiation and post-auth completion.

#### Scenario: Guest initiates venue QR check-in
- **WHEN** a guest user scans a valid venue QR code
- **THEN** the app displays a "Login to Check In" message
- **AND** redirects the user to the login/signup page with the check-in context preserved.

#### Scenario: Post-auth check-in completion
- **WHEN** a user completes authentication after scanning a venue QR code
- **THEN** the app automatically attempts to complete the venue check-in operation using the preserved context.
