## MODIFIED Requirements

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
