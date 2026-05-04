## 1. Configuration And Schema

- [x] 1.1 Add Stripe configuration for secret key, publishable key, webhook secret, `BASIC_BERLIN` price ID, enabled payment methods, support email, and checkout return URLs.
- [x] 1.2 Add Postgres tables and indexes for subscriptions, provider events, payment methods, billing addresses, and billing admin overrides.
- [x] 1.3 Extend credit ledger metadata to store provider, invoice ID, subscription ID, payment event ID, refill idempotency key, and admin actor fields.
- [x] 1.4 Add migration tests or schema assertions for unique provider event IDs and unique refill idempotency keys.

## 2. Stripe Integration

- [x] 2.1 Add server-side Stripe client initialization with environment validation.
- [x] 2.2 Implement checkout initialization for `BASIC_BERLIN` subscriptions using the configured Stripe recurring price and optional promo code.
- [x] 2.3 Return client-safe Stripe initialization data for Express Checkout, PayPal, card, and SEPA Direct Debit Elements.
- [x] 2.4 Store or update Stripe customer, subscription, payment method, and billing address display data after checkout and webhook sync.

## 3. Webhook Processing

- [x] 3.1 Implement the Stripe webhook endpoint with raw-body signature verification.
- [x] 3.2 Persist provider event receipts keyed by provider and event ID before supported event processing.
- [x] 3.3 Handle paid invoice events by activating eligible subscriptions and applying idempotent monthly credit refills in a transaction.
- [x] 3.4 Handle failed, action-required, unpaid, canceled, incomplete, and deleted subscription states by freezing booking credit availability.
- [x] 3.5 Acknowledge unsupported verified Stripe events without mutating billing or credit state.
- [x] 3.6 Add tests for duplicate webhook replay, invalid signatures, paid invoice refill, failed payment freeze, and unsupported events.

## 4. Subscription And Credit Domain

- [x] 4.1 Implement local subscription state derivation from provider state and admin override state.
- [x] 4.2 Implement the no-rollover monthly refill calculation for the configured plan allowance.
- [x] 4.3 Ensure admin credit adjustments remain separate ledger entries with actor and reason metadata.
- [x] 4.4 Update booking eligibility checks to reject or disable booking for frozen, past-due, unpaid, canceled, incomplete, or admin-frozen members.
- [x] 4.5 Preserve read access to profile, bookings, billing status, and ledger history for frozen members.

## 5. UI And Display Data

- [x] 5.1 Add display view models for member billing fields, payment method display, frozen billing copy, and billing recovery actions.
- [x] 5.2 Add admin billing display fields for provider IDs, provider status, local status, last sync, period bounds, credit balance, and override actions.
- [x] 5.3 Update the membership page payment section to render express wallets first when available.
- [x] 5.4 Render PayPal as a separate highlighted Stripe option when available.
- [x] 5.5 Render card and SEPA Direct Debit in a lower standard payment method selector with no default selected method.
- [x] 5.6 Show Stripe, promo-code, and server validation messages near their related controls.
- [x] 5.7 Update frozen and active membership states without changing the existing visual page structure beyond required payment method presentation.

## 6. Admin Operations

- [x] 6.1 Implement authorized admin freeze and unfreeze actions with actor, reason, and timestamp metadata.
- [x] 6.2 Implement admin billing inspection for provider customer and subscription records.
- [x] 6.3 Ensure unauthorized billing override and credit adjustment attempts commit no mutations.

## 7. Verification

- [x] 7.1 Run unit and integration tests for schema, Stripe service helpers, webhook handlers, refill logic, booking eligibility, and admin overrides.
- [x] 7.2 Run UI tests for membership payment method ordering, no default method selection, frozen status, active status, and validation messages.
- [x] 7.3 Test Stripe test-mode flows for successful card payment, failed payment, required action, duplicate webhook replay, SEPA delayed outcome, and unavailable wallet methods.
- [x] 7.4 Run OpenSpec validation or status checks for `migrate-payments-subscriptions` and confirm the change remains apply-ready.

Deferred verification depth for 3.6, 7.1, 7.2, and 7.3 is tracked as technical debt in `docs/technical-debt/payments-subscriptions-verification.md`. Local verification completed for this implementation slice with `bun run check` and `bun test`; Stripe-account/manual verification remains a follow-up debt item rather than a blocker for archiving this OpenSpec change.
