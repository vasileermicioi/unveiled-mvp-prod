## ADDED Requirements

### Requirement: Membership Page Owns Signup

The `/membership` marketing page SHALL render the signup form (mode
`signup`) below its marketing copy, so a first-time visitor can become
a member without leaving the page. The "Start membership" CTA on the
marketing copy SHALL scroll the page to the form rather than navigating
away. For authenticated viewers, the form SHALL be replaced by an
"Open app" button that navigates to the role-appropriate product
surface.

#### Scenario: /membership shows the signup form inline

- **WHEN** a guest visitor requests `/membership`
- **THEN** the page renders the marketing copy
- **AND** the page renders the signup form below the copy
- **AND** the "Start membership" CTA on the marketing copy scrolls the
  page to the form

#### Scenario: /membership CTA hides for authenticated viewers

- **WHEN** an authenticated viewer requests `/membership`
- **THEN** the marketing copy still renders
- **AND** the form is replaced by an "Open app" button that navigates
  to the role-appropriate product surface