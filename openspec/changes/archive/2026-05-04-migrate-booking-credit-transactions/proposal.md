## Why

The legacy Firebase app relies on `bookEventAtomic` for the core member booking path: subscription and credit checks, capacity mutation, booking creation, redemption data, and credit ledger writes all happen atomically. The Astro/Postgres app needs an equivalent transaction so booking, credits, and capacity cannot drift under retries or concurrent demand.

## What Changes

- Add a Postgres-backed member booking transaction that validates active subscription state, event state, ticket quantity, capacity, and credit balance before committing any mutation.
- Enforce idempotent booking retries with a user-scoped idempotency key so retried requests return the existing booking result without double-debiting credits or capacity.
- Debit credits, decrement event capacity, create confirmed bookings, and create credit ledger entries in one database transaction.
- Preserve legacy redemption behavior for secret-code and voucher events, including manual/shared/unique secret code modes and voucher promo code plus optional event website data.
- Add waitlist creation for explicit waitlist joins and sold-out booking flow outcomes.
- Add admin ticket creation and admin credit adjustment flows with corresponding ledger entries.
- Define user-facing and API-level conflict states for sold out, insufficient credits, inactive subscription, duplicate idempotency key conflicts, invalid event state, invalid quantity, and unsupported redemption setup.
- Add concurrency and idempotency test coverage for the transactional booking path.

## Capabilities

### New Capabilities

- `booking-transactions`: Atomic booking, waitlist, admin ticket, credit adjustment, idempotency, redemption resolution, and credit ledger behavior.

### Modified Capabilities

- `display-data`: Booking results and event/member data SHALL expose redemption, waitlist, credit, and capacity state needed by the booking flows.
- `pages`: Member and admin pages SHALL submit booking, waitlist, ticket, and credit adjustment flows through the new transactional backend behavior and render the defined outcomes.

## Impact

- Database schema for bookings, waitlist entries, credit ledger entries, idempotency, redemption fields, and any required uniqueness constraints.
- Server-side Astro Actions/API handlers for member booking, waitlist joins, admin tickets, and admin credit adjustments.
- Existing event detail, booking success, member account, and admin management pages that read or submit booking and credit data.
- Tests for transaction rollback, row locking or serializable isolation behavior, idempotent retries, capacity races, and credit ledger integrity.
