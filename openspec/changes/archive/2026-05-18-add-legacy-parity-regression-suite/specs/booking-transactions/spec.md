## ADDED Requirements

### Requirement: Booking Flow Regression Coverage
The app SHALL have automated regression coverage for booking and waitlist flows as they surface through seeded product behavior.

#### Scenario: Member booking parity is covered
- **WHEN** a seeded active member books an eligible event under the parity suite
- **THEN** the suite verifies booking status, capacity change, credit balance, ledger rows, redemption outcome, and member-surface invalidation expectations.

#### Scenario: Sold-out and waitlist parity is covered
- **WHEN** a seeded sold-out event is exercised through the waitlist-capable flow
- **THEN** the suite verifies the waitlist outcome, the absence of credit or capacity mutation, and the visible member waitlist state.

#### Scenario: Redemption-mode parity is covered
- **WHEN** seeded voucher and secret-code events are booked through covered flows
- **THEN** the suite verifies the resulting visible redemption data matches the configured redemption mode without leaking stale data from prior attempts.
