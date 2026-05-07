## ADDED Requirements

### Requirement: Partner Portal Live Operations UI
The partner portal SHALL render and mutate only the authenticated partner's venue operation data.

#### Scenario: Partner portal renders live venue data
- **WHEN** a partner opens `/partner`
- **THEN** the portal displays their partner details, venue QR path or missing-token state, event options, guest rows, export controls, and check-in controls from authorized server data.

#### Scenario: Partner checks in eligible guest row
- **WHEN** the partner checks in an eligible confirmed booking for their own venue
- **THEN** the booking row status changes to `USED`, the checked-in timestamp renders, and the partner guest list refreshes.

#### Scenario: Partner exports scoped guest rows
- **WHEN** the partner requests a guest or code export
- **THEN** only export rows for that partner venue are returned.

### Requirement: Admin Operations UI Mutation Parity
The admin operations UI SHALL connect visible event, partner, and member controls to authorized server operations.

#### Scenario: Admin event operation refreshes affected views
- **WHEN** an admin creates, updates, deletes, or series-creates events
- **THEN** the event list, dashboard counts, public discovery data, and affected partner/event options refresh after success.

#### Scenario: Admin partner operation refreshes affected views
- **WHEN** an admin creates, updates, deletes, rotates a QR token, or provisions portal access for a partner
- **THEN** partner rows and affected operational or public partner display data refresh after success.

#### Scenario: Admin member operation refreshes affected views
- **WHEN** an admin freezes or unfreezes a member or adjusts member credits
- **THEN** the member row, profile query, ledger query, and booking eligibility state refresh after success.

#### Scenario: Operational action failure is visible
- **WHEN** validation, conflict, business-rule, or authorization checks prevent an admin operation
- **THEN** the related form or row action displays a safe visible error and no stale success state remains.

### Requirement: Admin Member UI Audit Operations
The admin member surface SHALL expose live member rows and audit-oriented history data needed for member operations.

#### Scenario: Admin member list renders live rows
- **WHEN** an admin opens the members tab
- **THEN** member rows show role, subscription status, credits, booking counts, event-open counts, saved/waitlist counts, provider fields where available, and freeze/unfreeze action availability.

#### Scenario: Expanded member renders operational history
- **WHEN** an admin expands a member row
- **THEN** the UI displays preferences, history counts, past events, waitlist/saved/recent-intel sections, behavior summaries, credit adjustment controls, and current freeze/unfreeze state from authorized admin data.

#### Scenario: Non-admin member operation is rejected
- **WHEN** a guest, member, or partner submits a member admin operation
- **THEN** the server rejects it and no protected member or ledger rows are exposed.
