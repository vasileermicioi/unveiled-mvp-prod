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

The app SHALL have automated regression coverage for legacy-visible
partner and admin operational flows, including the paginated reads
that those flows depend on.

#### Scenario: Partner check-in flow is covered

- **WHEN** a seeded partner or venue check-in flow successfully
  checks in an eligible booking
- **THEN** the suite verifies booking status, checked-in state, and
  the affected partner or venue-visible rows refresh to the new used
  state.

#### Scenario: Admin mutation flows are covered

- **WHEN** a seeded admin mutates event, partner, or member state
  through covered operational controls
- **THEN** the suite verifies the underlying result, the affected
  operational read models, and the visible route smoke assertions
  reflect the change.

#### Scenario: Operational authorization failures are covered

- **WHEN** a guest, member, or wrong partner scope attempts a
  protected operational flow
- **THEN** the suite verifies a safe visible failure or denied
  outcome and no protected operational rows are exposed.

#### Scenario: Admin pagination reads are covered against the pagination seed

- **WHEN** a seeded admin opens the events tab at `pageSize = 20`
  against the `--profile pagination` dataset
- **THEN** the suite asserts that the first page renders 20 event
  rows, that pages 2 and 3 each render 20 additional rows, and that
  the "Next page" control advances the active page.

- **WHEN** a seeded admin opens the partners tab at `pageSize = 20`
  against the `--profile pagination` dataset
- **THEN** the suite asserts that the first page renders 20 partner
  rows, that page 3 contains seeded partners, and that the page-size
  control changes the rendered subset.

- **WHEN** a seeded admin opens the members tab at `pageSize = 20`
  against the `--profile pagination` dataset
- **THEN** the suite asserts that the first page renders 20 member
  rows, that page 3 contains seeded members, and that the
  freeze/unfreeze action remains available across paginated views.

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

### Requirement: Admin Dashboard Tab Navigation
The Admin dashboard UI SHALL provide tab navigation header controls to switch between operational categories and mount them conditionally.

#### Scenario: Admin switches tab navigation view
- **WHEN** an admin clicks the "Partners" tab header
- **THEN** the active tab updates to "Partners" and only the partners table list and partner creation form are mounted in the viewport

### Requirement: Admin Dashboard Lists Pagination Controls
The admin operations interface SHALL render pagination controls for events, partners, and members, enabling navigation across multiple data pages and changing page size filters.

#### Scenario: Admin navigates to the next page of members
- **WHEN** an admin clicks the "Next page" button in the member registry
- **THEN** the active view refetches and renders the next subset of member rows.

### Requirement: Admin Dashboard CRUD Deletion Safety
The Admin operations panel SHALL require confirmation from the admin before executing a delete operation on an event or a partner venue.

#### Scenario: Admin deletes event with confirmation modal
- **WHEN** an admin clicks the "Delete" button on an event row
- **THEN** the system SHALL display a deletion confirmation dialog with options to confirm or cancel the action

#### Scenario: Admin confirms event deletion
- **WHEN** an admin confirms the deletion in the confirmation dialog
- **THEN** the system SHALL call the delete event server action and refresh the active event list

#### Scenario: Admin cancels event deletion
- **WHEN** an admin cancels the deletion in the confirmation dialog
- **THEN** the system SHALL close the confirmation dialog and make no mutations

#### Scenario: Admin deletes partner with confirmation modal
- **WHEN** an admin clicks the "Delete" button on a partner row
- **THEN** the system SHALL display a deletion confirmation dialog with options to confirm or cancel the action

#### Scenario: Admin confirms partner deletion
- **WHEN** an admin confirms the deletion in the confirmation dialog
- **THEN** the system SHALL call the delete partner server action and refresh the active partner directory list

#### Scenario: Admin cancels partner deletion
- **WHEN** an admin cancels the deletion in the confirmation dialog
- **THEN** the system SHALL close the confirmation dialog and make no mutations

### Requirement: Admin Dashboard Edit Form Navigation
The Admin operations panel SHALL support mounting event and partner forms prefilled with existing database states to allow editing.

#### Scenario: Admin opens edit event view
- **WHEN** an admin clicks the "Edit" button on an event row
- **THEN** the system SHALL update the active tab view to the event form prefilled with the event's current properties

#### Scenario: Admin opens edit partner view
- **WHEN** an admin clicks the "Edit" button on a partner row
- **THEN** the system SHALL update the active tab view to the partner form prefilled with the partner's current properties

### Requirement: Localized Dialogs and Modals
All confirmation modals, alerts, and feedback banners on admin and partner surfaces SHALL display message copy translated in the active route language.

#### Scenario: Confirmation modal displays translated warning
- **WHEN** a deletion confirmation dialog is triggered
- **THEN** all warning copy, body messages, confirm actions, and cancel actions are rendered fully in the language of the active route

