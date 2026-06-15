# Row 1 — Stripe checkout redirect button

## Why

The 09-iteration catalog row `stripe-checkout-button-aria` (P0) flags
the Stripe checkout redirect button on the membership page as
`missing-aria`. The current implementation (`MemberFeed.tsx`
`MembershipPage`) renders the button as an inline `Button` inside a
`Panel` with no form landmark, no localized accessible name, and no
selector-disciplinable surface — gherkin cannot target it without
`getByText` chains. This per-row spec ships the component extraction,
the accessible surface, the i18n keys, the gherkin scenario, and the
storybook story the row's Definition of Done requires.

## What Changes

- Extract the checkout redirect affordance into a dedicated
  `StripeCheckoutRedirectButton` component under
  `src/components/payments/StripeCheckoutRedirectButton.tsx`.
- The component renders a submit button inside a `<form>` landmark
  with a localized `aria-label`, exposes the localized submit copy as
  the accessible name, and accepts a `paymentMethod` + `promoCode` +
  `onSubmit` contract that the membership page wires up.
- Refactor `MembershipPage` in `MemberFeed.tsx` to use the new
  component for the checkout submission affordance only.
- Localize the new copy in DE and EN via
  `src/lib/i18n.ts` under `payments.checkout.*`.
- Add `tests/features/billing/stripe-checkout-button-aria.feature`
  with one happy-path scenario (member views the membership page in
  an unpaid state, the checkout form landmark is reachable, the
  submit button is the unique selectable element for that
  affordance) and one edge case (no payment method is preselected).
- Add a `StripeCheckoutRedirectButton.stories.tsx` story with a
  happy-path story and a localized-label story, each carrying a
  `@storybook/test` `play` interaction test.

## Specs

- Points at the umbrella's `## MODIFIED Requirements` block on
  `Stripe Subscription Lifecycle` in
  `openspec/changes/payments-subscriptions-aria/specs/payments-subscriptions/spec.md`.
  Relevant scenarios:
  - `Stripe checkout redirect button is selector-disciplinable and accessible`
