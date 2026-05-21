## Context

On the public discover page (`/discover`), guest/unauthenticated users can browse event listings. However, clicking on any event card or map marker currently redirects the user to the member dashboard (`setView("member")`). Because guest users have no active session, this triggers a redirect/bounce back to the authentication/landing screen. In the legacy application, guest users could open an event detailed preview modal displaying description, location, timing, and partner details, with a call-to-action button to sign in/join.

## Goals / Non-Goals

**Goals:**
- Implement a detailed event preview modal for guest users on the public discover page.
- Show complete details (title, category, description, timing, and partner/venue details).
- Hide the ticketing/booking options for guests.
- Provide a call-to-action button ("Join Unveiled to Book" / "Jetzt beitreten") pointing to `/?callbackURL=/discover`.

**Non-Goals:**
- Implement actual event booking or waitlist functionality for guest users without logging in.
- Change the design of the member/authenticated event modal, except for date/time formatting.

## Decisions

- **Decision 1: Adapt `BookingModal` instead of creating `EventPreviewModal`**
  - *Rationale*: Reusing `BookingModal` ensures the styling, layout components, and animation details match legacy/member views perfectly, and avoids code duplication. Since it uses `useLiveData()`, checking if a user is a guest can be done inside the modal using `!live.profile.email`.
  - *Alternatives considered*: Creating a brand new `EventPreviewModal` component. This was rejected because it introduces redundant styling and structure.
- **Decision 2: Local State in `PublicDiscover`**
  - *Rationale*: Storing the chosen event in a local state variable `selectedPublicEvent` in `PublicDiscover` keeps the public page concerns separate and ensures clean state cleanup when the modal closes.
  - *Alternatives considered*: Lifting the state to `VisualSystemAppContent`. Since guest preview is only relevant to the discover view, local state in `PublicDiscover` is cleaner.
- **Decision 3: Redirect with Callback URL**
  - *Rationale*: Redirecting to `/?callbackURL=/discover` allows guests who decide to join or sign in to be seamlessly brought back to the discover page after authenticating.

## Risks / Trade-offs

- **[Risk]** Reusing `BookingModal` might accidentally expose authenticated flows to unauthenticated users if state checks fail.
  - *Mitigation*: Ensure `!live.profile.email` is robustly checked, and explicitly omit the booking action logic/buttons from the DOM when true.
