## Purpose

Define visible page behavior using `_old_app/` only as a visual UI and displayed-data reference. These specs describe what users see, what they can interact with, and what displayed data is required.
## Requirements
### Requirement: Landing Page
This requirement SHALL use legacy reference path: `_old_app/App.tsx`.

The landing page SHALL visually match the legacy landing experience while using the target app architecture.

#### Scenario: Visible elements render
- **WHEN** the landing page is shown
- **THEN** it displays the Unveiled logo/nav, headline `Unveiled Berlin`, short membership value proposition, Discover CTA, How it works CTA, live-synced trust line, and a bordered login/register form
- **AND** the form shows segmented Login/Register controls, high-contrast error/notice panels, field labels, primary submit CTA, Guest Explorer action, Admin Access visual action, and trust labels `Member-owned`, `Verified Events`, `Berlin Focused`

#### Scenario: Displayed fields render
- **WHEN** Login mode is active
- **THEN** visible fields are Email and Password
- **AND** a Forgot password action is visible
- **WHEN** Register mode is active
- **THEN** visible fields are First Name, Last Name, Email, and Password

#### Scenario: User interactions render feedback
- **WHEN** the user switches Login/Register mode
- **THEN** the active segment uses dark fill and inactive segment is muted
- **WHEN** visible validation or status messages exist
- **THEN** messages appear above fields in high-contrast panels with compact uppercase text and icon treatment where shown

#### Scenario: Visual parity is preserved
- **WHEN** the landing form renders
- **THEN** it uses a white panel, thick dark border, offset shadow, compact uppercase labels, grey field backgrounds, and a full-width dark primary CTA

#### Scenario: Data requirements are met
- **WHEN** the landing page renders
- **THEN** required display data is localized hero copy, CTA labels, form labels, visible error/notice text, and optional venue-check-in message text

### Requirement: Public Discover Page
This requirement SHALL use legacy reference path: `_old_app/components/AccessPage.tsx`.

The public discover page SHALL preview membership value, current event access, and active partner venues.

#### Scenario: Visible elements render
- **WHEN** the page is shown
- **THEN** it displays a bordered hero panel with eyebrow text, large headline, support copy, membership CTA, browse-live-events CTA, and three stacked stat cards
- **AND** it displays three value cards, featured events, membership category cards, missing-favorite-venue support panel, and partner venue cards

#### Scenario: Displayed fields render
- **WHEN** stats render
- **THEN** visible fields are upcoming event count, active partner venue count, and membership value copy
- **WHEN** partner cards render
- **THEN** visible fields are partner logo or initial, partner name, and partner address

#### Scenario: User interactions render
- **WHEN** membership CTA is activated
- **THEN** the user is taken toward membership
- **WHEN** browse-live-events CTA or event card CTA is activated
- **THEN** the event browsing or event-detail experience opens visibly

#### Scenario: Empty state renders
- **WHEN** there are no upcoming featured events
- **THEN** a dashed bordered empty state says no upcoming events are available

#### Scenario: Visual parity is preserved
- **WHEN** the page is displayed on desktop
- **THEN** the hero uses a two-column layout with text left and stat cards right
- **WHEN** displayed on mobile
- **THEN** sections stack, category cards use a compact grid, and event cards collapse responsively

#### Scenario: Data requirements are met
- **WHEN** the page renders
- **THEN** required display data is upcoming events, active partners, membership category labels, support email, and localized section copy

### Requirement: How It Works Page
This requirement SHALL use legacy reference path: `_old_app/components/HowItWorksPage.tsx`.

The how-it-works page SHALL explain the product through a simple visually branded sequence.

#### Scenario: Visible elements render
- **WHEN** the page is shown
- **THEN** it displays an intro panel with eyebrow, headline, and support copy
- **AND** it displays three step cards and a dark value-point band

#### Scenario: Displayed fields render
- **WHEN** step cards render
- **THEN** each card displays a numbered title and body copy
- **WHEN** value points render
- **THEN** three compact uppercase value statements are visible

#### Scenario: Visual parity is preserved
- **WHEN** the page renders
- **THEN** it uses thick borders, white cards, dark/yellow contrast, uppercase headings, and a three-column desktop step grid that stacks on mobile

#### Scenario: Data requirements are met
- **WHEN** the page renders
- **THEN** required display data is localized intro copy, three step titles, three step bodies, and three value-point labels

### Requirement: FAQ Page And Help Section
This requirement SHALL use legacy reference path: `_old_app/components/FaqPage.tsx`, `_old_app/components/HelpSection.tsx`.

The FAQ page SHALL present support content and a visible accordion interaction.

#### Scenario: Visible elements render
- **WHEN** the FAQ page is shown
- **THEN** it displays Support eyebrow, FAQ heading, support summary copy, help panel, support email link, accordion questions, answers, and Back CTA

#### Scenario: User interactions render
- **WHEN** a question row is selected
- **THEN** the selected answer opens below the question
- **AND** the open question row uses dark fill with white text
- **WHEN** the open question is selected again
- **THEN** the answer closes

#### Scenario: Visual parity is preserved
- **WHEN** the help panel renders
- **THEN** it uses a white bordered panel with offset shadow, compact uppercase section label, and bordered question rows

#### Scenario: Data requirements are met
- **WHEN** FAQ content renders
- **THEN** required display data is localized questions, answers, support email, page summary copy, and Back CTA label

### Requirement: Onboarding Page
This requirement SHALL use legacy reference path: `_old_app/components/Onboarding.tsx`.

The onboarding page SHALL visually match the four-step preference wizard.

#### Scenario: Visible elements render
- **WHEN** onboarding is shown
- **THEN** it displays step counter, percentage, progress bar, headline, subtitle, step content, Back action when applicable, and primary Next/Skip/Finish CTA

#### Scenario: Displayed fields render
- **WHEN** step one is active
- **THEN** age group buttons `18-25`, `26-35`, `36-50`, and `50+` are visible
- **WHEN** step two is active
- **THEN** interest and mood chips are visible
- **WHEN** step three is active
- **THEN** district chips and max-distance slider are visible
- **WHEN** step four is active
- **THEN** timing chips, preferred day buttons, language chips, and accessibility toggle are visible

#### Scenario: User interactions render
- **WHEN** a chip, age button, day button, language button, or accessibility toggle is selected
- **THEN** selected state is visually distinct from unselected state
- **WHEN** max distance changes
- **THEN** the visible kilometer value updates
- **WHEN** no age group is selected on step one
- **THEN** the primary CTA reads as Skip

#### Scenario: Visual parity is preserved
- **WHEN** the wizard renders
- **THEN** it uses a centered narrow layout, animated step transitions, rounded preference chips, and a dark primary CTA with brand-yellow hover treatment

#### Scenario: Data requirements are met
- **WHEN** onboarding renders
- **THEN** required display data is localized labels, age options, interest options, mood options, district options, distance range/value, timing options, day options, language options, accessibility state, and submit/loading text

### Requirement: Membership Page
This requirement SHALL use legacy reference path: `_old_app/components/CheckoutView.tsx`.

The membership page SHALL display the plan, Stripe-backed payment controls, status states, and support links as visible UI behavior.

#### Scenario: Visible elements render
- **WHEN** membership page is shown
- **THEN** it displays a bordered white panel with membership eyebrow, headline, `Basic Berlin` plan, `29€/mo`, perk list, payment method controls, promo-code field, submit CTA, guarantee copy, support email, and FAQ link

#### Scenario: Express payment methods render first
- **WHEN** Stripe reports Apple Pay or Google Pay availability for the current browser and device context
- **THEN** the available express payment action appears at the top of the payment section as a large prominent action visible without scrolling

#### Scenario: PayPal renders as a separate option
- **WHEN** PayPal is enabled and available for the Stripe subscription checkout flow
- **THEN** PayPal appears as its own separately highlighted button below express payment actions
- **AND** PayPal is not hidden inside a generic dropdown or standard payment method selector

#### Scenario: Standard payment methods render separately
- **WHEN** standard payment methods are available
- **THEN** card payment and SEPA Direct Debit appear in a separate lower section using tabs or a simple selector
- **AND** selecting card shows Stripe card fields
- **AND** selecting SEPA Direct Debit shows Stripe-supported mandate and bank account collection controls

#### Scenario: No payment method is preselected
- **WHEN** the membership page first loads
- **THEN** no payment method is selected by default
- **AND** the user must intentionally choose express payment, PayPal, card, or SEPA before submitting

#### Scenario: Validation messages render
- **WHEN** Stripe payment controls, promo-code input, or server validation returns a visible validation error
- **THEN** field-level or method-level messages appear near the related control in small bold uppercase text

#### Scenario: Status states render
- **WHEN** frozen status is shown
- **THEN** a dark frozen-account notice appears and payment controls are disabled
- **WHEN** already-active status is shown
- **THEN** a success panel with celebration icon, success title/subtitle, and Enter The Void CTA appears
- **WHEN** submission is loading
- **THEN** the submit CTA shows a spinner

#### Scenario: Visual parity is preserved
- **WHEN** the page renders
- **THEN** it uses a white bordered panel, left plan/perk column, right payment column, dark/yellow CTA treatment, compact uppercase labels, and responsive single-column mobile layout

#### Scenario: Data requirements are met
- **WHEN** membership UI renders
- **THEN** required display data is plan name, plan price, perk labels, selected payment method when present, promo code value, visible field validation messages, frozen/success copy, guarantee text, provider availability flags, billing action state, and support email

### Requirement: App Discovery And Saved Pages
This requirement SHALL use legacy reference path: `_old_app/App.tsx`, `_old_app/components/EventCard.tsx`, `_old_app/components/EventMap.tsx`.

The discovery and saved pages SHALL show filterable event grids, optional map, membership status banner, and empty states.

#### Scenario: Visible elements render
- **WHEN** discovery is shown
- **THEN** it displays optional venue-check-in message, optional membership gate banner, active range summary, visible event count, filter toggle, map toggle, optional filter panel, optional map panel, event grid, and no-results state

#### Scenario: Filter fields render
- **WHEN** the filter panel is open
- **THEN** visible controls are Category select, Kulturhaus/venue select, From date, To date, Reset action, and Apply Filters action
- **AND** the filter toggle shows active filter count when filters are selected

#### Scenario: Sorting and grouping behavior is visible
- **WHEN** events are displayed
- **THEN** they appear as event cards in a responsive grid
- **AND** the active range label reflects Today, saved upcoming events, from date, until date, or date range

#### Scenario: User interactions render
- **WHEN** filter toggle is opened
- **THEN** the map panel closes
- **WHEN** map toggle is opened
- **THEN** the filter panel closes
- **WHEN** Reset is selected
- **THEN** selected filters visibly clear
- **WHEN** an event card is selected
- **THEN** the booking/detail modal opens

#### Scenario: Loading/error/empty states render
- **WHEN** the map is loading
- **THEN** a branded loading state appears in the reserved map area
- **WHEN** map loading fails
- **THEN** a dark error state with retry action appears
- **WHEN** no events match filters
- **THEN** a large dashed no-results state appears

#### Scenario: Visual parity is preserved
- **WHEN** desktop discovery renders
- **THEN** controls are large bordered horizontal panels and cards use a three-column grid
- **WHEN** mobile discovery renders
- **THEN** controls stack vertically and cards collapse to one column

#### Scenario: Data requirements are met
- **WHEN** discovery renders
- **THEN** required display data is event list, saved-event indicators, category options, partner options, selected date filters, active range label, visible count, map coordinates, and localized banner/empty text

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

### Requirement: Bookings Page
This requirement SHALL use legacy reference path: `_old_app/components/BookingsView.tsx`.

The bookings page SHALL display ticket cards or a clear empty state.

#### Scenario: Empty state renders
- **WHEN** no bookings are visible
- **THEN** a dashed bordered centered empty state shows ticket icon, headline, explanatory copy, and Back to Feed CTA

#### Scenario: Booking list renders
- **WHEN** bookings exist
- **THEN** the page displays heading, active booking count, support panel, support email, FAQ action, and a responsive grid of booking cards

#### Scenario: Booking card renders
- **WHEN** a booking card appears
- **THEN** visible elements include event image, event title, ticket count badge, formatted event date, event address, ticket-code label, code value, optional copy button, venue QR guidance, and status badge

#### Scenario: User interactions render
- **WHEN** code copy is selected
- **THEN** the copy icon changes to a check state temporarily
- **WHEN** FAQ action is selected
- **THEN** FAQ content becomes available visibly

#### Scenario: Visual parity is preserved
- **WHEN** booking cards render
- **THEN** cards use bordered white panels, image blocks with grayscale hover behavior, compact uppercase metadata, and two-column desktop grid with one-column mobile layout

#### Scenario: Data requirements are met
- **WHEN** bookings render
- **THEN** required display data is booking count, booking status, ticket count, redemption code, checked-in timestamp when present, event image, event title, event date label, event address, and support email

### Requirement: Profile Page
This requirement SHALL use legacy reference path: `_old_app/components/ProfileView.tsx`.

The profile page SHALL display identity, wallet, billing, and preference editing panels.

#### Scenario: Visible elements render
- **WHEN** profile is shown
- **THEN** it displays page heading, `Identity // Billing // Vibes` subtitle, wallet card with credits, Refill CTA, Identity panel, Billing panel, and Vibes panel

#### Scenario: Displayed fields render
- **WHEN** Identity panel renders
- **THEN** fields are First Name, Last Name, Email, and Save Account CTA
- **WHEN** Billing panel renders
- **THEN** it shows current plan, active badge, next bill date, billing address field, payment method choices, Apply Changes CTA, and Cancel Subscription action
- **WHEN** Vibes panel renders
- **THEN** it shows age group buttons, interest chips, mood chips, district chips, radius slider, timing chips, preferred day buttons, language chips, accessibility toggle, and Save Vibes CTA

#### Scenario: User interactions render
- **WHEN** payment method or preference controls are selected
- **THEN** selected states are visually distinct
- **WHEN** billing update is loading
- **THEN** Apply Changes shows a spinner

#### Scenario: Visual parity is preserved
- **WHEN** desktop profile renders
- **THEN** Identity, Billing, and Vibes appear as three columns
- **WHEN** mobile profile renders
- **THEN** panels stack vertically

#### Scenario: Data requirements are met
- **WHEN** profile renders
- **THEN** required display data is first name, last name, email, credits, billing address, payment method, plan label, status label, derived next bill date, and preference values

### Requirement: Partner Portal Page
This requirement SHALL use legacy reference path: `_old_app/components/PartnerPortal.tsx`.

The partner portal SHALL display venue identity, QR link, guest search/filter/export controls, and guest check-in rows.

#### Scenario: Visible elements render
- **WHEN** partner portal is shown
- **THEN** it displays portal label, partner name, address, total guests card, venue QR check-in link panel, search input, event filter select, Download Codes action, and guest list panel

#### Scenario: Displayed fields render
- **WHEN** guest row renders
- **THEN** it displays guest short ID, ticket count, code, event title, check-in status text, optional checked-in timestamp, and check-in button

#### Scenario: User interactions render
- **WHEN** Copy Venue Link is selected
- **THEN** the button temporarily reads Copied
- **WHEN** search text changes
- **THEN** guest rows visibly filter by booking/code text
- **WHEN** event filter changes
- **THEN** guest rows visibly filter by event
- **WHEN** Download Codes is disabled
- **THEN** it appears muted
- **WHEN** check-in is not available
- **THEN** the row action appears disabled with Not Open Yet or checked-in state

#### Scenario: Visual parity is preserved
- **WHEN** partner portal renders
- **THEN** it uses softer rounded white operational panels, slate/indigo accents, a centered medium-width container, and guest rows that stack on mobile and align horizontally on wider screens

#### Scenario: Data requirements are met
- **WHEN** partner portal renders
- **THEN** required display data is partner name, partner address, venue QR URL or missing-token text, total guest count, event options, guest booking rows, booking codes, ticket counts, booking statuses, event titles, and checked-in timestamps

### Requirement: Admin Page
This requirement SHALL use legacy reference path: `_old_app/components/AdminPanel.tsx`.

The admin page SHALL display dashboard, events, partners, and members management surfaces with visible operational controls.

#### Scenario: Dashboard visible elements render
- **WHEN** dashboard tab is active
- **THEN** it displays Admin Central heading, quick actions, stat cards, recent bookings panel, export partner select, and CSV export action
- **AND** stat cards show total bookings, credits burned, active partners, and total guests

#### Scenario: Events manager visible elements render
- **WHEN** events tab is active
- **THEN** it displays Events Library heading, Add New Event toggle, optional event form, and event rows with image, title, partner, date, code strategy, ticket availability, credit price, export, edit, and delete actions

#### Scenario: Event form visible fields render
- **WHEN** event form is open
- **THEN** visible controls include title, partner host, credit price, capacity, redemption method, code strategy or voucher fields, description, optional info, accessibility checkbox, language chips/custom language, age group chips, timing mode, single/series mode, date/time fields, venue address display, image URL/upload, image preview, and publish CTA

#### Scenario: Series builder visible fields render
- **WHEN** series mode is active
- **THEN** visible controls include manual slots or date-range mode, start date, end date, weekday buttons, daily time slots, excluded dates, add/remove controls, total occurrence count, and first ten occurrence preview

#### Scenario: Partners manager visible elements render
- **WHEN** partners tab is active
- **THEN** it displays Partner Registry heading, Register New Partner toggle, optional partner form, and partner rows with logo/initial, name, address, contact email, venue QR token, portal login, create portal login action, generate venue QR action, edit action, and delete action

#### Scenario: Partner form visible fields render
- **WHEN** partner form is open
- **THEN** visible fields are Institution Name, Contact Email, Full Venue Address, Logo URL/upload, logo preview, and submit CTA
- **AND** visible validation messages appear below invalid required fields

#### Scenario: Members manager visible elements render
- **WHEN** users tab is active
- **THEN** it displays Membership HQ heading, refresh action, member search field, loading state, empty state, and member rows with name, email, role, subscription status, credits, booking count, event-open count, and expand/collapse label

#### Scenario: Expanded member visible elements render
- **WHEN** a member row is expanded
- **THEN** it displays credit adjustment input, Apply Credits action, Freeze/Unfreeze action, preferences, history counts, past events, waitlist/saved/recent-intel sections, and behavior summaries

#### Scenario: Visual parity is preserved
- **WHEN** admin surfaces render
- **THEN** they use dense bordered operational panels, bold uppercase headings, large stat cards, row dividers, strong action buttons, and responsive form grids

#### Scenario: Data requirements are met
- **WHEN** admin surfaces render
- **THEN** required display data is dashboard metrics, recent booking rows, event rows, partner rows, member rows, form field values/options, loading/empty messages, validation messages, and export-ready visible columns

### Requirement: Pages Consume Shared Shell Structure
Pages SHALL use shared app-shell containers for global layout behavior while retaining ownership of page-specific content.

#### Scenario: Public pages render in shell
- **WHEN** landing, public discover, how-it-works, FAQ, or membership pages render
- **THEN** they use the shared brand frame, navigation, content container, and optional status placement from the app shell
- **AND** their page-specific sections, forms, cards, accordions, and content remain owned by the page implementations

#### Scenario: Member pages render in shell
- **WHEN** discovery, saved, bookings, or profile pages render
- **THEN** they use the shared member navigation variant, content container, and page-level loading/error/empty wrappers where applicable
- **AND** event cards, booking cards, profile panels, and page-specific controls remain owned by page or feature components

#### Scenario: Operational pages render in shell
- **WHEN** partner or admin pages render
- **THEN** they use the shared operational navigation variant and page container
- **AND** operational tabs, filters, export controls, forms, tables, and management workflows remain inside the page content area

#### Scenario: Page content is not migrated by shell work
- **WHEN** the app shell change is implemented
- **THEN** it does not require completing page-specific business workflows, backend data loading, auth behavior, or legacy state-management behavior

### Requirement: Auth-Aware Page Access
Pages SHALL use server-resolved viewer/session state to decide protected rendering and redirects.

#### Scenario: Guest accesses public page
- **WHEN** a guest accesses landing, public discover, how-it-works, FAQ, or membership pages
- **THEN** the page renders without requiring a session.

#### Scenario: Guest accesses member page
- **WHEN** a guest accesses discovery, saved events, bookings, or profile routes that require membership
- **THEN** the page redirects or renders an auth-required state before protected member data is loaded.

#### Scenario: Partner accesses partner page
- **WHEN** a partner viewer accesses partner portal routes
- **THEN** the page renders only partner-owned data after server-side partner ownership is resolved.

#### Scenario: Admin accesses admin page
- **WHEN** an admin viewer accesses admin routes
- **THEN** the page renders only after server-side admin authorization succeeds.

### Requirement: Auth Form Surfaces
Pages SHALL expose migrated auth form behavior backed by Better Auth and domain profile creation.

#### Scenario: Signup form succeeds
- **WHEN** a visitor submits valid signup form data
- **THEN** the page creates the Better Auth identity, creates the default domain profile, and routes the viewer according to onboarding/profile state.

#### Scenario: Login form succeeds
- **WHEN** a visitor submits valid login credentials
- **THEN** the page creates a Better Auth session and routes the viewer according to role and profile state.

#### Scenario: Auth form fails
- **WHEN** signup, login, or recovery submission fails validation or authentication
- **THEN** the page renders a safe user-facing error without leaking protected account details.

### Requirement: Action-Backed Page Form Interactions
Pages with mutating form interactions SHALL submit through typed Astro Actions and render the returned field, form, loading, and success states in the existing page UI.

#### Scenario: Landing auth form submits
- **WHEN** a visitor submits the landing login, register, or password recovery form
- **THEN** the page sends the submission to the matching auth action
- **AND** field errors, safe credential errors, loading state, and success state render in the landing form panel.

#### Scenario: Onboarding preferences submit
- **WHEN** a signed-in user finishes or skips onboarding
- **THEN** the page sends persisted preference and onboarding completion data to an onboarding action
- **AND** validation errors or success state render without losing unsaved visible wizard selections.

#### Scenario: Profile and account forms submit
- **WHEN** a signed-in user updates profile, account, preference, or membership-status inputs
- **THEN** the page sends the mutation to the corresponding action
- **AND** returned field errors, form errors, success notices, and invalidated profile/member queries are reflected in the page.

#### Scenario: Admin and partner forms submit
- **WHEN** an admin or partner submits partner, event, event-series, member-admin, or check-in inputs
- **THEN** the page sends the mutation to the corresponding authorized action
- **AND** authorization failures render as safe form-level errors
- **AND** successful mutations refresh the affected admin, partner, event, booking, or check-in views.

#### Scenario: Discovery filters remain local
- **WHEN** a user changes discovery filters, sorting, map visibility, modal state, or other non-mutating controls
- **THEN** the page updates local or URL-backed state without requiring an Astro Action.

### Requirement: Admin Booking And Credit Actions
Admin pages SHALL submit admin ticket creation and credit adjustment flows through authorized transactional backend actions and render their outcomes.

#### Scenario: Admin ticket action renders result
- **WHEN** an authorized admin creates a ticket for a member and event
- **THEN** the admin page renders the created booking result or a typed failure state without requiring a page redesign

#### Scenario: Admin credit adjustment renders result
- **WHEN** an authorized admin adjusts a member credit balance with a reason
- **THEN** the admin page renders the updated credit balance and ledger result or a typed failure state without requiring a page redesign

### Requirement: Operational Pages Execute Server Operations
Admin and partner pages SHALL submit operational mutations through authorized server actions and render returned results in the existing page surfaces.

#### Scenario: Admin event management submits
- **WHEN** an admin creates, updates, deletes, or generates a series of events from the admin page
- **THEN** the page submits to the matching event operation, renders validation or authorization errors in the event form area, and refreshes affected event rows after success.

#### Scenario: Admin partner management submits
- **WHEN** an admin creates, updates, deletes, generates a venue QR token, or provisions portal access for a partner
- **THEN** the page submits to the matching partner operation, renders validation or authorization errors in the partner form or row area, and refreshes affected partner rows after success.

#### Scenario: Partner check-in submits
- **WHEN** a partner selects an available check-in action for a guest row
- **THEN** the partner portal submits to the manual check-in operation, renders a safe error if the operation fails, and refreshes the guest row status after success.

#### Scenario: Admin member operation submits
- **WHEN** an admin refreshes users, freezes or unfreezes a member, or applies a credit adjustment
- **THEN** the page submits to the matching member operation and renders updated member status, credit balance, and ledger/history display data after success.

### Requirement: Venue QR Check-In Page Flow
Pages SHALL support a member-facing venue QR check-in flow backed by the venue token operation.

#### Scenario: Member opens venue QR link
- **WHEN** a signed-in member opens a valid venue QR/check-in link
- **THEN** the page submits or offers a check-in action for that token and renders the resulting success or no-eligible-booking message.

#### Scenario: Guest opens venue QR link
- **WHEN** a guest opens a venue QR/check-in link
- **THEN** the page routes the guest to authentication before protected booking eligibility is evaluated.

#### Scenario: Venue QR check-in succeeds
- **WHEN** the member venue QR operation marks a booking used
- **THEN** the page renders a success state and affected booking/check-in views can show the checked-in status.

### Requirement: Billing Recovery Page Behavior
Member-facing pages SHALL preserve read access while clearly disabling booking actions when subscription billing freezes credits.

#### Scenario: Frozen member views bookings
- **WHEN** a frozen or past-due member opens profile, bookings, or credit ledger pages
- **THEN** those pages remain visible
- **AND** billing status and recovery support copy are visible

#### Scenario: Frozen member attempts booking
- **WHEN** a frozen or past-due member opens an event booking action
- **THEN** the booking action is disabled or rejected with a billing recovery message
- **AND** existing bookings remain visible

### Requirement: Route-Level Data Ownership
Pages SHALL own their initial data loading through server loaders and pass only display-ready data to child UI.

#### Scenario: Public page owns public loader
- **WHEN** a public page renders discovery, partner preview, how-it-works, FAQ, or landing data
- **THEN** the route loads or selects its initial display data server-side and passes stable display-ready props to components.

#### Scenario: Member page owns member loader
- **WHEN** a member page renders discovery with saved state, bookings, profile, wallet, preferences, or onboarding state
- **THEN** the route verifies the viewer and loads member-owned display data before rendering protected UI.

#### Scenario: Partner page owns partner loader
- **WHEN** a partner portal page renders guest lists, event options, check-in state, or venue identity
- **THEN** the route verifies partner ownership and loads only partner-owned display data.

#### Scenario: Admin page owns admin loader
- **WHEN** an admin page renders dashboards, event management, partner management, member management, or operations data
- **THEN** the route verifies admin role and loads administrative display data through the data access layer.

### Requirement: Hydrated Island Query Integration
Pages with interactive React islands SHALL use shared query keys and initial data consistently.

#### Scenario: Island receives SSR initial data
- **WHEN** a React island is hydrated for an SSR-loaded surface
- **THEN** the page passes initial data and query identity that match the island's TanStack Query fetcher.

#### Scenario: Island refreshes after action
- **WHEN** an island submits an Astro Action or API mutation from a page
- **THEN** the page or island consumes returned invalidation hints so visible route data and hydrated query data refresh coherently.

#### Scenario: Client-only query is used
- **WHEN** a page intentionally defers non-critical or interaction-specific data to a client query
- **THEN** the page still renders a stable initial shell and the island renders loading, empty, and error states that match the page display requirements.

