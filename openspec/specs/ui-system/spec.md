## Purpose

Define reusable UI appearance and component behavior. `_old_app/` is a visual reference only.
## Requirements
### Requirement: Brand System
This requirement SHALL use legacy reference path: `_old_app/index.css`, `_old_app/components/Logo.tsx`.

The UI SHALL preserve the visible Unveiled brand language.

#### Scenario: Visual elements render
- **WHEN** primary UI surfaces are displayed
- **THEN** they use the brand palette tokens declared in the `design-tokens` spec (brand-yellow, brand-cream, brand-grey, brand-dark, brand-white, plus brand-error and brand-success)
- **AND** surfaces use border, shadow, and motion tokens from the `design-tokens` spec
- **AND** typography uses the font-family, font-size, letter-spacing, and line-height tokens from the `design-tokens` spec
- **AND** the rendered values are byte-identical to the previous hard-coded values

#### Scenario: Visual parity is preserved
- **WHEN** target UI primitives are used
- **THEN** they are styled using tokens from the `design-tokens` spec
- **AND** the squared, bordered, high-contrast Unveiled appearance is preserved

#### Scenario: Data requirements are met
- **WHEN** brand components render
- **THEN** required display data is logo text/asset variant, localized tagline when shown, and active/inactive visual state tokens from the `design-tokens` spec

### Requirement: Buttons And Controls
This requirement SHALL use legacy reference path: `_old_app/App.tsx`, `_old_app/components/Navbar.tsx`, `_old_app/components/CheckoutView.tsx`.

Buttons, segmented controls, toggles, and icon controls SHALL match legacy visible states.

#### Scenario: Visible elements render
- **WHEN** a control appears
- **THEN** it has compact uppercase text (using the typography tokens from the `design-tokens` spec), strong border or filled surface (using the color and border tokens), clear hover treatment, and lucide-style icon where the legacy UI shows one

#### Scenario: User interactions render
- **WHEN** a segmented option is active
- **THEN** it uses the dark-fill and light-text tokens from the `design-tokens` spec
- **WHEN** an action is disabled
- **THEN** it appears muted and non-primary (using the muted color tokens)
- **WHEN** an action is loading
- **THEN** it shows a spinner or loading label
- **WHEN** copy succeeds
- **THEN** text or icon changes to Copied/check temporarily

#### Scenario: Visual parity is preserved
- **WHEN** primary and secondary actions render together
- **THEN** primary actions are visually dominant and secondary actions retain dark-bordered brand styling
- **AND** every color, radius, and shadow value is sourced from the typed enums in `src/lib/design-tokens.ts` (the `design-tokens` spec), not from a magic string or raw hex

#### Scenario: Data requirements are met
- **WHEN** controls render
- **THEN** required display data is label, optional icon, active/disabled/loading/copied state, and optional count badge

### Requirement: Forms
This requirement SHALL use legacy reference path: `_old_app/App.tsx`, `_old_app/components/Onboarding.tsx`, `_old_app/components/CheckoutView.tsx`, `_old_app/components/ProfileView.tsx`, `_old_app/components/AdminPanel.tsx`.

Forms SHALL preserve visible field structure, validation message placement, and responsive grouping. Payment integration and builder forms MUST mount interactive components without static mock text placeholders.

#### Scenario: Visible elements render
- **WHEN** a form renders
- **THEN** it shows compact uppercase labels, bordered inputs/selects/textareas, clear focus states, and primary submit actions
- **AND** paired fields stack on mobile and align in columns on larger screens

#### Scenario: Validation messages render
- **WHEN** a user-visible validation message exists
- **THEN** it appears near the related field or form section in compact high-contrast text

#### Scenario: User interactions render
- **WHEN** a selectable chip, toggle, day button, language button, or payment method is selected
- **THEN** selected state is visually distinct

#### Scenario: Data requirements are met
- **WHEN** forms render
- **THEN** required display data is field label, current value, placeholder where shown, validation message, selected state, disabled state, and submit/loading label

#### Scenario: Stripe payment form mounts active elements
- **WHEN** a user selects Stripe Card or SEPA payment methods
- **THEN** the checkout form displays structured, high-fidelity payment container grids containing credit card or bank details input frames instead of hardcoded text placeholders (e.g. "Stripe card fields mount here")
- **AND** renders mock card/bank brand icons and billing address sync options

#### Scenario: Event series builder mounts standard selectors
- **WHEN** an admin views the Event Series Builder input fields
- **THEN** the builder displays standard date picker and day selection inputs rather than hardcoded "defaultValue" range string prompts (e.g. "04 May - 30 May")

### Requirement: Event Card Component
This requirement SHALL use legacy reference path: `_old_app/components/EventCard.tsx`.

Event cards SHALL preserve the visible event browsing experience.

#### Scenario: Visible elements render
- **WHEN** an event card appears
- **THEN** it shows event image, category badge, title, partner name, formatted date, neighborhood, credit price, save icon button, and primary CTA
- **AND** the image uses grayscale by default with object-cover sizing

#### Scenario: User interactions render
- **WHEN** the card is hovered on capable devices
- **THEN** it translates slightly, shadow increases, image can scale/colorize, and a bottom overlay reveals remaining capacity and ticket type
- **WHEN** save is selected
- **THEN** bookmark fill/state changes when saved

#### Scenario: Visual parity is preserved
- **WHEN** event cards are displayed in grids
- **THEN** they keep equal-height bordered card structure with image on top and action row at bottom

#### Scenario: Data requirements are met
- **WHEN** card renders
- **THEN** required display data is image URL, image alt/title, category, partner name, date label, neighborhood, credit price, remaining capacity, ticket type, saved state, and CTA label

### Requirement: Modal And Dialog Components
This requirement SHALL use legacy reference path: `_old_app/components/BookingModal.tsx`.

Modal UI SHALL visually take over the screen for booking and redemption states.

#### Scenario: Visible elements render
- **WHEN** the modal opens
- **THEN** it uses a full-screen brand-yellow surface, logo header, large close icon, scrollable content, and large editorial event typography

#### Scenario: User interactions render
- **WHEN** close is selected
- **THEN** the modal closes visibly
- **WHEN** copy code is selected
- **THEN** copied feedback appears

#### Scenario: Visual parity is preserved
- **WHEN** success content renders
- **THEN** code panels use dark/yellow or white/dark contrast, large display code text, and strong bordered calendar/support actions

#### Scenario: Data requirements are met
- **WHEN** modal states render
- **THEN** required display data is event detail fields, ticket count, total credits, redemption type, redemption code, redemption URL, support email, loading state, and copied state

### Requirement: Map Component
This requirement SHALL use legacy reference path: `_old_app/components/EventMap.tsx`.

Map UI SHALL render through Leaflet and an open tile provider (such as CartoDB Voyager or OpenStreetMap), preserving the visible map panel, marker, loading, error, and fallback behavior, and supporting event selection handoff with a smooth panning animation.

#### Scenario: Visible elements render
- **WHEN** map is open
- **THEN** it appears inside a fixed-height bordered panel using the existing styling tokens
- **AND** the map mounts Leaflet and centers on Berlin by default (coordinates `52.52`, `13.405`)
- **AND** map tiles are loaded from an open tile provider (such as CartoDB Voyager or OpenStreetMap)
- **AND** event markers use a custom dark squared marker shape with a brand-yellow stroke

#### Scenario: Loading and error states render
- **WHEN** map is loading
- **THEN** a bordered grey loading panel with compact animated text appears
- **AND** the panel preserves space with a fixed height to prevent layout shifts of adjacent elements
- **WHEN** map fails
- **THEN** a dark error panel with warning icon, explanatory copy, and Retry Connection action appears

#### Scenario: User interactions render
- **WHEN** a marker is selected
- **THEN** an info window shows category, neighborhood, title, formatted time, and a "Book now" or "View event" action button that opens the event details view or booking modal
- **WHEN** the provider is unavailable or a marker cannot be resolved
- **THEN** the map shows a safe visible fallback state without blocking the surrounding event list
- **WHEN** an event card is clicked in the list
- **THEN** the map initiates a smooth panning animation to the selected marker's coordinates over `400ms` using an `easeInOutCubic` easing curve
- **AND** the active panning animation frame is cancelled as soon as the user starts a manual drag or pointer interaction (`mousedown`, `touchstart`, or wheel) on the map viewport

#### Scenario: Visual parity is preserved
- **WHEN** map markers and info windows are displayed
- **THEN** they keep the legacy bordered, high-contrast treatment and remain visually consistent with the discovery surface

#### Scenario: Data requirements are met
- **WHEN** map renders
- **THEN** required display data is event latitude, longitude, category, neighborhood, title, formatted time, selected marker state, and action target

### Requirement: Empty, Loading, And Error States
This requirement SHALL use legacy reference path: `_old_app/App.tsx`, `_old_app/components/BookingsView.tsx`, `_old_app/components/PartnerPortal.tsx`, `_old_app/components/AdminPanel.tsx`.

Empty, loading, and error states SHALL be explicit and visually intentional.

#### Scenario: Visible elements render
- **WHEN** there is no discovery result
- **THEN** a large dashed no-results panel appears
- **WHEN** bookings are empty
- **THEN** a centered ticket empty state with CTA appears
- **WHEN** partner guests are empty
- **THEN** a centered muted no-guests message appears
- **WHEN** admin member data is loading or empty
- **THEN** a bordered loading/no-members message appears

#### Scenario: Visual parity is preserved
- **WHEN** these states render
- **THEN** they keep the legacy contrast, dashed/bordered treatment, icon scale, compact uppercase copy, and generous empty-state spacing

#### Scenario: Data requirements are met
- **WHEN** state UI renders
- **THEN** required display data is state type, localized message, optional icon, optional CTA label, and optional retry action

### Requirement: Responsive Layout
This requirement SHALL use legacy reference path: all UI component paths listed in this spec.

Responsive behavior SHALL preserve the visible mobile/desktop layout intent.

#### Scenario: Mobile layout renders
- **WHEN** viewport width is small
- **THEN** page sections stack, forms collapse paired fields, controls stack vertically where needed, event cards use one column, and large headings reduce size

#### Scenario: Desktop layout renders
- **WHEN** viewport width is wide
- **THEN** hero sections can split into columns, event grids use multiple columns, profile/admin forms use columns, and operational rows align horizontally

#### Scenario: Visual parity is preserved
- **WHEN** content changes across breakpoints
- **THEN** no text overlaps controls, image/card dimensions remain stable, and hover-only reveals do not hide essential mobile information

#### Scenario: Data requirements are met
- **WHEN** responsive components render
- **THEN** required display data remains available at every breakpoint, even if secondary labels collapse to icons

### Requirement: Localized UI Primitive Copy
Reusable UI controls, forms, modal states, and shared feedback surfaces SHALL receive and render localized labels and messages for German and English user-facing flows.

#### Scenario: Controls render localized labels
- **WHEN** buttons, segmented controls, toggles, icon-label controls, badges, or copy-to-clipboard feedback appear in public or member flows
- **THEN** visible text labels, loading labels, disabled labels, copied feedback, and count-adjacent labels use the selected language

#### Scenario: Forms render localized copy
- **WHEN** signup, login, onboarding, profile, booking, waitlist, preference, or newsletter forms render
- **THEN** field labels, placeholders where shown, helper copy, validation messages, submit labels, and loading labels use the selected language

#### Scenario: Shared states render localized messages
- **WHEN** empty, loading, error, unavailable, no-results, or retry states appear in public or member flows
- **THEN** headings, body copy, and action labels use the selected language while preserving existing visual parity behavior

#### Scenario: Admin views and actions render localized copy
- **WHEN** an administrator views the admin dashboard, partner tables, member lists, or submits administrative forms
- **THEN** all header labels, action buttons, table headings, and toast messages use the selected language

### Requirement: Primitive Styling Stability
Migrated UI primitives, forms, interactive controls, and modal states SHALL maintain visual stability and prevent styling regressions through automated visual checks.

#### Scenario: Primitive states match visual baselines
- **WHEN** reusable buttons, segmented controls, forms, inputs, and modal states are rendered in tests
- **THEN** their spacing, typography, colors, shadows, borders, active states, and hover states match approved baselines

#### Scenario: Responsive layout snapshots match baselines
- **WHEN** layout containers, page headers, grids, and mobile navigation menus are tested under mobile and desktop viewports
- **THEN** their layout grid alignments, responsive wraps, margins, and padding match approved baselines

### Requirement: Skeleton Loading Primitives
The UI SHALL provide reusable `<Skeleton>` pulse containers representing loading state skeletons for textual elements, buttons, and card content.

#### Scenario: Skeleton pulse animation is active
- **WHEN** a `<Skeleton>` container renders during data loading phases
- **THEN** it displays a pulse animation (`animate-pulse`) using muted grey background blocks matching card and text dimensions.

### Requirement: Responsive Table-to-Card Structures
On viewports below `768px`, data tables (including admin lists and reports) SHALL collapse their row structures into self-contained vertical card blocks.

#### Scenario: Administrative table collapses on mobile
- **WHEN** the viewport width is below 768px
- **THEN** the admin partners directory table, events registry table, and member registry table render as stackable grid cards with label-value rows instead of horizontal columns.

### Requirement: Venue Check-in Status Panels
The UI SHALL provide high-visibility, high-contrast check-in status panels for venue door staff environments.

#### Scenario: Successful check-in validation
- **WHEN** a ticket is successfully validated
- **THEN** the status screen renders a large green checkmark with clear confirmation text and event/member details

#### Scenario: Failed check-in validation
- **WHEN** a ticket validation fails (e.g. expired or double-checked ticket)
- **THEN** the status screen renders a large red warning icon with high-contrast text explaining the failure reason

