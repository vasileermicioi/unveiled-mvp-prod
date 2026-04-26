## ADDED Requirements

### Requirement: UI View Models
The target UI SHALL receive display-focused view models for migrated visual surfaces.

#### Scenario: Event view models render
- **WHEN** event cards, event detail modal, map markers, admin event rows, or public featured events render
- **THEN** the provided view model includes only the visible event fields, derived date labels, selected/saved states, and CTA labels required by the baseline `display-data` spec

#### Scenario: Booking view models render
- **WHEN** booking cards, redemption panels, partner guest rows, or exports render
- **THEN** the provided view model includes ticket count, status label, redemption code, checked-in label/timestamp, joined event display fields, export columns, and copied/loading states required by the visible UI

#### Scenario: Profile and partner view models render
- **WHEN** navigation, profile, onboarding, partner portal, or admin member rows render
- **THEN** the provided view model includes only visible names, labels, counts, options, preferences, status badges, support copy, and action states needed by the UI

### Requirement: Form Display Contracts
The target UI SHALL define form display contracts for all migrated visible forms.

#### Scenario: Form field contracts exist
- **WHEN** landing, membership, onboarding, profile, partner, event, or member-action forms are implemented
- **THEN** each form defines visible field labels, current values, placeholders where shown, selected states, disabled states, loading states, and user-facing validation messages

#### Scenario: Validation messages render
- **WHEN** form validation fails in a user-visible way
- **THEN** the target view model provides the exact message text and field association needed to render the message in the legacy-equivalent location

### Requirement: Derived Display Values
The target UI SHALL provide derived values wherever the visible UI expects them.

#### Scenario: Derived values are available
- **WHEN** discovery, booking modal, public stats, admin dashboard, partner portal, or series preview renders
- **THEN** visible counts, active range labels, total credit costs, guest totals, credit-burn metrics, capacity labels, date labels, and first-ten series preview labels are available without requiring components to know legacy data structure

