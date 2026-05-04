## Context

The legacy Firebase backend centralizes booking in `bookEventAtomic`, with related behavior in `_old_app/store.ts` for bookings, waitlist joins, admin tickets, credit adjustments, and ledger writes. The target app stores domain data in Postgres and exposes Astro Actions/API handlers, so booking behavior must move from Firestore-style document transactions to relational transactions with explicit constraints.

The critical invariant is that capacity, credits, booking rows, redemption data, and ledger entries commit together or not at all. The implementation also needs to preserve legacy user-visible redemption behavior for password-style and voucher events while giving pages deterministic error states for rejected attempts.

## Goals / Non-Goals

**Goals:**

- Implement member booking as one Postgres transaction that covers validation, capacity update, credit debit, booking insert, ledger insert, idempotency, and redemption data.
- Support explicit waitlist joins and sold-out waitlist outcomes without mutating booking capacity or debiting credits.
- Support admin-created tickets and admin credit adjustments with auditable ledger entries.
- Define stable action/API result states that UI code can render consistently.
- Add tests that exercise idempotency, rollback, insufficient credits, sold-out races, and concurrency.

**Non-Goals:**

- Payment subscription refill automation.
- Partner check-in behavior.
- Email delivery or background notification jobs.
- UI redesign beyond wiring existing pages to the new outcomes.

## Decisions

### Use explicit row locking inside a database transaction

The booking path will run inside one Postgres transaction and lock the member/account row and event row before validating mutable state. Capacity will be decremented with a guarded update or equivalent locked-row mutation so two concurrent bookings cannot oversell the event.

Alternative considered: rely only on serializable isolation and retry serialization failures. Serializable isolation is valid, but explicit row locking makes the capacity and credit invariants easier to reason about and test. The implementation can still use serializable isolation if the local database helper already supports it cleanly.

### Store idempotency with a user-scoped unique key

Member booking requests will require an idempotency key and enforce uniqueness for `(user_id, idempotency_key)`. The idempotency record will point to the created booking and enough result metadata to reconstruct the booking success response. A retry with the same user and key returns the existing result without debiting credits or capacity again.

Alternative considered: unique key on booking rows only. A separate idempotency record is more flexible for detecting in-progress or conflicting requests and avoids overloading booking identity with transport retry concerns.

### Keep credit changes append-only through ledger entries

Credit debits and admin adjustments will update the current credit balance and insert a ledger entry in the same transaction. Ledger rows will include direction, amount, reason/source, related booking/event when applicable, and actor metadata for admin changes.

Alternative considered: derive balance only from ledger. That improves audit purity, but existing UI and admin flows need fast current credit counts; maintaining both balance and ledger is acceptable when updates are transactionally coupled.

### Resolve redemption during booking creation

The transaction will resolve and persist the redemption payload on the booking row. Secret-code events support manual, shared-generated, and unique-per-booking modes. Voucher events store the promo code and optional event website URL. Unsupported or incomplete redemption setup rejects the booking before mutation commits.

Alternative considered: derive redemption at read time from event configuration. Persisting the resolved booking payload preserves the exact code shown at booking time and avoids changes to event configuration altering existing tickets.

### Treat waitlist as a separate outcome from confirmed booking

Waitlist joins will create a waitlist entry without debiting credits or decrementing capacity. Explicit waitlist flow and sold-out booking attempts can both return a waitlist result when the user chooses that path or the UI offers it.

Alternative considered: automatically convert every sold-out booking attempt into a waitlist entry. Keeping this as a distinct outcome avoids surprising users who expected a confirmed booking.

## Risks / Trade-offs

- Concurrent requests can still expose race conditions if any mutation happens outside the transaction -> keep all mutable booking state changes inside one transaction and add concurrency tests.
- Idempotency records can conflict when a client reuses a key for different request parameters -> store a request fingerprint and return a conflict instead of an existing booking for mismatched parameters.
- Redemption configuration may be incomplete in migrated event data -> reject with an explicit unsupported redemption setup state and add admin validation for future event creation.
- Locking event and user rows can reduce throughput on high-demand events -> keep the transaction short and avoid external calls inside it.
- Maintaining both credit balance and ledger can drift if future code bypasses the transaction helper -> centralize credit mutations behind shared server-side functions and test ledger/balance consistency.

## Migration Plan

1. Add or verify relational tables/columns and constraints for bookings, waitlist entries, credit ledger entries, idempotency keys, and persisted redemption fields.
2. Implement shared server-side transaction helpers for member booking, waitlist joins, admin tickets, and admin credit adjustments.
3. Wire Astro Actions/API handlers to the helpers and map domain failures to stable result states.
4. Update display data derivation and pages to render confirmed booking, waitlist, redemption, and rejection outcomes.
5. Add transaction and concurrency tests before enabling the new flow broadly.
6. Roll back by disabling the new Actions/API routes or gating the UI submission path; schema additions are additive and can remain unused during rollback.

## Open Questions

- Should sold-out booking attempts create waitlist entries automatically, or only after an explicit user confirmation in the flow?
- Which existing database helper should own transaction isolation configuration if both explicit locks and serializable transactions are available?
- Should admin-created tickets consume capacity by default, or allow an override for comped/manual tickets that exceed public capacity?
