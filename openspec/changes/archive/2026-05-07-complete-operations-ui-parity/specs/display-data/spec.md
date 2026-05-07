## ADDED Requirements

### Requirement: Operational UI Live Row Display Data
Operational admin and partner display models SHALL include every live row field and action state needed by the connected UI.

#### Scenario: Partner portal live display data is available
- **WHEN** `/partner` renders or refetches
- **THEN** display data includes partner name, partner address, venue QR URL or missing-token text, token status, event options, guest booking rows, booking codes, ticket counts, booking statuses, event titles, check-in availability labels, export availability, and checked-in timestamps.

#### Scenario: Admin dashboard live display data is available
- **WHEN** `/admin` dashboard renders or refetches
- **THEN** display data includes total bookings, credits burned, active partners, total guests, recent booking rows, export partner options, and booking/code export state.

#### Scenario: Admin event live display data is available
- **WHEN** `/admin` events tab renders or refetches
- **THEN** display data includes event rows, partner host labels, date/time labels, code strategy, ticket availability, credit price, image/preview fields, export state, edit state, delete state, and event/series form option lists.

#### Scenario: Admin partner live display data is available
- **WHEN** `/admin` partners tab renders or refetches
- **THEN** display data includes partner rows, logo or initial, name, address, contact email, QR token state, venue QR URL, portal login state, row action availability, and partner form field values.

#### Scenario: Admin member live display data is available
- **WHEN** `/admin` members tab renders or refetches
- **THEN** display data includes member rows with role, subscription status, credits, booking count, event-open count, saved count, waitlist count, provider fields where available, freeze/unfreeze availability, credit adjustment state, and expanded history summaries.

### Requirement: Operational Mutation Result Display Data Refreshes Rows
Operational action result display data SHALL be sufficient for the UI to clear stale success state and refresh affected visible rows.

#### Scenario: Successful operational action returns refresh metadata
- **WHEN** an admin or partner operation succeeds
- **THEN** display data includes safe success text, affected entity identifiers, and invalidation hints for every visible operational, public, member, or partner row set affected by the mutation.

#### Scenario: Failed operational action returns safe visible state
- **WHEN** validation, conflict, ownership, authorization, or check-in-window rules reject an operation
- **THEN** display data includes safe form-level or row-level error text, field errors where applicable, and no stale success notice.

#### Scenario: Operational export rows are scoped
- **WHEN** partner or admin export data is requested
- **THEN** display data includes only authorized export rows and the columns visible in the corresponding operational export control.
