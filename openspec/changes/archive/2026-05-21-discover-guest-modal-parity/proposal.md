## Why

On the public discover page (`/discover`), guest users can explore events. However, clicking an event card or map marker triggers `onOpen={() => setView("member")}`. Since guests do not have an active member session, this action attempts to redirect them to the member dashboard, resulting in them being bounced back to the authentication screen without seeing the event details. In legacy parity, guest users could click an event card to view its description, timing, and details in a modal, with a sign-in prompt instead of the booking confirm button.

## What Changes

- Update `PublicDiscover` in `visual-system-app.tsx` to handle card and map marker clicks by setting a local state variable (e.g., `selectedPublicEvent`) representing the chosen event.
- Render the `BookingModal` (or a styled `EventPreviewModal`) when `selectedPublicEvent` is active.
- Inside the modal, if the current session is a guest/unauthenticated user:
  - Display the full event title, category, description, timing, and partner details.
  - Hide the "ticket count select" and "Book event" buttons.
  - Render a premium call-to-action button (e.g., "Join Unveiled to Book") that redirects the guest to the sign-in/access page.

## Capabilities

### New Capabilities

### Modified Capabilities
- `pages`: Support event modal previews for guest users on unauthenticated landing routes.

## Impact

- `src/components/unveiled/visual-system-app.tsx`: Modify card and map click callbacks in `PublicDiscover` to set modal state, and update the event detail view layout to handle guest/unauthenticated states gracefully.
