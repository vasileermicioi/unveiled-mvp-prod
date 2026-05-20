## ADDED Requirements

### Requirement: Booking Success Calendar UI Parity
Member-facing booking success surfaces SHALL render the legacy-visible calendar download behavior for confirmed bookings with calendar metadata.

#### Scenario: Confirmed booking success renders save the date
- **WHEN** a member successfully books an event with valid date and venue metadata from the booking modal
- **THEN** the success state renders a visible "save the date" calendar affordance alongside the redemption outcome

#### Scenario: Voucher success keeps calendar separate
- **WHEN** a voucher event booking succeeds
- **THEN** the success state renders the voucher code and optional partner URL for the current booking
- **AND** the calendar affordance downloads event calendar data rather than voucher redemption data

#### Scenario: Secret-code success keeps calendar separate
- **WHEN** a secret-code event booking succeeds
- **THEN** the success state renders the secret code for the current booking
- **AND** the calendar affordance downloads event calendar data without changing or copying the secret code

#### Scenario: Waitlist success does not show stale calendar action
- **WHEN** a member reaches a waitlist success state after a previous confirmed booking attempt in the same modal lifecycle
- **THEN** the page does not show stale confirmed-booking redemption data or a stale calendar download for the prior booking

#### Scenario: Calendar action is covered by regression tests
- **WHEN** the seeded booking success flow is exercised by automated regression coverage
- **THEN** the suite asserts the visible calendar affordance or records unit-level coverage for calendar generation when browser download verification is not feasible
