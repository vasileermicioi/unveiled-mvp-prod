# Row 3 — Credit ledger view table semantics

## Why

The 09-iteration catalog row `credit-ledger-table-aria` (P0) flags
the credit ledger view as `missing-aria`. The current implementation
in `MemberFeed.tsx` renders the ledger entries as a list of
`TableRow` items inside a generic `<Panel>` with a Badge label —
no `<table>` landmark, no `<th scope="col">` headers, no region
wrapper, and no stable row anchor. Screen readers do not announce
it as a single ledger region, and gherkin cannot target individual
rows without `getByText` chains. This per-row spec extracts the
ledger into a real `<table>` with a single region landmark, column
scopes, and stable row anchors, and ships the gherkin + storybook
coverage the row's Definition of Done requires.

## What Changes

- Extract the credit ledger view into a dedicated
  `CreditLedgerViewTableSemantics` component under
  `src/components/payments/CreditLedgerViewTableSemantics.tsx`
  that renders a `<section aria-labelledby="credit-ledger-region">`
  wrapping a `<table aria-labelledby="credit-ledger-region">` with
  a `<caption className="sr-only">`, `<th scope="col">` headers
  (Reason, Date, Actor, Credits), and rows that expose a stable
  localized row label (`invoiceReferenceLabel` or entry `id`).
- An empty ledger still renders the region with a localized
  empty-state copy inside a `<Panel>` so the landmark is
  preserved.
- Refactor `MemberFeed.tsx` `MemberFeed` (the live feed
  component) to use the new component for the credit ledger
  block. The outer `<Panel tone="white">` keeps the visual
  framing; the new component supplies the accessibility shell.
- Localize the new copy in DE and EN via `src/lib/i18n.ts`
  under `payments.ledger.*`.
- Add `tests/features/billing/credit-ledger-table-aria.feature`
  with one happy-path scenario (member views a populated
  ledger, the table region is reachable, column headers carry
  the localized scope) and one edge case (empty ledger still
  exposes the region landmark with the localized empty-state
  copy).
- Add a `CreditLedgerViewTableSemantics.stories.tsx` story
  with a happy-path and an empty-state story, each carrying a
  `@storybook/test` `play` interaction test.

## Specs

- Points at the umbrella's `## MODIFIED Requirements` block on
  `Subscription Data Model` in
  `openspec/changes/payments-subscriptions-aria/specs/payments-subscriptions/spec.md`.
  Relevant scenario:
  - `Credit ledger view is a single accessible region`
