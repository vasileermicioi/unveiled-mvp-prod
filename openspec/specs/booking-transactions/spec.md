# booking-transactions Specification

## Purpose
TBD - created by archiving change migrate-booking-credit-transactions. Update Purpose after archive.
## Requirements
### Requirement: Atomic Member Booking
The app SHALL create confirmed member bookings, debit credits, decrement event capacity, resolve redemption data, and write credit ledger entries using a single Postgres transaction.

#### Scenario: Booking succeeds
- **WHEN** an active member books a valid event with ticket quantity from 1 to 3, available capacity, sufficient credits, and supported redemption setup
- **THEN** the app decrements event capacity by the ticket quantity, decrements user credits by the total credit cost, creates a confirmed booking, creates a debit ledger entry, persists redemption data on the booking, and returns the confirmed booking result atomically

#### Scenario: Booking is rejected
- **WHEN** subscription state, event state, ticket quantity, capacity, credit balance, or redemption setup is invalid
- **THEN** no booking row, capacity mutation, credit mutation, or ledger entry is committed

#### Scenario: Concurrent booking preserves capacity
- **WHEN** concurrent booking requests compete for the final available event capacity
- **THEN** no more confirmed tickets are created than the event capacity permits
- **AND** rejected requests do not debit credits or write debit ledger entries

### Requirement: Booking Idempotency
The app SHALL enforce user-scoped idempotency for member booking attempts.

#### Scenario: Idempotent retry returns existing booking
- **WHEN** the same user retries a booking request with the same idempotency key and matching request parameters
- **THEN** the app returns the existing booking result without creating another booking, decrementing capacity again, debiting credits again, or writing another debit ledger entry

#### Scenario: Idempotency key conflicts
- **WHEN** the same user reuses an idempotency key with different event, ticket quantity, or request parameters
- **THEN** the app rejects the request with a duplicate idempotency key conflict
- **AND** no booking, capacity, credit, or ledger mutation is committed

### Requirement: Redemption Code Resolution
The app SHALL preserve legacy redemption behavior for secret-code and voucher events by resolving booking redemption data before committing a confirmed booking.

#### Scenario: Secret code event books
- **WHEN** a member books a secret-code event configured with manual, shared-generated, or unique-per-booking code mode
- **THEN** the booking stores and returns the appropriate password or code for that mode

#### Scenario: Voucher event books
- **WHEN** a member books a voucher event with promo code redemption
- **THEN** the booking stores and returns the promo code and optional event website URL for the success panel

#### Scenario: Unsupported redemption setup rejects booking
- **WHEN** an event requires redemption data that cannot be resolved from its configuration
- **THEN** the booking request is rejected with an unsupported redemption setup state
- **AND** no booking, capacity, credit, or ledger mutation is committed

### Requirement: Waitlist Creation
The app SHALL create waitlist entries without debiting credits or decrementing event capacity.

#### Scenario: Member joins waitlist explicitly
- **WHEN** an eligible member joins the waitlist for a valid event
- **THEN** the app creates or returns the member's waitlist entry for that event without changing credits, capacity, bookings, or debit ledger entries

#### Scenario: Sold out booking can return waitlist outcome
- **WHEN** a booking flow cannot confirm because event capacity is unavailable and the flow selects a waitlist outcome
- **THEN** the app creates or returns a waitlist entry and returns a waitlist success state

### Requirement: Admin Ticket Creation
The app SHALL allow authorized admins to create tickets for members with auditable booking and ledger behavior.

#### Scenario: Admin creates ticket
- **WHEN** an authorized admin creates a ticket for a member and event with valid quantity and supported redemption setup
- **THEN** the app creates a confirmed booking with admin actor metadata, resolves redemption data, applies the configured credit and capacity effects, and writes any required ledger entry atomically

#### Scenario: Unauthorized admin ticket request is rejected
- **WHEN** a non-admin attempts to create an admin ticket
- **THEN** the app rejects the request and commits no booking, capacity, credit, or ledger mutation

### Requirement: Admin Credit Adjustments
The app SHALL allow authorized admins to adjust member credit balances with ledger entries.

#### Scenario: Admin adjusts credits
- **WHEN** an authorized admin applies a positive or negative credit adjustment to a member with a reason
- **THEN** the app updates the member credit balance and writes a ledger entry with amount, reason, and admin actor metadata atomically

#### Scenario: Invalid credit adjustment is rejected
- **WHEN** the adjustment is unauthorized, has no reason, or would create an invalid balance
- **THEN** the app rejects the adjustment and commits no credit balance or ledger mutation

### Requirement: Booking Error States
The app SHALL return stable booking result states for expected conflicts and validation failures.

#### Scenario: Expected booking failure returns typed state
- **WHEN** booking fails because the event is sold out, credits are insufficient, subscription is inactive, idempotency conflicts, event is invalid, quantity is invalid, or redemption setup is unsupported
- **THEN** the app returns the corresponding typed failure state for the UI to render
- **AND** no partial mutation is committed

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

### Requirement: Booking Transaction Verification Environment
The app SHALL provide a documented and repeatable environment for booking transaction integration tests.

#### Scenario: Transaction test database is configured
- **WHEN** `BOOKING_TRANSACTION_TEST_DATABASE_URL` is set to a migrated dedicated Postgres database
- **THEN** booking transaction integration tests run instead of skipping and verify booking, waitlist, admin ticket, credit ledger, and concurrency outcomes.

#### Scenario: Transaction test database is missing
- **WHEN** the transaction test command runs without a configured database
- **THEN** the command reports the missing configuration clearly rather than silently implying full coverage.

#### Scenario: Transaction tests are rerun
- **WHEN** the transaction integration tests are executed repeatedly
- **THEN** seeded rows are cleaned safely without foreign-key conflicts or cross-test data leakage.

