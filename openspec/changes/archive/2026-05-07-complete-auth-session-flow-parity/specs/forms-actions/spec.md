## ADDED Requirements

### Requirement: Auth Form Error Parity
Authentication forms SHALL provide safe, user-friendly error messages matching legacy behavior.

#### Scenario: Login with invalid credentials
- **WHEN** a user submits the login form with incorrect credentials
- **THEN** the form displays a generic "Invalid email or password" error
- **AND** the password field is cleared.

### Requirement: Password Reset Success State
The password reset request form SHALL transition to a visible success state upon submission.

#### Scenario: Successful reset request
- **WHEN** a user submits a valid email to the password reset form
- **THEN** the form is replaced by a success message instructing the user to check their inbox.
