## ADDED Requirements

### Requirement: Operations UI Forms Submit Existing Actions
Admin and partner operation forms SHALL submit through typed server actions and preserve the existing action result envelope.

#### Scenario: Admin event form submits existing operation
- **WHEN** an admin submits create, update, delete, or series event input
- **THEN** the form calls the matching authorized server action, renders returned field or form errors, and invalidates affected event, dashboard, discovery, and option-list queries after success.

#### Scenario: Admin partner form submits existing operation
- **WHEN** an admin submits partner create/update/delete, QR token rotation, or portal access provisioning input
- **THEN** the form or row action calls the matching authorized server action, renders returned field or form errors, and invalidates affected partner, portal, dashboard, and public partner queries after success.

#### Scenario: Admin member form submits existing operation
- **WHEN** an admin submits freeze, unfreeze, or credit adjustment input
- **THEN** the row action calls the matching authorized server action, renders returned errors, and invalidates affected admin member, member profile, ledger, booking eligibility, and dashboard queries after success.

#### Scenario: Partner check-in form submits existing operation
- **WHEN** a partner submits a guest check-in action
- **THEN** the row action calls the matching authorized server action, renders returned errors, and invalidates affected partner portal and guest-list queries after success.

### Requirement: Operations UI Export Actions Are Authorized
Operational export controls SHALL request export rows through authorized server action or route boundaries before client download behavior runs.

#### Scenario: Partner export uses partner scope
- **WHEN** a partner downloads guest or code export data
- **THEN** the action or route verifies partner ownership and returns only rows owned by the linked partner.

#### Scenario: Admin export uses admin scope
- **WHEN** an admin downloads booking or code export data
- **THEN** the action or route verifies admin role and returns only admin-authorized rows.

#### Scenario: Export failure renders safely
- **WHEN** export validation or authorization fails
- **THEN** the export control renders a safe visible error and does not produce a stale or unauthorized file.
