## MODIFIED Requirements

### Requirement: Booking Modal
This requirement SHALL use legacy reference path: `_old_app/components/BookingModal.tsx`.

The booking modal SHALL visually match the full-screen event detail and redemption flow and SHALL submit booking and waitlist actions through the transactional backend outcomes.

#### Scenario: Visible elements render
- **WHEN** an event is opened
- **THEN** a full-screen brand-yellow modal displays logo, close button, category/partner line, event title, description, location, ticket quantity selector, total credits, primary action, and no-refunds copy

#### Scenario: Displayed fields render
- **WHEN** the modal opens
- **THEN** displayed fields are event category, partner name, title, description, address, credit price, selected ticket count, total credits, and available redemption-related labels after success

#### Scenario: User interactions render
- **WHEN** plus or minus controls are used
- **THEN** ticket quantity visibly changes between 1 and 3 and total credits updates
- **WHEN** close is selected
- **THEN** the modal disappears

#### Scenario: Booking action renders typed failures
- **WHEN** the transactional booking action returns sold out, insufficient credits, inactive subscription, duplicate idempotency key conflict, invalid event, invalid quantity, or unsupported redemption setup
- **THEN** the modal renders the matching visible failure message and any available next action without showing a confirmed booking success panel

#### Scenario: Waitlist action renders success
- **WHEN** the transactional waitlist action returns a waitlist success result
- **THEN** the success headline uses waitlist copy and a return-to-feed action remains visible

#### Scenario: Success states render
- **WHEN** booking success is shown for password entry
- **THEN** a white bordered code panel shows password label, code, copy action, and explanatory text
- **WHEN** booking success is shown for voucher entry
- **THEN** a dark code panel shows voucher code, copy action, partner ticket link, visible URL, and missing-partner-website fallback when needed
- **AND** calendar download, ticket support email, and return-to-feed action are visible

#### Scenario: Visual parity is preserved
- **WHEN** the modal renders on desktop
- **THEN** event copy and ticket controls use a two-column layout with large spacing
- **WHEN** it renders on mobile
- **THEN** sections stack and remain scrollable inside the full-screen modal

#### Scenario: Data requirements are met
- **WHEN** booking modal renders
- **THEN** required display data is selected event display data, viewer booking gate labels, ticket quantity, total credit calculation, redemption type, redemption code, redemption URL, copied state, loading state, support email, waitlist availability, typed booking failure state, and idempotent action result state

## ADDED Requirements

### Requirement: Admin Booking And Credit Actions
Admin pages SHALL submit admin ticket creation and credit adjustment flows through authorized transactional backend actions and render their outcomes.

#### Scenario: Admin ticket action renders result
- **WHEN** an authorized admin creates a ticket for a member and event
- **THEN** the admin page renders the created booking result or a typed failure state without requiring a page redesign

#### Scenario: Admin credit adjustment renders result
- **WHEN** an authorized admin adjusts a member credit balance with a reason
- **THEN** the admin page renders the updated credit balance and ledger result or a typed failure state without requiring a page redesign
