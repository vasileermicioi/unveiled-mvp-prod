# Row 2 — Stripe webhook handler validation

## Why

The 09-iteration catalog row `stripe-webhook-typespec` (P0) flags the
Stripe webhook handler as `missing-typespec-entry`. While the
TypeSpec `WebhookService.stripe` operation and the generated
`StripeEventSchema` already exist, the runtime handler at
`src/pages/api/stripe/webhook.ts` was not actually consuming the
generated Zod schema — it trusted the Stripe SDK's
`constructEvent` and forwarded the payload to `processStripeEvent`
without contract validation. This per-row spec wires the handler
to the generated contract, exposes the schema-failure response
shape described by TypeSpec, and ships the gherkin + storybook
coverage the row's Definition of Done requires.

## What Changes

- `src/pages/api/stripe/webhook.ts` now imports the generated
  `StripeEventSchema` from `@/lib/generated/request-validators` and
  runs `safeParse` on the parsed Stripe event before any
  subscription, credit, or ledger mutation runs. A schema failure
  returns `422` with a `WebhookError` body whose `issues` field
  carries the Zod issue list (this matches the `WebhookError`
  model emitted from `typespec/webhooks.tsp`).
- Align the `typespec/webhooks.tsp` `StripeEvent` discriminated
  union with the handler's actual event-type coverage
  (`invoice.paid`, `invoice.payment_action_required`,
  `customer.subscription.deleted`) so the generated schema
  matches the handler's `switch`. Re-run `bun run specs:gen` to
  regenerate `src/lib/generated/request-validators.ts`.
- Localize the new error copy in DE and EN under
  `src/lib/i18n.ts` `payments.webhook.*`.
- Add `tests/features/billing/stripe-webhook-typespec.feature`
  with one happy-path scenario (a verified event whose payload
  matches the contract is accepted) and one edge case (a verified
  event whose payload does not match the contract returns 422
  with the `WebhookError` body).
- Add a `StripeWebhookHandlerValidation.stories.tsx` story that
  mocks the handler at the HTTP boundary and asserts the
  schema-failure response shape.

## Specs

- Points at the umbrella's `## MODIFIED Requirements` blocks on
  `Provider Event Processing` in
  `openspec/changes/payments-subscriptions-aria/specs/payments-subscriptions/spec.md`.
  Relevant scenarios:
  - `Webhook handler is contract-driven`
  - `Webhook handler validation surfaces schema failures`
