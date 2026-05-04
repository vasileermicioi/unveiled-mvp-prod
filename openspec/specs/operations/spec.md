## Purpose

Define authorized server operations for admin event/partner/member workflows, partner portal access, and check-in behavior.

## Requirements

### Requirement: Admin Event Management Operations
Admins SHALL manage events through authorized server operations backed by Drizzle/Postgres.

#### Scenario: Event is created
- **WHEN** an authorized admin submits a valid event creation request
- **THEN** the app validates required event and redemption fields, derives weekday and start-time fields, persists the event, and returns a typed success result.

#### Scenario: Event is updated
- **WHEN** an authorized admin submits valid updates for an existing event
- **THEN** the app persists the changes and preserves remaining-capacity semantics based on already-booked tickets.

#### Scenario: Event deletion is authorized
- **WHEN** an authorized admin deletes an event
- **THEN** the app removes or deactivates the event according to the target data model and refreshes affected admin and discovery views.

#### Scenario: Event mutation is rejected for non-admin viewer
- **WHEN** a guest, member, or partner submits an event mutation
- **THEN** the app rejects the operation with a safe authorization failure and does not change event data.

### Requirement: Admin Event Series Operations
Admins SHALL generate event series from submitted slots in one authorized operation.

#### Scenario: Event series is created
- **WHEN** an authorized admin submits multiple valid event slots
- **THEN** the app creates one event per slot in a single operation and returns the created event count.

#### Scenario: Empty event series is rejected
- **WHEN** an authorized admin submits an event-series request with no valid slots
- **THEN** the app rejects the request with a validation error and creates no events.

### Requirement: Admin Partner Management Operations
Admins SHALL manage partner records and partner venue check-in tokens through authorized server operations.

#### Scenario: Partner is created
- **WHEN** an authorized admin submits a valid partner creation request
- **THEN** venue details, contact email, logo URL, check-in token state, and portal linkage fields are persisted.

#### Scenario: Partner is updated
- **WHEN** an authorized admin submits valid updates for a partner
- **THEN** venue details, contact email, logo URL, check-in token state, and portal linkage fields are updated without breaking related event display data.

#### Scenario: Partner check-in token is generated or rotated
- **WHEN** an authorized admin requests a venue check-in token for a partner
- **THEN** the app stores a new unique token for that partner and returns the venue QR/check-in URL data needed by the UI.

#### Scenario: Partner is deleted
- **WHEN** an authorized admin deletes a partner
- **THEN** the app enforces relational constraints for linked events, bookings, and portal users before completing the deletion.

### Requirement: Partner Portal Access Operations
Admins SHALL provision partner portal access through Better Auth identity and domain profile linkage.

#### Scenario: Partner portal user is created or linked
- **WHEN** an authorized admin provisions portal access for a partner contact email
- **THEN** the app creates or links the Better Auth user, assigns partner role/profile data, associates the user with the partner, and returns portal login display data.

#### Scenario: Portal access cannot be provisioned by non-admin viewer
- **WHEN** a guest, member, or partner submits a portal access provisioning request
- **THEN** the app rejects the operation with a safe authorization failure and does not change user or partner ownership data.

### Requirement: Partner And Admin Manual Check-In
Partners and admins SHALL check in eligible bookings through authorized server operations.

#### Scenario: Partner checks in own guest
- **WHEN** a partner checks in a confirmed booking for their own venue inside the allowed window
- **THEN** the booking status changes to `USED`, `checkedInAt` is recorded, and the partner guest list refreshes.

#### Scenario: Admin checks in a guest
- **WHEN** an admin checks in a confirmed booking inside the allowed window
- **THEN** the booking status changes to `USED`, `checkedInAt` is recorded, and affected admin or partner views refresh.

#### Scenario: Partner cannot check in another venue booking
- **WHEN** a partner attempts to check in a booking for a different partner venue
- **THEN** the app rejects the operation with a safe authorization failure and does not change the booking.

#### Scenario: Check-in outside window is rejected
- **WHEN** a manual check-in is submitted more than 24 hours after event start or more than 18 hours before event start
- **THEN** the app rejects the operation and leaves the booking status unchanged.

### Requirement: Member Venue QR Check-In
Members SHALL check in by submitting a valid partner venue token when they have an eligible booking.

#### Scenario: Member scans valid venue QR
- **WHEN** a member submits a valid partner token and has an eligible confirmed booking for that partner inside the check-in window
- **THEN** the closest eligible booking is marked `USED` and `checkedInAt` is recorded.

#### Scenario: Member has no eligible booking
- **WHEN** a member submits a valid partner token but has no confirmed booking for that partner inside the check-in window
- **THEN** the app returns a safe no-eligible-booking result and does not change bookings.

#### Scenario: Invalid venue token is rejected
- **WHEN** a member submits an unknown or inactive partner token
- **THEN** the app rejects the check-in without exposing protected partner or booking details.

### Requirement: Admin Member Operations
Admins SHALL list members, freeze or unfreeze subscription status, and adjust credits through auditable operations.

#### Scenario: Admin lists users
- **WHEN** an authorized admin requests member data
- **THEN** the app returns member rows with role, subscription status, credits, booking counts, event-open counts, and expanded history data required by the admin UI.

#### Scenario: Admin freezes or unfreezes subscription
- **WHEN** an authorized admin toggles a member subscription freeze state
- **THEN** the app persists the new status and returns updated member display data.

#### Scenario: Admin adjusts member credits
- **WHEN** an authorized admin submits a credit adjustment with a valid amount and reason
- **THEN** the app updates the member credit balance and creates a credit ledger entry with actor and reason data.

#### Scenario: Member operation is rejected for non-admin viewer
- **WHEN** a guest, member, or partner submits a member administration operation
- **THEN** the app rejects the operation with a safe authorization failure and does not change member or ledger data.
