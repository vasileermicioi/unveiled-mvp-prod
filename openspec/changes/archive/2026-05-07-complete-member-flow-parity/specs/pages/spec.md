## ADDED Requirements

### Requirement: Member Onboarding Route Flow
The app SHALL route authenticated members with incomplete onboarding or profile state through the visible onboarding flow before regular member discovery.

#### Scenario: New member signs up
- **WHEN** a visitor completes member signup and their member profile is incomplete
- **THEN** the app routes them to onboarding instead of regular discovery

#### Scenario: Onboarding finishes
- **WHEN** a member finishes or skips onboarding successfully
- **THEN** the app routes them to member discovery

### Requirement: Member Discovery And Saved Pages Use Live State
The app SHALL render member discovery and saved-event pages from route-owned live data and preserve visible filter, count, and empty-state behavior.

#### Scenario: Member filters discovery
- **WHEN** a member selects category, partner, start date, or end date filters
- **THEN** event cards, active range label, result count, and active filter count update from the filtered result

#### Scenario: Member opens saved page
- **WHEN** a member opens the saved-events route
- **THEN** only their saved upcoming events render
- **AND** the saved empty state renders when no saved events match

### Requirement: Member Event Modal Actions
The app SHALL connect the member event detail modal to real booking and waitlist actions with visible result states.

#### Scenario: Booking succeeds in modal
- **WHEN** an active member books an event with available capacity and sufficient credits
- **THEN** the modal shows booking success, redemption code or voucher data, total credits, copy affordance, calendar affordance, and return-to-feed action

#### Scenario: Booking is blocked in modal
- **WHEN** membership, credits, capacity, ticket quantity, event state, or redemption setup blocks booking
- **THEN** the modal shows a safe failure message
- **AND** stale redemption data is not displayed

#### Scenario: Waitlist succeeds in modal
- **WHEN** a member joins an available waitlist from the modal
- **THEN** the modal shows waitlist success
- **AND** no booking success redemption data is displayed

### Requirement: Member Bookings Profile And Membership Pages
The app SHALL render bookings, profile, preferences, billing, newsletter, and membership pages from authorized server data and refresh them after member mutations.

#### Scenario: Bookings page renders member tickets
- **WHEN** a member opens the bookings page
- **THEN** confirmed and used bookings display event title, image, date, address, ticket count, redemption data, booking status, and checked-in timestamp when present

#### Scenario: Profile page saves member data
- **WHEN** a member saves profile, preference, billing address, newsletter, or language changes
- **THEN** the page validates fields server-side, persists the change, and refreshes profile and shell state

#### Scenario: Membership page renders gated state
- **WHEN** a member has unpaid, past-due, or admin-frozen membership state
- **THEN** member pages show the visible membership gate behavior
- **AND** booking actions are disabled or rejected safely
