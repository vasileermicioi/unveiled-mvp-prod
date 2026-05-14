## ADDED Requirements

### Requirement: Unified Identity and Profile Signup
The signup process SHALL ensure both authentication identity and domain profile are created before the user proceeds.

#### Scenario: Successful integrated signup
- **WHEN** a user completes the signup form with valid data
- **THEN** the server creates a Better Auth identity
- **AND** the server initializes a domain `user_profile` with `onboardingComplete: false`
- **AND** the user is authenticated and redirected to onboarding.

### Requirement: Role-Aware Session Resolution
The session resolution SHALL include the user's domain role and profile completion status.

#### Scenario: Session hydrated with domain role
- **WHEN** a session is validated on the server
- **THEN** the viewer context SHALL include the `role` and `partnerId` from the domain `user_profile`.

### Requirement: Password Recovery Feedback
The password recovery flow SHALL provide clear visible feedback for success and failure states.

#### Scenario: Password reset link requested
- **WHEN** a user submits a valid email for password reset
- **THEN** the server triggers the Better Auth reset flow
- **AND** the UI displays a confirmation message indicating the email has been sent.
