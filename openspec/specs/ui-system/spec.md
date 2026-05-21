## Purpose

Define reusable UI appearance and component behavior. `_old_app/` is a visual reference only.
## Requirements
### Requirement: Brand System
This requirement SHALL use legacy reference path: `_old_app/index.css`, `_old_app/components/Logo.tsx`.

The UI SHALL preserve the visible Unveiled brand language.

#### Scenario: Visual elements render
- **WHEN** primary UI surfaces are displayed
- **THEN** they use brand yellow `#FAFF86`, brand dark `#202621`, brand cream `#FEFFE2`, brand grey `#F5F5F5`, and white panels
- **AND** surfaces use thick dark borders, offset dark shadows, uppercase display headings, compact uppercase metadata, and high-contrast hover inversions

#### Scenario: Visual parity is preserved
- **WHEN** target UI primitives are used
- **THEN** they are styled to match the squared, bordered, high-contrast Unveiled appearance instead of default library styling

#### Scenario: Data requirements are met
- **WHEN** brand components render
- **THEN** required display data is logo text/asset variant, localized tagline when shown, and active/inactive visual state tokens

### Requirement: Buttons And Controls
This requirement SHALL use legacy reference path: `_old_app/App.tsx`, `_old_app/components/Navbar.tsx`, `_old_app/components/CheckoutView.tsx`.

Buttons, segmented controls, toggles, and icon controls SHALL match legacy visible states.

#### Scenario: Visible elements render
- **WHEN** a control appears
- **THEN** it has compact uppercase text, strong border or filled surface, clear hover treatment, and lucide-style icon where the legacy UI shows one

#### Scenario: User interactions render
- **WHEN** a segmented option is active
- **THEN** it uses dark fill with light text
- **WHEN** an action is disabled
- **THEN** it appears muted and non-primary
- **WHEN** an action is loading
- **THEN** it shows a spinner or loading label
- **WHEN** copy succeeds
- **THEN** text or icon changes to Copied/check temporarily

#### Scenario: Visual parity is preserved
- **WHEN** primary and secondary actions render together
- **THEN** primary actions are visually dominant and secondary actions retain dark-bordered brand styling

#### Scenario: Data requirements are met
- **WHEN** controls render
- **THEN** required display data is label, optional icon, active/disabled/loading/copied state, and optional count badge

### Requirement: Forms
This requirement SHALL use legacy reference path: `_old_app/App.tsx`, `_old_app/components/Onboarding.tsx`, `_old_app/components/CheckoutView.tsx`, `_old_app/components/ProfileView.tsx`, `_old_app/components/AdminPanel.tsx`.

Forms SHALL preserve visible field structure, validation message placement, and responsive grouping.

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

Map UI SHALL preserve the visible map panel, marker, loading, error, and fallback behavior while supporting event selection handoff.

#### Scenario: Visible elements render
- **WHEN** map is open
- **THEN** it appears inside a fixed-height bordered panel centered on Berlin
- **AND** event markers use a dark marker with brand-yellow stroke

#### Scenario: Loading and error states render
- **WHEN** map is loading
- **THEN** a bordered grey loading panel with compact animated text appears
- **WHEN** map fails
- **THEN** a dark error panel with warning icon, explanatory copy, and Retry Connection action appears

#### Scenario: User interactions render
- **WHEN** a marker is selected
- **THEN** an info window shows category, neighborhood, title, formatted time, and an action to open the event details view or booking modal
- **WHEN** the provider is unavailable or a marker cannot be resolved
- **THEN** the map shows a safe visible fallback state without blocking the surrounding event list

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

