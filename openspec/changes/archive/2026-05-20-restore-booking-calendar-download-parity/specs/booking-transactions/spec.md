## ADDED Requirements

### Requirement: Booking Success Calendar Metadata
Booking transaction results SHALL preserve enough booked event identity for the member UI to pair a confirmed booking with calendar metadata without changing redemption semantics.

#### Scenario: Confirmed booking result can be paired with event metadata
- **WHEN** an active member successfully books an event with valid date and venue metadata
- **THEN** the confirmed booking result identifies the booked event and booking outcome so the UI can render a calendar download for that event
- **AND** the result still returns the current booking redemption data for the confirmed booking only

#### Scenario: Failed booking does not leak calendar or redemption data
- **WHEN** a booking attempt is rejected after a prior successful booking attempt in the same UI session
- **THEN** the failure result does not include redemption code, voucher URL, or calendar download payload from the prior attempt

#### Scenario: Waitlist success does not masquerade as booking calendar success
- **WHEN** a member joins a waitlist instead of receiving a confirmed booking
- **THEN** the waitlist result does not require a calendar download payload and does not include stale confirmed-booking redemption data
