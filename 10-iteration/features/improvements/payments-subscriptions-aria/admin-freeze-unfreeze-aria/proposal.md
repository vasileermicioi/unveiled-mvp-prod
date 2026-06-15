# Row 4 — Admin freeze / unfreeze form

## Why

The 09-iteration catalog row `admin-freeze-unfreeze-aria` (P0)
flags the admin freeze/unfreeze affordance as
`selector-discipline-violation` and `missing-aria`. The current
implementation in `AdminPanel.tsx` is a single `<Button>` with
hardcoded `"Freeze"` / `"Unfreeze"` text that calls the
`toggleUserFreeze` Astro Action on click. There is no form
landmark, no labeled reason input, no `aria-live` error region,
and gherkin cannot target the affordance without `getByText`
chains. This per-row spec extracts the affordance into a real
form with a localized reason field, a labeled result region, and
unique selectability for the freeze and unfreeze submit buttons.

## What Changes

- Extract the admin freeze/unfreeze affordance into a dedicated
  `AdminFreezeUnfreezeForm` component under
  `src/components/payments/AdminFreezeUnfreezeForm.tsx` that
  renders a `<form aria-labelledby>` landmark, a labeled reason
  input (`htmlFor` + `aria-describedby` to the error region),
  unique submit buttons for freeze and unfreeze (each with a
  localized `aria-label`), and an `aria-live="polite"` result
  region that announces server errors and the local
  "reason-required" validation error.
- The form collects the reason in component state and forwards
  it to the parent `onSubmit` callback. The existing
  `toggleUserFreeze` Action contract is unchanged; the umbrella
  is "out of scope" for action changes.
- Refactor `AdminPanel.tsx` to use the new component for the
  freeze/unfreeze affordance; the per-member "+ Credit" button
  remains.
- Localize the new copy in DE and EN via `src/lib/i18n.ts`
  under `payments.admin.*`.
- Add `tests/features/billing/admin-freeze-unfreeze-aria.feature`
  with one happy-path scenario (admin opens the freeze form
  for a member, the form landmark is reachable, the reason
  field is the unique input, the freeze and unfreeze buttons
  are the unique selectables) and one edge case (admin submits
  without a reason, the error is announced and the form
  retains the entered reason).
- Add an `AdminFreezeUnfreezeForm.stories.tsx` story with a
  happy-path and a missing-reason story, each carrying a
  `@storybook/test` `play` interaction test.

## Specs

- Points at the umbrella's `## MODIFIED Requirements` block on
  `Admin Billing Overrides` in
  `openspec/changes/payments-subscriptions-aria/specs/payments-subscriptions/spec.md`.
  Relevant scenarios:
  - `Admin freeze form is selector-disciplinable and accessible`
  - `Admin freeze form reports server errors accessibly`
