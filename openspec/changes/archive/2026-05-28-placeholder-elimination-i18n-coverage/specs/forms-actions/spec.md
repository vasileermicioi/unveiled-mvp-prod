## ADDED Requirements

### Requirement: Localized Action Validation Errors
Action validation schemas and server-side operations SHALL return failure/validation error messages and success feedback in the language specified by the active guest session or member locale.

#### Scenario: Validation failure returns localized message
- **WHEN** an action input validation fails
- **THEN** the returned validation error details are localized into the language specified by the active viewer or request header language parameter
