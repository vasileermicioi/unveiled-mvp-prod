## Why

The old app has subscription, payment method, and credit refill concepts, but payment lifecycle behavior is simulated in local store methods instead of driven by a real provider. The new stack needs a durable subscription model, provider webhooks, idempotent credit refills, and clear frozen or past-due behavior before membership checkout can safely launch.

## What Changes

- Introduce Stripe-backed subscription management for the `BASIC_BERLIN` membership plan at `29 EUR` per month.
- Add provider event processing for subscription activation, renewal payment success, payment failure, unpaid or canceled states, and duplicate webhook delivery.
- Add an idempotent monthly credit refill policy tied to subscription billing events and visible member ledger entries.
- Add support for admin subscription overrides, including manual credit adjustments and freezing or unfreezing member booking access.
- Define checkout payment method presentation with express wallets first, PayPal as a separately highlighted option, and card plus SEPA Direct Debit in a lower standard payment section.
- Preserve member access to profile and existing bookings when credits are frozen because of billing state.
- Map billing address, payment method display, support copy, provider customer IDs, subscription IDs, and plan metadata into the new data model.

## Capabilities

### New Capabilities

- `payments-subscriptions`: Covers provider-backed membership subscription lifecycle, credit refills, payment method records, webhook idempotency, billing state, and admin billing overrides.

### Modified Capabilities

- `display-data`: Adds member-visible billing, payment method, credit ledger, and frozen or past-due display semantics.
- `pages`: Adds checkout payment method presentation and billing-state behavior requirements for member-facing pages.

## Impact

- Database schema for members, subscriptions, provider event receipts, payment methods, billing addresses, credit ledger metadata, and admin overrides.
- Server-side payment integration with Stripe APIs and webhook signature verification.
- Credit ledger behavior used by booking eligibility checks and member-visible balance history.
- Checkout and membership pages that present provider-backed payment methods and billing state.
- Admin operations that can freeze access, adjust credits, inspect billing state, and resolve provider-linked member records.
- Environment configuration for Stripe keys, webhook secrets, price IDs, enabled payment methods, support contact copy, and canonical return URLs.
