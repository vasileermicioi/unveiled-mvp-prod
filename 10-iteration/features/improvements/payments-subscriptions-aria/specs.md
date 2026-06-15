# Umbrella Specs — Payments & subscriptions ARIA pass

This umbrella modifies the `payments-subscriptions` capability
spec with one `## MODIFIED Requirements` block per absorbed row.
The capability deltas live at
`openspec/changes/payments-subscriptions-aria/specs/payments-subscriptions/spec.md`.

## Absorbed rows

- `stripe-checkout-button-aria` — `## MODIFIED` block on
  `Stripe Subscription Lifecycle` (scenario:
  `Stripe checkout redirect button is selector-disciplinable and accessible`).
- `stripe-webhook-typespec` — `## MODIFIED` block on
  `Provider Event Processing` (scenarios:
  `Webhook handler is contract-driven`,
  `Webhook handler validation surfaces schema failures`).
- `credit-ledger-table-aria` — `## MODIFIED` block on
  `Subscription Data Model` (scenario:
  `Credit ledger view is a single accessible region`).
- `admin-freeze-unfreeze-aria` — `## MODIFIED` block on
  `Admin Billing Overrides` (scenarios:
  `Admin freeze form is selector-disciplinable and accessible`,
  `Admin freeze form reports server errors accessibly`).
- `subscription-portal-link-aria` — `## MODIFIED` block on
  `Stripe Subscription Lifecycle` (scenario:
  `Subscription portal link is selector-disciplinable and accessible`).
