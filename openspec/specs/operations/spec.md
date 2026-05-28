## Purpose
Define partner and admin operational UI behavior, authorized mutations, exports, audit surfaces, and regression coverage.
## Requirements
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

### Requirement: Operational Flow Regression Coverage
The app SHALL have automated regression coverage for legacy-visible partner and admin operational flows.

#### Scenario: Partner check-in flow is covered
- **WHEN** a seeded partner or venue check-in flow successfully checks in an eligible booking
- **THEN** the suite verifies booking status, checked-in state, and the affected partner or venue-visible rows refresh to the new used state.

#### Scenario: Admin mutation flows are covered
- **WHEN** a seeded admin mutates event, partner, or member state through covered operational controls
- **THEN** the suite verifies the underlying result, the affected operational read models, and the visible route smoke assertions reflect the change.

#### Scenario: Operational authorization failures are covered
- **WHEN** a guest, member, or wrong partner scope attempts a protected operational flow
- **THEN** the suite verifies a safe visible failure or denied outcome and no protected operational rows are exposed.

### Requirement: Admin Asset Upload Operations
Admin operations SHALL support storage-backed event image and partner logo uploads without removing existing manual URL workflows.

#### Scenario: Admin uploads event image for event form
- **WHEN** an authenticated admin selects a valid event image file for an event form
- **THEN** the upload operation stores the file through the configured asset storage boundary
- **AND** returns a display URL that can be saved as the event `imageUrl`

#### Scenario: Admin uploads partner logo for partner form
- **WHEN** an authenticated admin selects a valid partner logo file for a partner form
- **THEN** the upload operation stores the file through the configured asset storage boundary
- **AND** returns a display URL that can be saved as the partner `logoUrl`

#### Scenario: Non-admin upload is rejected
- **WHEN** a guest, member, or partner attempts to upload an admin-managed event image or partner logo
- **THEN** the operation rejects the request before writing to asset storage
- **AND** no event or partner asset URL is changed

#### Scenario: Manual URL fallback remains available
- **WHEN** an admin provides a valid manual remote asset URL instead of uploading a file
- **THEN** event and partner save operations continue to persist that URL through the existing mutation flow

#### Scenario: Upload failure preserves existing asset
- **WHEN** storage, validation, or configuration prevents an upload after an existing asset URL is present
- **THEN** the operation returns a safe visible failure
- **AND** the existing event image or partner logo URL is not overwritten

### Requirement: Operational Actions Regression Run Verification
The transaction integration suite SHALL verify that admin credit adjustments and admin booking operations execute cleanly with ledger updates.

#### Scenario: Admin operational transaction verification
- **WHEN** the transaction test suite runs
- **THEN** it executes admin booking creation and credit adjustments, and asserts correct ledger entries are persisted.

### Requirement: Admin Member Behavior Intel Display
The admin member interface SHALL display detailed behavior metrics and interaction history for each member.

#### Scenario: Expanded member behavior panel renders
- **WHEN** an admin expands a member row
- **THEN** the UI displays session count, event-open count, booking count, waitlist count, saved/unsaved counts, filter apply count, list of recently opened event details, and latest interaction timestamps.

### Requirement: Admin Operations UI Partner Export Filter
The admin panel SHALL provide an interactive "Export partner" dropdown menu to filter the CSV booking export by partner.

#### Scenario: Admin configures export partner and downloads CSV
- **WHEN** an admin selects a partner in the "Export partner" dropdown and clicks the download CSV button
- **THEN** the UI passes the selected `partnerId` to the export action and downloads a CSV containing only that partner's bookings.

### Requirement: Partner Portal UI Event Export Filter
The partner portal SHALL pass the active event ID filter value to the booking export action when downloading guest codes.

#### Scenario: Partner configures event filter and downloads CSV
- **WHEN** a partner selects an event in the event filter dropdown and clicks the download CSV button
- **THEN** the UI passes the selected `eventId` to the booking export action.

