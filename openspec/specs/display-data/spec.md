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

Booking UI SHALL receive fields required for ticket cards, redemption panels, guest lists, check-in labels, and exports.

#### Scenario: Booking card fields are available
- **WHEN** user booking card renders
- **THEN** required fields are event image, event title, formatted event date, event address, ticket count, redemption code, booking status, optional checked-in timestamp, and copy state

#### Scenario: Redemption fields are available
- **WHEN** booking success state renders
- **THEN** required fields are redemption type, redemption code, optional redemption URL, copied state, calendar action label, support email, and return-to-feed label

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

