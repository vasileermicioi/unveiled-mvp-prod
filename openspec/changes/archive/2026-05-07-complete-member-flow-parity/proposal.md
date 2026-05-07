## Why

The legacy member experience has complete visible flows for onboarding, discovery, saving events, booking, bookings, profile, membership state, and language selection, but the current app has only partial wiring between the UI, route data, server actions, and session behavior. This change closes that parity gap so members can move through the app end-to-end using database-backed data and safe server-side mutations.

## What Changes

- Route newly signed-up or incomplete members into the visible onboarding preference flow before regular discovery.
- Persist onboarding completion and preference values, including skip behavior, then return members to discovery.
- Wire discovery filters for category, partner/venue, start date, end date, and saved-only views to authorized event data.
- Implement save and unsave actions with cache/query invalidation so event cards and shell saved counts update after mutation.
- Connect event detail booking and waitlist surfaces to real booking transactions and result states.
- Preserve member booking gates for active membership, unpaid/past-due/frozen states, ticket quantity limits, insufficient credits, sold-out events, event state, redemption setup, and waitlist availability.
- Render bookings, wallet, profile, preferences, billing address, newsletter preference, membership, and subscription state from authorized server data.
- Preserve visible language selection behavior across member shell copy and relevant persisted profile/session state.
- No visual redesign and no new payment provider features are included.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `pages`: Member routes gain complete onboarding, discovery, saved, bookings, profile, and membership behavior.
- `display-data`: Member-facing event, saved event, booking, wallet, profile, and shell data queries gain the fields and filtering needed for parity.
- `forms-actions`: Member profile, preference, onboarding, saved event, and language-related mutations gain validation, persistence, and invalidation behavior.
- `booking-transactions`: Booking and waitlist flows gain member-visible success and failure outcomes while preserving transaction constraints.
- `payments-subscriptions`: Member membership pages and booking gates reflect real subscription, checkout, unpaid, past-due, and frozen states.
- `auth`: Signup/session routing and role behavior direct incomplete members through onboarding and protect member-only server data/actions.

## Impact

- Affected app surfaces include member onboarding, discovery, saved events, event detail modal, bookings, profile/account settings, membership, and shared member shell state.
- Affected code is expected around `_old_app` parity references, route loaders/components, `src/actions/index.ts`, `src/lib/booking-transactions.ts`, `src/lib/forms/schemas.ts`, and `src/lib/data-access/repositories.ts`.
- Server-side validation, cache invalidation, and authorization checks will be exercised for profile/preference updates, saved events, bookings, waitlist entries, and membership state gates.
- Existing payment/subscription capabilities are consumed but not expanded with new provider behavior.
