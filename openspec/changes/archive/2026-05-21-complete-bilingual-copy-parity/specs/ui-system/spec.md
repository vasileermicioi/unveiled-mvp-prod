## ADDED Requirements

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
