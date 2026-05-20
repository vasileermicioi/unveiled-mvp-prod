## Purpose
Define the display-model fields and safe UI state derived from live product data.
## Requirements
### Requirement: Discovery Map Display Data
The app SHALL provide discovery map display data for event markers, selection state, and map fallback states.

#### Scenario: Marker display data is available
- **WHEN** discovery renders events with map coordinates
- **THEN** display data includes event id, title, date label, venue label, address or derived location label, latitude, longitude, and marker label text

#### Scenario: Marker selection display data is available
- **WHEN** a marker is selected
- **THEN** display data includes selected marker state, selected event title, date, venue, and the action target to open event details or booking modal

#### Scenario: Missing coordinates degrade safely
- **WHEN** an event lacks usable coordinates
- **THEN** display data omits the marker and preserves the event list card and label text without breaking the map surface

#### Scenario: Map fallback display data is available
- **WHEN** map provider configuration is missing or loading fails
- **THEN** display data includes loading, error, or fallback state text and a safe retry or dismiss action where applicable

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

### Requirement: Production UI Data Source Coverage
The app SHALL verify through automated regression coverage that production product routes render seeded live data rather than demo-only fixtures.

#### Scenario: Seeded discovery event renders visible fields
- **WHEN** discovery or member discovery renders a seeded event
- **THEN** the event title, partner label, date label, capacity label, and primary CTA are visible from seeded display data.

#### Scenario: Demo-only rows are absent on production routes
- **WHEN** a production route renders under the parity suite
- **THEN** known demo-only fixture names or labels are not visible unless the same values were intentionally inserted by the seeded dataset.

#### Scenario: Operational seeded rows render visible state
- **WHEN** partner, admin, bookings, saved, or profile surfaces render from seeded data
- **THEN** the visible row fields and empty or success states match the seeded role, booking, waitlist, and redemption scenarios under test.

### Requirement: Event Calendar Display Data
Event and booking display models SHALL expose calendar metadata for events with usable date and venue data.

#### Scenario: Event card calendar metadata is available
- **WHEN** discovery or member discovery display data includes an event with a valid start date, title, description, partner label, and address
- **THEN** the event display model includes calendar metadata with event id, title, description, partner name, address, and start date-time suitable for `.ics` generation

#### Scenario: Booking card calendar metadata is available
- **WHEN** a member bookings surface renders a confirmed booking for an event with valid date and venue metadata
- **THEN** the booking display model includes calendar metadata for the booked event without deriving the date from a formatted label

#### Scenario: Calendar metadata is omitted safely
- **WHEN** an event lacks usable calendar date metadata
- **THEN** the display model omits or marks calendar metadata unavailable while preserving existing event, booking, and redemption display fields

#### Scenario: Redemption display remains current
- **WHEN** secret-code and voucher booking success states are built from display data
- **THEN** calendar metadata is independent from redemption code and URL fields so stale redemption data is not reused across outcomes

### Requirement: Admin Asset Upload Display Data
Admin event and partner display models SHALL expose the asset state needed to render upload controls, previews, and manual URL fallbacks.

#### Scenario: Event form displays current image state
- **WHEN** the admin event form renders for a new or existing event
- **THEN** display data includes the current image URL value, preview availability, upload control state, and manual URL fallback value

#### Scenario: Partner form displays current logo state
- **WHEN** the admin partner form renders for a new or existing partner
- **THEN** display data includes the current logo URL value, preview availability, upload control state, and manual URL fallback value

#### Scenario: Upload unavailable state is visible
- **WHEN** asset upload configuration or runtime support is unavailable
- **THEN** display data allows the UI to show a safe upload-unavailable state while keeping manual URL input available

#### Scenario: Uploaded preview updates without stale rows
- **WHEN** an upload succeeds and returns a display URL
- **THEN** the form preview and URL value update to the new uploaded asset without changing unrelated admin row data before save

#### Scenario: Failed upload displays safe error
- **WHEN** an upload fails validation, authorization, configuration, or storage
- **THEN** display data includes safe visible error text without exposing provider secrets, storage keys beyond returned public URLs, or stack traces

