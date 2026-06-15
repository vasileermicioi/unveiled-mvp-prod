## Why

The 09-iteration catalog flags 5 `payments-subscriptions` surfaces (`stripe-checkout-button-aria`, `stripe-webhook-typespec`, `credit-ledger-table-aria`, `admin-freeze-unfreeze-aria`, `subscription-portal-link-aria`) that all fail the 10-iteration Definition of Done: missing `aria-*` attributes, a missing TypeSpec entry for the Stripe webhook handler, and selector-discipline violations. Bundling them into one umbrella keeps the review surface tight while each row keeps its own per-feature folder (`proposal.md`, `tasks.md`, `feature.feature`, `<component>.stories.tsx`, `specs.md`) so the per-row DoD is still met.

## What Changes

- Refactor each of the 5 absorbed surfaces to comply with the proximity+layout selector discipline.
- Add the missing `aria-*` attributes, labels, and landmark wrappers required for selector-disciplinable selection on every absorbed row.
- Add a TypeSpec entry that describes the Stripe webhook handler's HTTP surface so the handler is contract-driven and `bun run specs:check` no longer drifts.
- Localize any new copy in DE and EN via `src/lib/i18n.ts` (i18n parity unit test must pass).
- Add a `<component>.stories.tsx` story for every absorbed row (`StripeCheckoutRedirectButton.stories.tsx`, `StripeWebhookHandlerValidation.stories.tsx`, `CreditLedgerViewTableSemantics.stories.tsx`, `AdminFreezeUnfreezeForm.stories.tsx`, `SubscriptionPortalLink.stories.tsx`) with at least one `@storybook/test` `play` interaction test per story.
- Add a `feature.feature` per absorbed row (one happy-path + one edge case) under the per-feature folder, using only proximity + layout selectors.
- Update the `payments-subscriptions` capability spec with one `## MODIFIED Requirements` block per absorbed row.

## Capabilities

### New Capabilities

- _None_ — refactor / replace of an existing capability.

### Modified Capabilities

- `payments-subscriptions`: 5 rows add a `## MODIFIED Requirements` block (one per absorbed row). The Stripe webhook handler additionally gets a TypeSpec contract entry to remove the `missing-typespec-entry` drift.

## Impact

- New files:
  - OpenSpec change at `openspec/changes/payments-subscriptions-aria/` containing `proposal.md` + `design.md` + `tasks.md` + `specs/payments-subscriptions/spec.md`.
  - Per-feature folders at `10-iteration/features/improvements/payments-subscriptions-aria/<row-slug>/` for each of the 5 absorbed rows, each with `proposal.md` + `tasks.md` + `feature.feature` + `<component>.stories.tsx` + `specs.md`.
- Modified files: the component(s) under `src/components/` or `src/lib/` that each absorbed row touches, the `openspec/specs/payments-subscriptions/spec.md` capability spec, the `typespec/` entry for the Stripe webhook handler, the `architecture/model.ts` LikeC4 element if any absorbed row adds a node, and `src/lib/i18n.ts` for any new copy.
- Dependencies: none new; the umbrella is a refactor of existing surfaces.
- Out of scope: any other 09-iteration row whose capability is not in this umbrella's absorbed set; those land in their own umbrella.
