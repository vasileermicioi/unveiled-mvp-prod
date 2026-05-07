## 1. Route Data And Authorization

- [x] 1.1 Audit current member route files, hydrated islands, and legacy parity components for onboarding, discovery, saved, modal, bookings, profile, membership, and language behavior.
- [x] 1.2 Add or update auth route helpers so incomplete authenticated members are routed to onboarding before regular member discovery.
- [x] 1.3 Ensure member route loaders pass authenticated member identity into repositories for discovery, saved, bookings, profile, membership, and shell data.
- [x] 1.4 Add route-level handling for completed members who open onboarding directly.

## 2. Display Data And Repositories

- [x] 2.1 Extend member discovery repository/view-model mapping with category, partner, start date, end date, saved-only filtering, active range label, result count, active filter count, per-event saved state, and saved count.
- [x] 2.2 Extend member shell/profile view models with profile completeness, onboarding completion, wallet credits, membership gate state, saved count, preferences, billing address, newsletter preference, and language preference.
- [x] 2.3 Extend member bookings view models with confirmed and used ticket rows including event title, image, date, address, ticket count, redemption data, booking status, and checked-in timestamp.
- [x] 2.4 Ensure saved-only discovery filtering is applied in server data access rather than only in client state.

## 3. Member Actions

- [x] 3.1 Add or update schemas for onboarding, preferences, profile, billing address, newsletter, language, save event, and unsave event submissions.
- [x] 3.2 Implement onboarding submit and skip actions that persist preference values and onboarding completion state.
- [x] 3.3 Implement profile, preference, billing address, newsletter, and language actions with server validation and profile/shell refresh metadata.
- [x] 3.4 Implement authorized save and unsave event actions with discovery, saved route, and shell saved-count invalidation.

## 4. Booking And Membership Gates

- [x] 4.1 Wire the event modal booking submit path to the existing atomic member booking transaction and display authoritative success or safe failure results.
- [x] 4.2 Wire the event modal waitlist path to the existing waitlist transaction and display waitlist success without debiting credits.
- [x] 4.3 Ensure booking actions enforce active membership, unpaid/past-due/frozen gates, ticket quantity 1-3, credits, capacity, event state, idempotency, and redemption setup.
- [x] 4.4 Clear stale redemption payloads whenever a booking attempt fails or switches to waitlist success.
- [x] 4.5 Wire membership page display to existing subscription, checkout, credit, unpaid, past-due, and frozen state data.

## 5. Member UI Wiring

- [x] 5.1 Connect onboarding UI to route data and onboarding actions, then redirect successful finish or skip to discovery.
- [x] 5.2 Connect discovery filters and saved route controls to live query state and rendered counts.
- [x] 5.3 Connect event card save state to save and unsave actions with visible card and shell count updates.
- [x] 5.4 Connect bookings page UI to authorized bookings data and redemption copy behavior.
- [x] 5.5 Connect profile/account UI to profile, preference, billing, newsletter, language, and password recovery links where visible.
- [x] 5.6 Connect visible membership banners and disabled booking affordances across discovery and modal surfaces.

## 6. Verification

- [x] 6.1 Add or update tests for onboarding redirects, onboarding persistence, and complete-member routing.
- [x] 6.2 Add or update tests for discovery filters, saved-only results, save/unsave invalidation, and shell saved count refresh.
- [x] 6.3 Add or update tests for booking success, blocked booking states, waitlist success, stale redemption clearing, and quantity limits.
- [x] 6.4 Add or update tests for bookings/profile/membership rendering with active, unpaid, past-due, and frozen seeded states.
- [x] 6.5 Run the project check/build commands and record any remaining gaps before applying the change.
