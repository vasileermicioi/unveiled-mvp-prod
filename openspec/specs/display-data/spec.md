## Purpose

Define UI-visible data only. Field names here are display contracts for pages/components and do not require preserving any non-visual legacy structure.
## Requirements
### Requirement: Page And Component Reference Coverage
This requirement SHALL use legacy reference path: all `_old_app/components/*.tsx` files and `_old_app/App.tsx` cited by `pages` and `ui-system` specs.

Every page/component spec SHALL have explicit displayed-data requirements.

#### Scenario: Page/component data is documented
- **WHEN** a page or component is specified
- **THEN** its required display fields, required form fields, filter/sort fields, derived values, and visible state labels are documented in this spec or its page-specific requirement

#### Scenario: Target data differs internally
- **WHEN** the target app stores or loads data differently
- **THEN** the UI still receives equivalent display values needed by the visible UI

### Requirement: Event Display Fields
This requirement SHALL use legacy reference path: `_old_app/components/EventCard.tsx`, `_old_app/components/BookingModal.tsx`, `_old_app/components/EventMap.tsx`, `_old_app/components/AccessPage.tsx`.

Event-facing UI SHALL receive fields required for cards, detail modal, map, discovery, admin event rows, and public previews.

#### Scenario: Event card fields are available
- **WHEN** an event card renders
- **THEN** required fields are image URL, image alt/title, title, category, partner name, formatted date label, neighborhood, credit price, remaining capacity, ticket type, saved state, and CTA label

#### Scenario: Event detail fields are available
- **WHEN** booking modal renders
- **THEN** required fields are category, partner name, title, description, address, credit price, remaining capacity, ticket type, selected quantity, total credits, and gating/action labels

#### Scenario: Event map fields are available
- **WHEN** map markers render
- **THEN** required fields are latitude, longitude, category, neighborhood, title, and formatted time label

#### Scenario: Public preview fields are available
- **WHEN** public discovery renders
- **THEN** required fields are upcoming event count, featured event list, active partner count, and membership category labels

### Requirement: Event Filtering And Sorting Fields
This requirement SHALL use legacy reference path: `_old_app/App.tsx`.

Discovery UI SHALL receive fields needed for visible filter and sorting behavior.

#### Scenario: Filter options are available
- **WHEN** filter panel renders
- **THEN** required fields are selected category, category options, selected partner/venue, partner options, start date, end date, active filter count, and reset/apply labels

#### Scenario: Date-derived labels are available
- **WHEN** active range label renders
- **THEN** required derived labels include Today, Saved upcoming events, From date, Until date, and date range

#### Scenario: Visible result count is available
- **WHEN** event grid renders
- **THEN** visible event count is displayed from the currently visible result list

### Requirement: Booking And Ticket Display Fields
This requirement SHALL use legacy reference path: `_old_app/components/BookingsView.tsx`, `_old_app/components/BookingModal.tsx`, `_old_app/components/PartnerPortal.tsx`.

Booking UI SHALL receive fields required for ticket cards, redemption panels, guest lists, check-in labels, exports, waitlist outcomes, booking failure states, and credit ledger display.

#### Scenario: Booking card fields are available
- **WHEN** user booking card renders
- **THEN** required fields are event image, event title, formatted event date, event address, ticket count, redemption code, booking status, optional checked-in timestamp, and copy state

#### Scenario: Redemption fields are available
- **WHEN** booking success state renders
- **THEN** required fields are redemption type, redemption code, optional redemption URL, copied state, calendar action label, support email, return-to-feed label, booking ID, ticket quantity, and total credits spent

#### Scenario: Waitlist fields are available
- **WHEN** waitlist success or waitlist card state renders
- **THEN** required fields are event title, formatted event date, event address, waitlist status, created date, support email when shown, and return-to-feed label

#### Scenario: Booking failure fields are available
- **WHEN** a booking action returns a typed failure state
- **THEN** required fields are failure state, localized message, optional retry availability, optional waitlist availability, optional membership CTA, optional credit balance, and optional required credit total

#### Scenario: Credit ledger fields are available
- **WHEN** member credit history or admin member history renders
- **THEN** required fields are ledger entry ID, amount, direction, reason/source label, related event or booking label when applicable, actor label when applicable, created date, and resulting balance when available

#### Scenario: Partner guest fields are available
- **WHEN** partner guest row renders
- **THEN** required fields are booking ID or guest short ID, user short ID, event title, redemption code, booking status, ticket count, created date for export, checked-in timestamp, and check-in availability label

#### Scenario: Booking export columns are available
- **WHEN** booking or code CSV export is visible
- **THEN** visible/export columns include Booking ID, User ID, Partner or Event, Code when applicable, Status, Tickets, Credits when applicable, Date or Created At

### Requirement: Partner Display Fields
This requirement SHALL use legacy reference path: `_old_app/components/AccessPage.tsx`, `_old_app/components/PartnerPortal.tsx`, `_old_app/components/AdminPanel.tsx`.

Partner UI SHALL receive fields required for public partner cards, partner portal, and admin partner rows/forms.

#### Scenario: Public partner card fields are available
- **WHEN** partner card renders
- **THEN** required fields are partner logo URL or display initial, partner name, and partner address

#### Scenario: Partner portal fields are available
- **WHEN** partner portal renders
- **THEN** required fields are partner name, partner address, total guest count, venue QR URL or missing-token text, event options, and guest booking rows

#### Scenario: Admin partner fields are available
- **WHEN** admin partner row renders
- **THEN** required fields are logo or initial, name, address, contact email, venue QR token or missing text, portal login email or not-created text, and available row actions

#### Scenario: Partner form fields are available
- **WHEN** partner form renders
- **THEN** required fields are institution name, contact email, full venue address, logo URL/upload value, logo preview, and visible validation messages

### Requirement: User And Profile Display Fields
This requirement SHALL use legacy reference path: `_old_app/components/Navbar.tsx`, `_old_app/components/ProfileView.tsx`, `_old_app/components/Onboarding.tsx`, `_old_app/components/AdminPanel.tsx`.

User-facing UI SHALL receive fields needed for navigation, profile, onboarding, and admin member rows.

#### Scenario: Navigation user fields are available
- **WHEN** member navigation renders
- **THEN** required fields are credit count, saved count, selected language, visible role/context label when needed, and active page indicator

#### Scenario: Profile fields are available
- **WHEN** profile renders
- **THEN** required fields are first name, last name, email, credits, current plan label, status badge label, next bill date, billing address, payment method, and preference values

#### Scenario: Preference fields are available
- **WHEN** onboarding or Vibes panel renders
- **THEN** required fields are age group, interests, moods, districts, max distance, timing, preferred days, preferred languages, accessibility state, and available option lists

#### Scenario: Admin member fields are available
- **WHEN** admin member row renders
- **THEN** required fields are full name, email, role label, subscription status label, credits, booking count, event-open count, expanded preference/history counts, and credit adjustment input value

### Requirement: Form Field And Validation Display Data
This requirement SHALL use legacy reference path: `_old_app/App.tsx`, `_old_app/components/CheckoutView.tsx`, `_old_app/components/AdminPanel.tsx`, `_old_app/components/ProfileView.tsx`.

Forms SHALL receive visible field definitions, validation messages, action errors, success notices, and invalidation-result data independent of legacy form implementation.

#### Scenario: Landing form fields are available
- **WHEN** landing form renders
- **THEN** required fields are first name, last name, email, password, active auth mode label, submit label, forgot password label, visible field error messages, visible form error or notice messages, action loading state, and post-auth invalidation hints when returned.

#### Scenario: Membership form fields are available
- **WHEN** membership form renders
- **THEN** required fields are payment method, card number, expiry, CVC, promo code, frozen status copy, success copy, guarantee copy, field-level validation messages, form-level error messages, action loading state, and success notice data.

#### Scenario: Admin event form fields are available
- **WHEN** event form renders
- **THEN** required fields include title, partner host, credit price, capacity, redemption method, code strategy, manual password, promo code, event website URL, description, accessibility, languages, target age groups, timing mode, date/time values, series builder values, image URL/upload, preview, field-level validation messages, form-level action errors, success notices, and query invalidation hints.

#### Scenario: Visible validation messages are available
- **WHEN** client or server validation fails visibly
- **THEN** each invalid field can display a user-facing validation message near that field.

#### Scenario: Action result messages are available
- **WHEN** an action returns a form-level error, authorization failure, or success notice
- **THEN** the form can display the message in the same visible form location used for migrated status and validation feedback.

### Requirement: Derived Display Values
This requirement SHALL use legacy reference path: `_old_app/App.tsx`, `_old_app/components/AccessPage.tsx`, `_old_app/components/AdminPanel.tsx`, `_old_app/components/BookingModal.tsx`.

Derived values SHALL be available wherever they visibly appear.

#### Scenario: Booking total displays
- **WHEN** booking quantity changes
- **THEN** total credits displays as event credit price multiplied by selected ticket count

#### Scenario: Public stats display
- **WHEN** public discovery renders
- **THEN** upcoming event count and active partner count are displayed

#### Scenario: Admin dashboard stats display
- **WHEN** admin dashboard renders
- **THEN** total bookings, credits burned, active partners, and total guests are displayed

#### Scenario: Date labels display
- **WHEN** event, booking, check-in, or series-preview dates render
- **THEN** they appear as localized human-readable labels

### Requirement: Option Lists
This requirement SHALL use legacy reference path: `_old_app/components/Onboarding.tsx`, `_old_app/components/ProfileView.tsx`, `_old_app/components/AdminPanel.tsx`.

Visible option lists SHALL be available to components that render selection UI.

#### Scenario: Preference options are available
- **WHEN** preference UI renders
- **THEN** age options are `18-25`, `26-35`, `36-50`, `50+`
- **AND** interest options include Theater, Kino, Museum, Ausstellung, Konzert, Talk/Lesung, Comedy, Tanz/Performance
- **AND** mood options include Leicht, Experimentell, Klassisch, Politisch, Fam
- **AND** district options include Mitte, X-Berg, P-Berg, Charlottenburg, Wedding, F-Hain, Schöneberg
- **AND** timing options include After Work, Weekend, Day
- **AND** day options are Mo, Di, Mi, Do, Fr, Sa, So
- **AND** language preference options include DE, EN, Non-V

#### Scenario: Admin event option lists are available
- **WHEN** admin event form renders
- **THEN** language options include DE, EN, TR, AR, PL, RU, UK, FR, FA, HI, NON_VERBAL plus custom additions
- **AND** target age options are `18-25`, `26-35`, `36-50`, `50+`
- **AND** redemption options include password-style entry and promo-code entry
- **AND** timing options include fixed time slot and all-day

### Requirement: Shell Display View Models
The app shell SHALL receive UI-facing display data for global frame, navigation, page container, and state wrapper rendering.

#### Scenario: Navigation display data is available
- **WHEN** navigation renders
- **THEN** required display data is viewer context, active navigation item, logo variant, selected language, visible navigation labels, optional tagline, saved count, credit count, profile visibility, logout visibility, and context-aware primary action label

#### Scenario: Shell action display data is available
- **WHEN** header actions or page top-bar actions render
- **THEN** required display data is action label, optional icon, target or callback identifier, active state, disabled state, loading state, optional count badge, and optional accessibility label

#### Scenario: Breadcrumb display data is available
- **WHEN** breadcrumbs render
- **THEN** required display data is ordered breadcrumb labels, optional targets, and current-item state

#### Scenario: Status banner display data is available
- **WHEN** shell status messages render
- **THEN** required display data is status type, localized message text, optional icon, optional support email, optional target action label, and dismissibility or action availability

#### Scenario: Global state wrapper data is available
- **WHEN** loading, error, or empty wrappers render
- **THEN** required display data is state type, title or loading label, explanatory message, optional icon, optional retry action label, optional CTA label, and optional disabled/loading action state

### Requirement: Discovery And Modal Shell Display Data
Discovery and modal shell containers SHALL receive only the display data needed for shell structure and leave feature content data to page components.

#### Scenario: Discovery shell display data is available
- **WHEN** discovery shell structure renders
- **THEN** required display data is active range label, visible result count, filter panel open state, map panel open state, active filter count, filter toggle label, map toggle label, and optional empty-state display data

#### Scenario: Modal shell display data is available
- **WHEN** a full-screen modal shell renders
- **THEN** required display data is modal open state, close action availability, logo variant, optional heading/metadata labels, loading state, and scroll/content layout mode

### Requirement: Relational Display Derivation
Display view models SHALL be derivable from the relational domain schema while preserving existing UI-visible fields.

#### Scenario: Event display data is derived
- **WHEN** event cards, event details, maps, admin event rows, or public previews load from Postgres
- **THEN** the display data includes the same visible event fields currently required by the display-data spec
- **AND** partner display fields can be joined from the related partner row.

#### Scenario: User display data is derived
- **WHEN** navigation, profile, onboarding, shell counts, or admin member rows load from Postgres
- **THEN** the display data includes role, credits, saved count, selected language, profile fields, subscription labels, preference values, and behavior counts needed by the existing UI contracts.

#### Scenario: Booking and ledger display data is derived
- **WHEN** booking cards, redemption panels, partner guest rows, exports, admin metrics, or ledger history load from Postgres
- **THEN** the display data includes ticket counts, status labels, redemption details, checked-in timestamps, joined event/partner fields, export columns, credit balances, and credit-burn metrics required by existing UI contracts.

### Requirement: Server-Derived Counts And Labels
The app SHALL derive counts and labels from relational rows instead of legacy Firestore document structures.

#### Scenario: Shell counts are derived
- **WHEN** the app shell renders for a member
- **THEN** saved-event count and credit count can be derived from relational saved-event and user profile data.

#### Scenario: Discovery labels are derived
- **WHEN** discovery loads event data
- **THEN** active range labels, visible result counts, category options, partner options, and map marker fields can be derived from relational event and partner rows.

#### Scenario: Admin and partner metrics are derived
- **WHEN** operational surfaces load dashboard or portal data
- **THEN** total bookings, credits burned, active partners, total guests, and guest totals can be derived from relational bookings, ledger, partner, and event rows.

### Requirement: Authenticated Viewer Display Data
Display view models SHALL include authenticated viewer data derived from Better Auth session and domain profile rows.

#### Scenario: Guest display data is available
- **WHEN** no session is present
- **THEN** display data identifies the viewer as guest and excludes protected profile, role, saved count, and credit data.

#### Scenario: Member display data is available
- **WHEN** a signed-in user has a member profile
- **THEN** display data includes viewer role, selected language, first and last name where needed, onboarding state, subscription status, credit count, saved count, profile visibility, and logout visibility.

#### Scenario: Partner display data is available
- **WHEN** a signed-in user has a partner profile
- **THEN** display data includes viewer role, selected language, linked partner ID, partner navigation context, and logout visibility.

#### Scenario: Admin display data is available
- **WHEN** a signed-in user has an admin profile
- **THEN** display data includes viewer role, selected language, admin navigation context, and logout visibility.

### Requirement: Auth Action Display Data
Auth-related form and shell actions SHALL expose user-facing loading, success, error, and disabled states.

#### Scenario: Auth form state is available
- **WHEN** signup, login, logout, or password recovery is submitted
- **THEN** display data can represent loading state, field validation messages, form-level errors, success notices, and the next route/action target.

#### Scenario: Protected action state is available
- **WHEN** a protected action is rejected because the viewer is unauthenticated or forbidden
- **THEN** display data can represent an auth-required or forbidden state without exposing protected record details.

### Requirement: Operational Action Result Display Data
Admin and partner display view models SHALL expose user-facing result data for operational actions.

#### Scenario: Event operation result data is available
- **WHEN** an event create, update, delete, or series operation completes
- **THEN** display data includes success notice text, safe form-level errors, field validation messages, affected event IDs, and invalidation hints for event/admin/discovery views.

#### Scenario: Partner operation result data is available
- **WHEN** a partner create, update, delete, token rotation, or portal provisioning operation completes
- **THEN** display data includes success notice text, safe form-level errors, field validation messages, affected partner ID, venue QR URL or missing-token text, portal login email or not-created text, and invalidation hints.

#### Scenario: Check-in operation result data is available
- **WHEN** a manual or venue QR check-in operation completes
- **THEN** display data includes success, already-used, not-open, no-eligible-booking, or forbidden state labels plus updated booking status and checked-in timestamp when applicable.

### Requirement: Operational Export Display Data
Admin and partner views SHALL receive export-oriented rows derived from authorized relational query data.

#### Scenario: Partner export rows are available
- **WHEN** a partner downloads booking codes or guest data
- **THEN** display data includes only that partner's authorized rows with Booking ID, User ID, Event, Code, Status, Tickets, and Created At columns.

#### Scenario: Admin export rows are available
- **WHEN** an admin exports partner, booking, or event-oriented data
- **THEN** display data includes authorized rows with the visible/export columns required by the admin page and booking display contracts.

### Requirement: Partner Ownership Display Data
Partner and admin display view models SHALL include ownership and linkage fields needed to enforce and explain operational access.

#### Scenario: Partner portal ownership data is available
- **WHEN** a partner portal view loads
- **THEN** display data includes the viewer's linked partner ID, partner name, partner address, venue QR URL or missing-token text, event options, and only guest booking rows owned by that partner.

#### Scenario: Admin partner linkage data is available
- **WHEN** an admin partner row renders
- **THEN** display data includes contact email, portal login email or not-created text, linked partner user ID when available, token state, and available row actions.

### Requirement: Billing Display Fields
Member-facing and admin-facing UI SHALL receive display-safe billing, payment method, subscription status, and credit refill fields derived from provider-backed subscription records.

#### Scenario: Member billing fields are available
- **WHEN** profile, membership, or billing status UI renders for a member
- **THEN** required fields are plan label, plan price label, local subscription status label, provider action-required label when applicable, next bill date, current period end, billing address display, payment method display, support email, and booking availability state

#### Scenario: Frozen billing fields are available
- **WHEN** a member is frozen because of provider billing state or admin override
- **THEN** required fields are frozen reason label, recovery or support action label, support email, booking disabled state, and profile/bookings visibility state

#### Scenario: Admin billing fields are available
- **WHEN** an admin member detail or billing row renders
- **THEN** required fields are provider customer ID, provider subscription ID, local subscription status label, provider status label, last provider sync timestamp, current period bounds, payment method display, credit balance, and available billing override actions

### Requirement: Subscription Credit Ledger Display Fields
Credit ledger UI SHALL distinguish provider refills, booking debits, and admin adjustments without exposing unsafe provider payloads.

#### Scenario: Provider refill ledger fields are available
- **WHEN** a subscription refill ledger entry renders
- **THEN** required fields are ledger entry ID, credit amount, direction, reason/source label, provider label, invoice reference label, created date, resulting balance when available, and idempotency reference when shown to admins

#### Scenario: Manual adjustment ledger fields are available
- **WHEN** an admin adjustment ledger entry renders
- **THEN** required fields are ledger entry ID, credit amount, direction, reason text, admin actor label, created date, and resulting balance when available

### Requirement: Data Access View Model Mapping
Display data SHALL be produced by explicit data access mappers rather than raw database rows or legacy Firebase document shapes.

#### Scenario: Event display model is mapped
- **WHEN** event rows and related partner/booking/saved-state data are loaded for discovery, detail, map, booking, partner, or admin surfaces
- **THEN** the data access layer returns display fields required by the event display requirements without exposing persistence-only fields.

#### Scenario: Booking display model is mapped
- **WHEN** booking, redemption, credit ledger, or guest-list rows are loaded
- **THEN** the data access layer returns booking and ticket display fields required by member, partner, and admin UI requirements.

#### Scenario: Profile display model is mapped
- **WHEN** user profile, wallet, subscription, preference, or admin member rows are loaded
- **THEN** the data access layer returns display fields required by navigation, profile, onboarding, wallet, and admin member UI requirements.

#### Scenario: Legacy store shape is not required
- **WHEN** a page or component renders migrated display data
- **THEN** it does not require `_old_app/store.ts` state shape, Firebase document snapshots, or legacy singleton-store fields.

### Requirement: Query State Display Data
Display data SHALL include the UI states needed for SSR-loaded and client-refetched data.

#### Scenario: Initial SSR data renders
- **WHEN** a page renders server-loaded data
- **THEN** the displayed values, counts, empty states, and labels match the same display contract used after client refetch.

#### Scenario: Client data is stale or refetching
- **WHEN** a hydrated island is using stale initial data or refetching a query
- **THEN** the UI receives enough state to render stale, loading, disabled, or refreshed states without changing the display model shape.

#### Scenario: Query authorization fails
- **WHEN** a protected data query fails authorization
- **THEN** the UI receives a safe error or redirect state and no protected display fields from unauthorized rows.

### Requirement: Production Display Data Uses Database Mappers
Production product routes SHALL derive user-facing display rows from database-backed data-access mapper output rather than demo fixtures.

#### Scenario: Public display rows are database-backed
- **WHEN** public discovery event cards, category options, partner options, partner cards, or stats render on a product route
- **THEN** those values are derived from `loadPublicDiscoveryData` or a compatible data-access client query result.

#### Scenario: Member display rows are database-backed
- **WHEN** member discovery, saved events, bookings, wallet, ledger, profile, or preferences render on a product route
- **THEN** those values are derived from authorized member data-access output for the current member.

#### Scenario: Partner display rows are database-backed
- **WHEN** partner portal details, event options, guest rows, guest counts, or QR display state render on a product route
- **THEN** those values are derived from authorized partner data-access output for the current partner context.

#### Scenario: Admin display rows are database-backed
- **WHEN** admin dashboard counts, event rows, partner rows, member rows, or expanded operational details render on a product route
- **THEN** those values are derived from authorized admin data-access output.

### Requirement: Demo Display Data Is Workbench-Only
Demo display fixtures SHALL be isolated from production product route behavior.

#### Scenario: Product route avoids fixture rows
- **WHEN** a production Astro route or production React island renders user-facing events, partners, bookings, credits, ledger entries, guests, profile fields, preferences, members, or admin rows
- **THEN** it does not import those rows from `src/lib/unveiled-view-models.ts`.

#### Scenario: Static labels remain shareable
- **WHEN** production UI needs static option labels or copy that is intentionally shared with demos
- **THEN** those constants may be imported from a shared non-fixture module that does not imply demo row ownership.

#### Scenario: Workbench keeps demo fixtures
- **WHEN** `/workbench` renders examples, component states, or fixture previews
- **THEN** it may continue to use demo display data isolated from production routes and product islands.

### Requirement: Live Data Empty And Partial States
Production display surfaces SHALL render stable empty, loading, and partial-data states for database-backed data.

#### Scenario: Public discovery has no featured events
- **WHEN** public discovery data contains no upcoming featured events
- **THEN** the page renders the specified no-upcoming-events empty state instead of falling back to demo events.

#### Scenario: Member has no owned rows
- **WHEN** a member has no saved events, bookings, ledger entries, or preference values
- **THEN** the relevant member surface renders the appropriate empty or default state without fixture rows.

#### Scenario: Operational surface has no rows
- **WHEN** a partner or admin data-access result contains no visible rows for a table
- **THEN** the corresponding table renders an empty state and does not backfill demo operational data.

