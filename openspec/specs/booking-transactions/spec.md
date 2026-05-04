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

