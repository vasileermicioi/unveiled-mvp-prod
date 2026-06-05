## ADDED Requirements

### Requirement: Venue Check-in Status Panels
The UI SHALL provide high-visibility, high-contrast check-in status panels for venue door staff environments.

#### Scenario: Successful check-in validation
- **WHEN** a ticket is successfully validated
- **THEN** the status screen renders a large green checkmark with clear confirmation text and event/member details

#### Scenario: Failed check-in validation
- **WHEN** a ticket validation fails (e.g. expired or double-checked ticket)
- **THEN** the status screen renders a large red warning icon with high-contrast text explaining the failure reason

## MODIFIED Requirements

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
- **AND** the panel preserves space with a fixed height to prevent layout shifts of adjacent elements
- **WHEN** map fails
- **THEN** a dark error panel with warning icon, explanatory copy, and Retry Connection action appears

#### Scenario: User interactions render
- **WHEN** a marker is selected
- **THEN** an info window shows category, neighborhood, title, formatted time, and an action to open the event details view or booking modal
- **WHEN** the provider is unavailable or a marker cannot be resolved
- **THEN** the map shows a safe visible fallback state without blocking the surrounding event list
- **WHEN** an event card is clicked in the list
- **THEN** the map smoothly pans to the corresponding marker location

#### Scenario: Data requirements are met
- **WHEN** map renders
- **THEN** required display data is event latitude, longitude, category, neighborhood, title, formatted time, selected marker state, and action target
