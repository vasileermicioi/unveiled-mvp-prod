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
- **THEN** the checkout form displays standard container divs for Stripe Elements instead of hardcoded text placeholders (e.g. "Stripe card fields mount here")

#### Scenario: Event series builder mounts standard selectors
- **WHEN** an admin views the Event Series Builder input fields
- **THEN** the builder displays standard date picker and day selection inputs rather than hardcoded "defaultValue" range string prompts (e.g. "04 May - 30 May")

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
