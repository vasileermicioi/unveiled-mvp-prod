# Row 5 — Subscription portal link

## Why

The 09-iteration catalog row `subscription-portal-link-aria` (P0)
flags the subscription portal link as `missing-aria`. There is no
visible portal link on the membership page today — the member has
no way to open the Stripe customer portal through the UI. This
per-row spec adds a dedicated `SubscriptionPortalLink` component
that exposes the external portal destination as a labeled,
external-destination link inside a single named region, and ships
the gherkin + storybook coverage the row's Definition of Done
requires.

## What Changes

- Extract the subscription portal affordance into a dedicated
  `SubscriptionPortalLink` component under
  `src/components/payments/SubscriptionPortalLink.tsx` that
  renders a `<section aria-labelledby="subscription-portal-region">`
  region containing a `<a target="_blank" rel="noopener noreferrer">`
  with a localized accessible name (the destination is announced
  through the `aria-label`, including the external-destination
  hint in both EN and DE). When the URL is missing, the region
  still renders with a localized "unavailable" fallback message
  in a `role="status"` element.
- Wire the new component into the `MembershipPage` in
  `MemberFeed.tsx` so the link appears for an active member.
  The URL is supplied by the page from a placeholder constant
  for now; integrating the real Stripe billing portal session
  is intentionally out of scope for this umbrella.
- Localize the new copy in DE and EN via `src/lib/i18n.ts`
  under `payments.portal.*`.
- Add `tests/features/billing/subscription-portal-link-aria.feature`
  with one happy-path scenario (active member views the
  membership page, the portal region is reachable, the portal
  link exposes a localized accessible name and the
  external-destination hint) and one edge case (portal URL
  is missing, the region still announces the unavailable
  fallback).
- Add a `SubscriptionPortalLink.stories.tsx` story with a
  happy-path, a missing-URL, and a localized-link story, each
  carrying a `@storybook/test` `play` interaction test.

## Specs

- Points at the umbrella's `## MODIFIED Requirements` block on
  `Stripe Subscription Lifecycle` in
  `openspec/changes/payments-subscriptions-aria/specs/payments-subscriptions/spec.md`.
  Relevant scenario:
  - `Subscription portal link is selector-disciplinable and accessible`
