## MODIFIED Requirements

### Requirement: Localized Action Validation Errors
Action validation schemas and server-side operations SHALL return failure/validation error messages and success feedback in the language specified by the active guest session or member locale.

#### Scenario: Validation failure returns localized message
- **WHEN** an action input validation fails
- **THEN** the returned validation error details are localized into the language specified by the active viewer or request header language parameter

## ADDED Requirements

### Requirement: Complete Localization Verification of Form and Action Errors
All input forms, action responses, and validation constraints SHALL return complete, error-free translations in both German and English without utilizing hardcoded language fallbacks.

#### Scenario: Validation error is translated
- **WHEN** any server or client input validation fails
- **THEN** all field-level validation messages and top-level alerts SHALL be rendered in the current route language
