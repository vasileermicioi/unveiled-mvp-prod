## ADDED Requirements

### Requirement: Operational Action Result Display Data
Admin and partner display view models SHALL expose user-facing result data for operational actions.

#### Scenario: Event operation result data is available
- **WHEN** an event create, update, delete, or series operation completes
- **THEN** display data includes success notice text, safe form-level errors, field validation messages, affected event IDs, and invalidation hints for event/admin/discovery views.

#### Scenario: Partner operation result data is available
- **WHEN** a partner create, update, delete, token rotation, or portal provisioning operation completes
- **THEN** display data includes success notice text, safe form-level errors, field validation messages, affected partner ID, venue QR URL or missing-token text, portal login email or not-created text, and invalidation hints.

#### Scenario: Check-in operation result data is available
- **WHEN** a manual or venue QR check-in operation completes
- **THEN** display data includes success, already-used, not-open, no-eligible-booking, or forbidden state labels plus updated booking status and checked-in timestamp when applicable.

### Requirement: Operational Export Display Data
Admin and partner views SHALL receive export-oriented rows derived from authorized relational query data.

#### Scenario: Partner export rows are available
- **WHEN** a partner downloads booking codes or guest data
- **THEN** display data includes only that partner's authorized rows with Booking ID, User ID, Event, Code, Status, Tickets, and Created At columns.

#### Scenario: Admin export rows are available
- **WHEN** an admin exports partner, booking, or event-oriented data
- **THEN** display data includes authorized rows with the visible/export columns required by the admin page and booking display contracts.

### Requirement: Partner Ownership Display Data
Partner and admin display view models SHALL include ownership and linkage fields needed to enforce and explain operational access.

#### Scenario: Partner portal ownership data is available
- **WHEN** a partner portal view loads
- **THEN** display data includes the viewer's linked partner ID, partner name, partner address, venue QR URL or missing-token text, event options, and only guest booking rows owned by that partner.

#### Scenario: Admin partner linkage data is available
- **WHEN** an admin partner row renders
- **THEN** display data includes contact email, portal login email or not-created text, linked partner user ID when available, token state, and available row actions.
