## Context

The legacy app exposes subscription state, payment method details, credit refills, and frozen-account behavior through local store methods. The target app needs those behaviors to be driven by a real payment provider while preserving the visible membership flow and credit ledger semantics.

Stripe is the provider for the first implementation. Stripe subscriptions provide the recurring billing state, Stripe Elements provide enough control to keep the existing membership page layout, and Stripe webhooks provide the asynchronous source of truth for activation, renewal, failure, and cancellation events.

## Goals / Non-Goals

**Goals:**

- Implement the `BASIC_BERLIN` subscription as a Stripe recurring EUR price at `29 EUR` per month.
- Store local subscription, payment method, billing address, provider event, and credit refill state in Postgres.
- Refill credits only from idempotent provider events or authorized admin adjustments.
- Freeze booking eligibility when provider state is past due, unpaid, canceled, incomplete, or explicitly admin-frozen.
- Keep profiles, bookings, billing status, and ledger history visible even when booking eligibility is frozen.
- Present checkout methods in the required order: express wallets, separately highlighted PayPal, then standard card and SEPA Direct Debit.

**Non-Goals:**

- Redesign the membership page beyond the payment method presentation required by this change.
- Build full accounting, tax reporting, revenue recognition, or invoice PDF management.
- Implement multiple plans, usage-based pricing, family accounts, or complex promo-code credit policies.
- Replace existing booking transaction requirements except where booking eligibility reads the new subscription state.

## Decisions

### Use Stripe Billing and Stripe Elements

Use Stripe Billing for subscriptions and create subscriptions server-side with `payment_behavior` that allows the client to confirm the initial payment or setup action through Stripe.js. Use Stripe Elements rather than hosted Checkout because the membership page requires precise payment method ordering and no preselected method.

Alternatives considered:

- Hosted or embedded Stripe Checkout: lower implementation effort, but less control over the required PayPal placement, no-default selection, and existing page composition.
- Fully custom card and IBAN collection: unnecessary PCI and SCA complexity compared with Stripe Elements.

### Store Stripe as the provider, not the domain model

Persist local subscription rows with stable app states such as `incomplete`, `active`, `past_due`, `unpaid`, `canceled`, and `admin_frozen`, plus Stripe IDs for customer, subscription, price, invoice, payment method, and event correlation. Stripe is the integration detail; app behavior reads the local state.

Provider events are stored in a `provider_events` table keyed by provider and event ID. Invoice-driven refill ledger entries use a separate idempotency key such as `stripe:invoice:<invoice_id>:credit_refill` so duplicate webhooks and replayed jobs cannot duplicate credits.

### Refill monthly credits from paid subscription invoices

Credits refill when a Stripe subscription invoice is paid and the invoice belongs to the `BASIC_BERLIN` price. The first paid invoice activates the subscription and refills credits the same way as renewals. The refill policy is fixed for the first implementation: set the member balance to the monthly plan allowance rather than accumulating rollover credits. Manual admin adjustments remain additive ledger entries and are not erased by a monthly refill; the refill computes the adjustment needed to bring plan credits to the monthly allowance.

### Process webhooks on an app endpoint with transactional handlers

Expose a server endpoint in the app runtime for Stripe webhooks. The endpoint verifies Stripe signatures against the raw request body, stores the event receipt, and processes supported events in a transaction. Unsupported event types are acknowledged after receipt storage.

Supported event families:

- `invoice.paid` refills credits, activates eligible subscriptions, and stores invoice metadata.
- `invoice.payment_failed` freezes booking eligibility and records past-due display state.
- `invoice.payment_action_required` marks the subscription as requiring customer action.
- `customer.subscription.created` and `customer.subscription.updated` sync subscription metadata and status.
- `customer.subscription.deleted` cancels local subscription access.

### Keep admin overrides explicit and auditable

Admin freeze or unfreeze actions write override rows and update the effective member booking eligibility. Admin credit adjustments reuse the existing ledger pattern with admin actor metadata and reason text. Provider events do not delete admin ledger entries.

### Promo codes affect Stripe billing first

Promo codes are passed to Stripe as promotion codes or coupons when the checkout session is initialized. Promo codes do not change the monthly credit allowance unless a future plan explicitly defines that behavior.

## Risks / Trade-offs

- Stripe payment method availability differs by account, country, currency, and subscription mode -> Gate PayPal, SEPA, Apple Pay, and Google Pay behind runtime availability checks and feature flags, and show only methods Stripe can initialize.
- SEPA Direct Debit can have delayed payment outcomes and different retry behavior -> Treat subscription access as pending until provider events confirm payment success, and keep webhook outcomes authoritative.
- Webhook delivery can be duplicated or out of order -> Store provider event receipts and apply mutations with invoice-level idempotency keys inside database transactions.
- Local and Stripe state can drift -> Add admin-visible provider IDs, last synced timestamps, and a reconciliation task for a member or subscription.
- Serverless webhook endpoints can mishandle raw bodies -> Verify webhook signatures before parsing JSON and add tests around raw-body handling.

## Migration Plan

1. Add Stripe environment variables, product and price configuration, and webhook secret configuration.
2. Add Postgres tables and indexes for subscriptions, payment methods, billing addresses, provider events, and credit refill metadata.
3. Implement server actions for checkout initialization, payment confirmation handoff data, billing profile reads, and admin overrides.
4. Implement the Stripe webhook endpoint and transactional handlers.
5. Update booking eligibility checks to read effective subscription and freeze state.
6. Update membership/profile/admin display view models.
7. Test in Stripe test mode with card success, card failure, required action, duplicate webhook replay, SEPA delayed success/failure, and unavailable wallet methods.
8. Roll back by disabling checkout entry points and webhook processing while keeping schema additions inert; existing rows remain auditable.

## Open Questions

- Confirm the exact monthly plan credit allowance for `BASIC_BERLIN`.
- Confirm whether the Stripe account has PayPal and SEPA Direct Debit enabled for EUR subscriptions in the operating country.
- Confirm whether Stripe Tax is required at launch or whether billing address collection is informational for the first release.
