## 1. Data Model And Constraints

- [x] 1.1 Audit existing Postgres schema for events, users, bookings, waitlist, credit ledger, redemption fields, and admin actor metadata.
- [x] 1.2 Add or update migrations for booking redemption payload fields, waitlist entries, credit ledger entries, and booking idempotency records.
- [x] 1.3 Add uniqueness constraints for user-scoped booking idempotency keys and duplicate waitlist prevention.
- [x] 1.4 Add database indexes needed by booking lookup, idempotent retry lookup, member booking lists, admin booking lists, and ledger history.

## 2. Transaction Services

- [x] 2.1 Implement a shared member booking transaction helper that locks event and member rows before validating mutable state.
- [x] 2.2 Validate active subscription, event availability, ticket quantity from 1 to 3, capacity, credit balance, and redemption configuration before committing mutations.
- [x] 2.3 Implement guarded capacity decrement, credit balance debit, confirmed booking insert, debit ledger insert, redemption persistence, and idempotency result persistence in one transaction.
- [x] 2.4 Implement idempotent retry handling that returns the existing booking result for matching request parameters and rejects mismatched parameter reuse.
- [x] 2.5 Implement redemption resolution for manual secret codes, shared generated codes, unique per-booking codes, and voucher promo codes with optional event website URL.
- [x] 2.6 Implement explicit waitlist join logic that creates or returns a waitlist entry without debiting credits or decrementing capacity.
- [x] 2.7 Implement admin ticket creation with authorization, actor metadata, redemption resolution, configured credit/capacity effects, and ledger writes.
- [x] 2.8 Implement admin credit adjustment with authorization, required reason, balance validation, actor metadata, and ledger write.

## 3. Actions And Result Mapping

- [x] 3.1 Add Astro Actions/API handlers for member booking, waitlist join, admin ticket creation, and admin credit adjustment.
- [x] 3.2 Map domain failures to stable typed states for sold out, insufficient credits, inactive subscription, duplicate idempotency key conflict, invalid event, invalid quantity, unsupported redemption setup, unauthorized, and invalid adjustment.
- [x] 3.3 Ensure booking action responses include confirmed booking, redemption, ticket quantity, total credits spent, waitlist, and retry-safe idempotency result data required by display models.

## 4. Display Data And Pages

- [x] 4.1 Update booking and ticket display view models to include waitlist fields, booking failure fields, credit ledger fields, and expanded redemption success fields.
- [x] 4.2 Wire the booking modal to submit transactional booking requests with an idempotency key and render confirmed booking, waitlist, and typed failure outcomes.
- [x] 4.3 Wire admin pages to submit admin ticket and credit adjustment actions and render success or typed failure outcomes.
- [x] 4.4 Verify booking lists, success panels, admin member history, partner guest rows, and exports still receive required booking and ledger display fields.

## 5. Tests And Verification

- [x] 5.1 Add transaction tests for successful booking, rollback on validation failure, insufficient credits, inactive subscription, invalid quantity, invalid event, and unsupported redemption setup.
- [x] 5.2 Add idempotency tests for matching retry behavior and mismatched parameter conflict behavior.
- [x] 5.3 Add concurrency tests proving final-capacity races cannot oversell and rejected concurrent requests do not debit credits or write ledger entries.
- [x] 5.4 Add waitlist tests proving waitlist creation does not change credits, capacity, bookings, or debit ledger entries.
- [x] 5.5 Add admin ticket and admin credit adjustment tests for authorization, actor metadata, ledger behavior, and invalid input rejection.
- [x] 5.6 Run the relevant unit, integration, and type-check commands and fix regressions before marking the change apply-ready.
