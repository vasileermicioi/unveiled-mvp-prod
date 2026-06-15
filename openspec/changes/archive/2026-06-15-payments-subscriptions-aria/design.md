## Context

The 09-iteration catalog flags 5 `payments-subscriptions` surfaces as failing the 10-iteration Definition of Done (`missing-aria`, `missing-typespec-entry`, `selector-discipline-violation`):

1. `stripe-checkout-button-aria` — Stripe checkout redirect button
2. `stripe-webhook-typespec` — Stripe webhook handler validation
3. `credit-ledger-table-aria` — Credit ledger view table semantics
4. `admin-freeze-unfreeze-aria` — Admin freeze/unfreeze form
5. `subscription-portal-link-aria` — Subscription portal link

The 10-iteration Definition of Done requires every UI surface to be selector-disciplinable (proximity + layout selectors only), accessible (`aria-*` attributes, labels, landmark wrappers), bilingual (EN/DE via `src/lib/i18n.ts`), and traced through a single OpenSpec capability. Bundling the 5 rows into one umbrella keeps the review surface tight (one proposal, one capability delta) without losing the per-row gherkin + storybook story the Definition of Done requires. The per-row folders under `10-iteration/features/improvements/payments-subscriptions-aria/<row-slug>/` remain the implementation unit.

The change touches the `payments-subscriptions` capability only. No new capabilities are introduced. The Stripe webhook handler additionally needs a TypeSpec contract entry so `bun run specs:check` no longer reports the `missing-typespec-entry` drift, and the generated Zod schema becomes the only source of truth for payload validation.

## Goals / Non-Goals

**Goals:**

- Make the 5 absorbed surfaces selector-disciplinable (proximity + layout selectors only) and screen-reader friendly.
- Add a TypeSpec entry for the Stripe webhook handler so the generated Zod schema validates every parsed payload before mutation.
- Localize any new copy in DE and EN via `src/lib/i18n.ts`; the i18n parity unit test passes.
- Ship a `<component>.stories.tsx` story + at least one `@storybook/test` `play` interaction test per absorbed row.
- Ship a `feature.feature` (one happy-path + one edge case) per absorbed row using only proximity + layout selectors.
- Keep the per-row DoD satisfiable: each absorbed row has its own `proposal.md` + `tasks.md` + `feature.feature` + `<component>.stories.tsx` + `specs.md` under `10-iteration/features/improvements/payments-subscriptions-aria/<row-slug>/`.

**Non-Goals:**

- Any other 09-iteration row whose capability is not in this umbrella's absorbed set.
- Changing the Stripe webhook processing logic itself; this umbrella only adds contract validation and the missing surface accessibility/selector work.
- Adding new Stripe API integrations, plans, or promo-code behavior.
- Touching the credit ledger data model or the admin freeze/unfreeze server actions; the umbrella only refactors the UI surface and adds contract validation for the webhook.

## Decisions

- **One OpenSpec change, five per-feature folders.** The umbrella's `proposal.md` is the only OpenSpec change proposal; each absorbed row's per-feature folder holds the per-row `proposal.md` (linking back to the umbrella), `tasks.md`, `feature.feature`, `<component>.stories.tsx`, and `specs.md`. This matches the umbrella pattern used by other 10-iteration umbrellas (e.g. shell ARIA pass) and keeps the per-row DoD intact.
- **Capability delta shape: 5 `## MODIFIED Requirements` blocks under `payments-subscriptions`.** No new capabilities. Each absorbed row's behavior change folds into the matching existing requirement: `Stripe Subscription Lifecycle` (rows 1 + 5), `Provider Event Processing` (row 2), `Subscription Data Model` (row 3), `Admin Billing Overrides` (row 4). The webhook TypeSpec entry is the contract for the existing `Webhook Payload Is Validated Against The Generated Contract` requirement and the `Provider Event Processing` scenarios.
- **TypeSpec entry under `typespec/webhook-service.tsp` (or the existing Stripe-related file).** Reuse the existing TypeSpec layout — add a `WebhookService` namespace with a `stripe` operation whose input is the parsed Stripe event payload. Run `bun run specs:gen` to regenerate the committed artifacts; do not hand-edit `typespec/output/` or `src/lib/generated/`.
- **Selector discipline: proximity + layout only.** The gherkin `feature.feature` files and the storybook `play` tests select elements via:
  - `getByRole('button', { name: localizedLabel })` for the Stripe checkout button, freeze/unfreeze submit, and portal link.
  - `getByRole('region', { name: formLandmarkLabel })` for forms.
  - `getByRole('table', { name: ledgerLandmarkLabel })` + `within(row).getByRole('cell', { name: ... })` for the credit ledger.
  - No `getByText` chains and no `data-testid` for production behavior.
- **Accessibility wrappers use the existing shadcn/ui + Tailwind v4 conventions.** The credit ledger becomes a single `<section aria-labelledby="...">` wrapping a `<table>` with `<caption className="sr-only">` and `<th scope="col">` cells. The admin freeze/unfreeze form becomes a `<form aria-label={...}>` with `<label for>` for the reason field and an `aria-live="polite"` region for server errors.
- **Storybook story uses the existing Storybook 8 setup.** Each story imports the component from its current location, renders a representative state (default + error/destructive), and uses `@storybook/test` `play` to assert the accessible name, the unique selectability, and (for the ledger) the column header scopes. Stories carry the `@story(component=…, story=…)` tag the coverage script reads.
- **i18n keys added under the existing `src/lib/i18n.ts` namespaces.** New keys follow the existing `payments.checkout.button`, `payments.ledger.region`, `payments.admin.freeze.form`, `payments.portal.link` patterns. The i18n parity unit test is updated to cover every new key in both EN and DE.

## Risks / Trade-offs

- [Selector discipline refactor may surface hidden `getByText` chains in adjacent tests] → Run `bun run test:e2e` after each per-row refactor and update the gherkin first; treat failing gherkin as a signal the surface still has a selectability problem.
- [Adding the TypeSpec webhook entry can change the generated OpenAPI surface] → The contract change is additive (a new operation under an existing service) and is intentionally exposed; no client consumes the new operation, so no client-side breakage is expected. `bun run specs:check` and `bun run test:e2e` are the regression gates.
- [The credit ledger refactor may break visual baselines] → The visual regression test is part of `bun run check`; regenerate baselines intentionally only after the accessibility wrapper is merged.
- [Localization drift if a new label is added in EN but not DE] → The i18n parity unit test fails the build until both locales are present; CI catches it.
- [Per-row scope creep] → Each per-row `tasks.md` is bounded to the row's surface only; cross-row shared work (TypeSpec, i18n key namespace) is listed in the umbrella `tasks.md` once and not duplicated.

## Migration Plan

- Ship the umbrella as a single PR with 5 per-row commits so the review surface stays scoped.
- Each per-row commit lands: the component refactor + the matching `feature.feature` + the matching `<component>.stories.tsx` + the i18n key additions for that row.
- The TypeSpec + regenerated artifacts land in a single commit at the start of the PR to unblock the webhook row's `bun run specs:check` gate.
- Rollback strategy: revert the PR (no schema migration, no data migration).
- After merge, archive the change with `openspec archive payments-subscriptions-aria`; the spec deltas fold into `openspec/specs/payments-subscriptions/spec.md`.

## Open Questions

- None blocking. The 5 rows, their capabilities, and the umbrella structure are pre-approved in the 10-iteration catalog; implementation details are scoped per row.
