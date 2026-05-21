## 1. UI State and Event Handling in PublicDiscover

- [x] 1.1 Declare `selectedPublicEvent` state variable in `PublicDiscover` component in `src/components/unveiled/visual-system-app.tsx`
- [x] 1.2 Update the `onOpenEvent` callback in `DiscoveryMapPanel` within `PublicDiscover` to set `selectedPublicEvent` state instead of calling `setView("member")`
- [x] 1.3 Update the `onOpen` callback in `EventCard` within `PublicDiscover`'s event list to set `selectedPublicEvent` state instead of calling `setView("member")`
- [x] 1.4 Render `BookingModal` conditionally inside `PublicDiscover` when `selectedPublicEvent` is not null, passing it as `event` and updating the state to `null` on close

## 2. Modal Customization for Guests

- [x] 2.1 Retrieve the login/session status by checking if `!live.profile.email` inside `BookingModal` to define `isGuest`
- [x] 2.2 Reorganize the event info details in `BookingModal` left column to show a side-by-side location and timing grid section (using `event.dateLabel` for timing and `event.address` for location)
- [x] 2.3 Hide the billing/membership gate warning and failure message panel on the left column when the user is a guest
- [x] 2.4 In the right-hand panel of `BookingModal`, if the user is a guest, hide the ticket count selector, divider, total credit cost, and booking button
- [x] 2.5 In the right-hand panel of `BookingModal`, if the user is a guest, render the "Join Unveiled to Book" call-to-action button, which redirects to `/?callbackURL=/discover`

## 3. Verification and Testing

- [x] 3.1 Run typescript type check `bun run check` to verify no compilation errors
- [x] 3.2 Run parity tests `bun run test:parity` to make sure all existing tests pass
