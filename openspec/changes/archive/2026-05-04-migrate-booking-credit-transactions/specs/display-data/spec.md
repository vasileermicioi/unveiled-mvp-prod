## MODIFIED Requirements

### Requirement: Booking And Ticket Display Fields
This requirement SHALL use legacy reference path: `_old_app/components/BookingsView.tsx`, `_old_app/components/BookingModal.tsx`, `_old_app/components/PartnerPortal.tsx`.

Booking UI SHALL receive fields required for ticket cards, redemption panels, guest lists, check-in labels, exports, waitlist outcomes, booking failure states, and credit ledger display.

#### Scenario: Booking card fields are available
- **WHEN** user booking card renders
- **THEN** required fields are event image, event title, formatted event date, event address, ticket count, redemption code, booking status, optional checked-in timestamp, and copy state

#### Scenario: Redemption fields are available
- **WHEN** booking success state renders
- **THEN** required fields are redemption type, redemption code, optional redemption URL, copied state, calendar action label, support email, return-to-feed label, booking ID, ticket quantity, and total credits spent

#### Scenario: Waitlist fields are available
- **WHEN** waitlist success or waitlist card state renders
- **THEN** required fields are event title, formatted event date, event address, waitlist status, created date, support email when shown, and return-to-feed label

#### Scenario: Booking failure fields are available
- **WHEN** a booking action returns a typed failure state
- **THEN** required fields are failure state, localized message, optional retry availability, optional waitlist availability, optional membership CTA, optional credit balance, and optional required credit total

#### Scenario: Credit ledger fields are available
- **WHEN** member credit history or admin member history renders
- **THEN** required fields are ledger entry ID, amount, direction, reason/source label, related event or booking label when applicable, actor label when applicable, created date, and resulting balance when available

#### Scenario: Partner guest fields are available
- **WHEN** partner guest row renders
- **THEN** required fields are booking ID or guest short ID, user short ID, event title, redemption code, booking status, ticket count, created date for export, checked-in timestamp, and check-in availability label

#### Scenario: Booking export columns are available
- **WHEN** booking or code CSV export is visible
- **THEN** visible/export columns include Booking ID, User ID, Partner or Event, Code when applicable, Status, Tickets, Credits when applicable, Date or Created At
