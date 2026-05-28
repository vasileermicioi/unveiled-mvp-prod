## Purpose
Define production page behavior, route ownership, and parity coverage for public, member, partner, admin, and venue surfaces.
## Requirements
### Requirement: Discovery Pages Coordinate Map And Filters
The app SHALL coordinate discovery and member discovery map surfaces so opening the map closes filters and preserves a usable event list.

#### Scenario: Discovery map opens
- **WHEN** a user opens the map panel from discovery or member discovery
- **THEN** the filter panel closes
- **AND** the map panel renders a loading, configured, or safe fallback state without hiding the event list

#### Scenario: Map selection opens event context
- **WHEN** a user selects a visible event marker
- **THEN** the page surfaces the selected event context and exposes the action to open the event details view or booking modal

#### Scenario: Map provider is unavailable
- **WHEN** map provider configuration is missing or map loading fails
- **THEN** the page renders a safe visible fallback and keeps the event list usable

### Requirement: Partner Page Uses Live Operations Data
The partner page SHALL render the existing partner portal surface from live partner-scoped data and authorized operations.

#### Scenario: Partner page initial render is scoped
- **WHEN** an authenticated partner opens `/partner`
- **THEN** the page loads only the partner details, QR token display state, event options, guest rows, and export/check-in state for the viewer's linked partner.

#### Scenario: Partner page check-in updates row
- **WHEN** a partner check-in action succeeds from a guest row
- **THEN** the page refreshes the affected guest row so used status and checked-in timestamp are visible without showing stale availability.

#### Scenario: Partner page operation fails safely
- **WHEN** a partner export or check-in action fails validation, ownership, or check-in-window rules
- **THEN** the page displays a safe visible error in the portal surface and keeps protected row details scoped to the partner.

### Requirement: Admin Page Uses Live Operations Data
The admin page SHALL render dashboard, event, partner, and member management surfaces from authorized live admin data. The mounted view SHALL be determined by the URL query parameter state.

#### Scenario: Admin dashboard renders live counts
- **WHEN** an authorized admin opens the dashboard tab
- **THEN** dashboard counts, recent booking rows, export partner options, and export controls render from admin-authorized server data.

#### Scenario: Admin events tab mutates live events
- **WHEN** an admin saves, deletes, exports, edits, or series-creates events
- **THEN** the page submits the matching operation, renders safe failures in the event surface, and refreshes affected event rows and dashboard/public discovery data after success.

#### Scenario: Admin partners tab mutates live partners
- **WHEN** an admin saves, deletes, rotates QR token state, or provisions portal access for a partner
- **THEN** the page submits the matching operation, renders safe failures in the partner surface, and refreshes affected partner rows and public/partner display data after success.

#### Scenario: Admin members tab mutates live members
- **WHEN** an admin refreshes member rows, expands details, freezes or unfreezes a member, or adjusts credits
- **THEN** the page uses authorized live data and refreshes affected member, profile, ledger, and eligibility views after success.

#### Scenario: Admin page URL tab state synchronizes
- **WHEN** an admin clicks an admin navigation tab, or deep-links directly to `/admin?tab=partners`
- **THEN** the browser URL parameter reflects the selected tab (e.g. `tab=partners`) and only the active tab's view component is mounted.

### Requirement: Route Parity Smoke Coverage
The app SHALL have automated regression coverage for every legacy-visible route surface.

#### Scenario: Route smoke suite covers owned surfaces
- **WHEN** the parity route suite executes against seeded app data
- **THEN** public, member, partner, admin, and venue check-in routes render their expected visible landmarks or redirect according to route ownership rules.

#### Scenario: Unauthorized route requests are asserted
- **WHEN** the suite requests a protected route as the wrong role
- **THEN** the expected redirect target or safe authorization state is asserted before protected route content is treated as visible.

#### Scenario: Core route landmarks remain visible
- **WHEN** landing, discover, membership, app discovery, saved, bookings, profile, partner, admin, and venue check-in surfaces render
- **THEN** the suite asserts the core visible labels, CTA regions, lists, or tables needed to match the legacy-visible route contract.

### Requirement: Booking Success Calendar UI Parity
Member-facing booking success surfaces SHALL render the legacy-visible calendar download behavior for confirmed bookings with calendar metadata.

#### Scenario: Confirmed booking success renders save the date
- **WHEN** a member successfully books an event with valid date and venue metadata from the booking modal
- **THEN** the success state renders a visible "save the date" calendar affordance alongside the redemption outcome

#### Scenario: Voucher success keeps calendar separate
- **WHEN** a voucher event booking succeeds
- **THEN** the success state renders the voucher code and optional partner URL for the current booking
- **AND** the calendar affordance downloads event calendar data rather than voucher redemption data

#### Scenario: Secret-code success keeps calendar separate
- **WHEN** a secret-code event booking succeeds
- **THEN** the success state renders the secret code for the current booking
- **AND** the calendar affordance downloads event calendar data without changing or copying the secret code

#### Scenario: Waitlist success does not show stale calendar action
- **WHEN** a member reaches a waitlist success state after a previous confirmed booking attempt in the same modal lifecycle
- **THEN** the page does not show stale confirmed-booking redemption data or a stale calendar download for the prior booking

#### Scenario: Calendar action is covered by regression tests
- **WHEN** the seeded booking success flow is exercised by automated regression coverage
- **THEN** the suite asserts the visible calendar affordance or records unit-level coverage for calendar generation when browser download verification is not feasible

### Requirement: Bilingual Route Copy Parity
Public and member page surfaces SHALL render legacy-equivalent German and English landmarks, CTAs, form copy, empty states, and modal copy according to the selected language.

#### Scenario: Public routes render selected language
- **WHEN** a guest views landing, discovery, how-it-works, membership, FAQ, login, or signup surfaces after selecting `DE` or `EN`
- **THEN** the visible navigation, headings, CTA labels, form labels, validation copy, and empty-state landmarks render in the selected language

#### Scenario: Member routes render selected language
- **WHEN** an authenticated member views discovery, saved, bookings, profile, onboarding, or membership-related member surfaces after selecting `DE` or `EN`
- **THEN** the visible route landmarks, controls, form labels, status messages, and empty states render in the selected language

#### Scenario: Booking outcomes render selected language
- **WHEN** booking confirmation, waitlist success, voucher redemption, secret-code redemption, or safe booking failure state is shown
- **THEN** the visible result heading, body copy, redemption labels, support copy, and actions render in the selected language
- **AND** the state does not reuse stale copy from a previous booking outcome or previous language selection

#### Scenario: Bilingual landmarks are covered by parity smoke
- **WHEN** the parity smoke suite runs against seeded data
- **THEN** it asserts at least one German and one English public route landmark
- **AND** it asserts at least one German and one English authenticated member route landmark

#### Scenario: FAQ routes render specific answers
- **WHEN** a user views the FAQ page after selecting `DE` or `EN`
- **THEN** the FAQ accordion items display specific translated answers matching each respective question
- **AND** the page does not display the single static placeholder text

### Requirement: Visual Parity Regression Coverage
The app SHALL have automated screenshot-based visual regression coverage for critical public, member, partner, and admin route surfaces across both desktop and mobile viewports.

#### Scenario: Public route screenshots are captured
- **WHEN** the visual parity suite runs
- **THEN** landing, discover, membership, how-it-works, and FAQ routes match approved desktop and mobile baselines

#### Scenario: Authenticated route screenshots are captured
- **WHEN** the suite runs with seeded member, partner, and admin users
- **THEN** member discovery, saved, bookings, profile, partner, and admin route screenshots match approved desktop and mobile baselines

#### Scenario: Visual baseline update is intentional
- **WHEN** a screenshot differs from its baseline
- **THEN** the test output identifies the route, viewport, and diff artifact so visual changes can be reviewed before baseline updates

### Requirement: Legacy QR Code Check-In Redirection
The app SHALL detect legacy query parameters (`venuePartner` and `venueToken`) on the root route and redirect the user automatically to the migrated venue check-in route.

#### Scenario: Legacy QR parameters redirect successfully
- **WHEN** a user requests the root route `/` with both `venuePartner` and `venueToken` query parameters
- **THEN** the app performs a server-side redirect to `/venue-check-in/[venuePartner]?token=[venueToken]`
- **AND** the redirection handles both authenticated users and guest users.

### Requirement: Public Discover Page Event Preview Modal
The public discover page SHALL allow guest/unauthenticated users to click events to view a detailed preview modal containing the title, category, description, timing, and venue, with a call-to-action to register or sign in instead of booking options.

#### Scenario: Guest views event details preview modal
- **WHEN** a guest/unauthenticated user clicks an event card or map marker on the public discover page
- **THEN** the page opens a detailed event preview modal showing the event information
- **AND** the modal displays a premium call-to-action button redirecting the user to sign in
- **AND** the modal hides all ticket count selection and booking action buttons

