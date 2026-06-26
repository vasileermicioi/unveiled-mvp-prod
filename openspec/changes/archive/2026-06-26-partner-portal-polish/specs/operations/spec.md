## MODIFIED Requirements

### Requirement: Partner Portal Live Operations UI

The partner portal SHALL render and mutate only the authenticated partner's venue operation data. The partner guest list SHALL be paginated end-to-end and SHALL block re-check-in for already-used bookings. Check-in failures SHALL surface as per-row banners, and already-used bookings SHALL not be re-checked-in from the UI.

#### Scenario: Partner portal renders live venue data

- **WHEN** a partner opens `/partner`
- **THEN** the portal displays their partner details, venue QR path or missing-token state, event options, guest rows, export controls, and check-in controls from authorized server data.

#### Scenario: Partner guest list is paginated

- **WHEN** a partner opens `/partner` against an authorized partner venue with more than `pageSize` confirmed bookings
- **THEN** the guest list renders the first page of `pageSize` rows (default `pageSize = 20`) and a `<Pagination />` control appears below the list
- **AND** clicking "Next page" issues a refetch with `?partnerGuestsPage=<next>&partnerGuestsPageSize=<active-size>`
- **AND** changing the page-size dropdown resets `partnerGuestsPage` to `1` and refetches with the new `partnerGuestsPageSize`.

#### Scenario: Already-used row renders an "Already used" badge and disables the check-in button

- **WHEN** the partner guest list renders a row whose booking status is `USED`
- **THEN** the row renders an "Already used" `<Badge tone="dark">` next to the guest name
- **AND** the row's "Check in" button is rendered in a disabled state.

#### Scenario: Partner checks in eligible guest row

- **WHEN** the partner checks in an eligible confirmed booking for their own venue
- **THEN** the booking row status changes to `USED`, the checked-in timestamp renders, and the partner guest list refreshes.

#### Scenario: Already-used booking cannot be re-checked-in

- **WHEN** a partner attempts to check in a booking whose status is already `USED`
- **THEN** the operation rejects the request and no row state changes
- **AND** the row's "Check in" button is rendered disabled so the action cannot be re-triggered from the UI.

#### Scenario: Check-in failure surfaces as a per-row ShellStatusBanner

- **WHEN** a check-in mutation fails for a row because the booking is already used, the partner does not own the event, or the booking is in `CANCELLED_PENDING`
- **THEN** the affected row renders a `<ShellStatusBanner type="error">` keyed by the row's `bookingId` above the row content
- **AND** other rows continue to render normally
- **AND** the banner is dismissed on the next successful refetch of the partner guest list.

#### Scenario: Partner exports scoped guest rows

- **WHEN** the partner requests a guest or code export
- **THEN** only export rows for that partner venue are returned.