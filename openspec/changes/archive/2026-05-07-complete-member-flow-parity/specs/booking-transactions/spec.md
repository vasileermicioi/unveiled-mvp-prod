## ADDED Requirements

### Requirement: Member Modal Booking Outcomes
Booking transactions SHALL return member-facing outcome data that supports booking success, booking failure, and waitlist success states without leaking stale redemption data.

#### Scenario: Member booking succeeds
- **WHEN** an active member books an event with valid quantity, available capacity, sufficient credits, valid event state, and valid redemption setup
- **THEN** the transaction returns success with ticket count, total credits, redemption code or voucher data, and updated wallet data

#### Scenario: Member booking is rejected
- **WHEN** membership, credits, capacity, quantity, event state, idempotency, or redemption setup prevents booking
- **THEN** the transaction returns a safe failure result
- **AND** the result does not include redemption data from a prior or failed booking attempt

#### Scenario: Member joins waitlist
- **WHEN** a member joins a waitlist for an eligible event
- **THEN** the transaction returns waitlist success
- **AND** no credits are debited
