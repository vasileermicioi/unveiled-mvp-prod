# Umbrella — Payments & subscriptions ARIA pass

Pointer to the canonical OpenSpec change at
`openspec/changes/payments-subscriptions-aria/`. The umbrella
absorbed five 09-iteration catalog rows:

- `stripe-checkout-button-aria` — Stripe checkout redirect button
  (`payments-subscriptions`, refactor, P0) — _missing-aria_
- `stripe-webhook-typespec` — Stripe webhook handler validation
  (`payments-subscriptions`, `openapi-contract`, refactor, P0) —
  _missing-typespec-entry_
- `credit-ledger-table-aria` — Credit ledger view table semantics
  (`payments-subscriptions`, refactor, P0) — _missing-aria_
- `admin-freeze-unfreeze-aria` — Admin freeze/unfreeze form
  (`payments-subscriptions`, `operations`, refactor, P0) —
  _selector-discipline-violation, missing-aria_
- `subscription-portal-link-aria` — Subscription portal link
  (`payments-subscriptions`, refactor, P0) — _missing-aria_

Full proposal, design, specs delta, and task list live in the
OpenSpec change. The per-row sub-folders
(`<row-slug>/{proposal.md, tasks.md, feature.feature,
<component>.stories.tsx, specs.md}`) are the per-row implementation
units and satisfy the 10-iteration per-row Definition of Done.
