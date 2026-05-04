# Payments Subscriptions Verification Debt

## Context

OpenSpec change: `migrate-payments-subscriptions`

The initial implementation added Stripe configuration, subscription schema, checkout initialization, webhook processing, idempotent refill logic, billing freeze states, admin overrides, booking eligibility checks, and membership payment-method presentation.

Current local verification passes:

- `bun run check`
- `bun test`

The remaining debt is verification depth, not the primary implementation path. This document is the follow-up owner for the deferred verification work, so the OpenSpec change can reach a logical archive point without losing the remaining release risk.

## Remaining OpenSpec Tasks

- `3.6` Add tests for duplicate webhook replay, invalid signatures, paid invoice refill, failed payment freeze, and unsupported events.
- `7.1` Run unit and integration tests for schema, Stripe service helpers, webhook handlers, refill logic, booking eligibility, and admin overrides.
- `7.2` Run UI tests for membership payment method ordering, no default method selection, frozen status, active status, and validation messages.
- `7.3` Test Stripe test-mode flows for successful card payment, failed payment, required action, duplicate webhook replay, SEPA delayed outcome, and unavailable wallet methods.
- `7.4` Run OpenSpec validation or status checks for `migrate-payments-subscriptions` and confirm the change remains apply-ready.

## Why This Is Deferred

The remaining items need either a stronger integration test harness around the database and Astro route handlers, or Stripe test-mode credentials and account configuration. Marking those tasks complete without that evidence would hide the real release risk.

## Closure Criteria

- Add webhook tests that exercise raw-body signature verification, duplicate event handling, unsupported events, `invoice.paid`, `invoice.payment_failed`, and `invoice.payment_action_required`.
- Add database-backed tests for provider event uniqueness and refill idempotency using the generated migration.
- Add UI tests that verify checkout method order: express wallet section, standalone PayPal option, lower card and SEPA selector, and no default selected method.
- Run Stripe test-mode flows against a configured Stripe account for card success, card failure, SCA/action-required, SEPA delayed outcome, duplicate webhook replay, and unavailable wallet methods.
- Re-run `openspec instructions apply --change "migrate-payments-subscriptions" --json` and confirm no remaining unchecked implementation tasks before archiving.

## OpenSpec Closure Decision

The OpenSpec implementation tasks are considered closed once this debt record exists and local checks pass. The deferred verification items stay tracked here until a later hardening slice supplies webhook integration tests, UI tests, and Stripe test-mode evidence.

## Suggested Next Implementation Slice

1. Build a small webhook test helper that constructs signed Stripe webhook requests.
2. Add test fixtures for Stripe invoice and subscription payloads.
3. Cover `processStripeEvent` with a transaction-backed test database.
4. Add a UI test around the billing panel in `visual-system-app`.
5. Perform Stripe test-mode manual verification and attach notes or screenshots to the release checklist.
