## MODIFIED Requirements

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
