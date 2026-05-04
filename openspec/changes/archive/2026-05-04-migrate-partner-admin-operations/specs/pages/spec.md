## ADDED Requirements

### Requirement: Operational Pages Execute Server Operations
Admin and partner pages SHALL submit operational mutations through authorized server actions and render returned results in the existing page surfaces.

#### Scenario: Admin event management submits
- **WHEN** an admin creates, updates, deletes, or generates a series of events from the admin page
- **THEN** the page submits to the matching event operation, renders validation or authorization errors in the event form area, and refreshes affected event rows after success.

#### Scenario: Admin partner management submits
- **WHEN** an admin creates, updates, deletes, generates a venue QR token, or provisions portal access for a partner
- **THEN** the page submits to the matching partner operation, renders validation or authorization errors in the partner form or row area, and refreshes affected partner rows after success.

#### Scenario: Partner check-in submits
- **WHEN** a partner selects an available check-in action for a guest row
- **THEN** the partner portal submits to the manual check-in operation, renders a safe error if the operation fails, and refreshes the guest row status after success.

#### Scenario: Admin member operation submits
- **WHEN** an admin refreshes users, freezes or unfreezes a member, or applies a credit adjustment
- **THEN** the page submits to the matching member operation and renders updated member status, credit balance, and ledger/history display data after success.

### Requirement: Venue QR Check-In Page Flow
Pages SHALL support a member-facing venue QR check-in flow backed by the venue token operation.

#### Scenario: Member opens venue QR link
- **WHEN** a signed-in member opens a valid venue QR/check-in link
- **THEN** the page submits or offers a check-in action for that token and renders the resulting success or no-eligible-booking message.

#### Scenario: Guest opens venue QR link
- **WHEN** a guest opens a venue QR/check-in link
- **THEN** the page routes the guest to authentication before protected booking eligibility is evaluated.

#### Scenario: Venue QR check-in succeeds
- **WHEN** the member venue QR operation marks a booking used
- **THEN** the page renders a success state and affected booking/check-in views can show the checked-in status.
