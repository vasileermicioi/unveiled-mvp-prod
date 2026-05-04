## ADDED Requirements

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
