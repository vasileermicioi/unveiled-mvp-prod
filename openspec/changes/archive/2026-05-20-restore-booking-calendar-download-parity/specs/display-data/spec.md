## ADDED Requirements

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
