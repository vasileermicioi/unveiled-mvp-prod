## MODIFIED Requirements

### Requirement: Complete Localization Verification of Form and Action Errors
All input forms, action responses, and validation constraints SHALL return complete, error-free translations in both German and English without utilizing hardcoded language fallbacks, and the signup, login, logout, and password-recovery typed server actions SHALL map every Better Auth error code through the typed `AuthErrorCopy` dictionary exposed by `src/lib/i18n.ts`.

#### Scenario: Validation error is translated
- **WHEN** any server or client input validation fails
- **THEN** all field-level validation messages and top-level alerts SHALL be rendered in the current route language.

#### Scenario: Better Auth error is mapped through the typed dictionary
- **WHEN** the signup, login, logout, or password-recovery typed server action returns a failure envelope with a Better Auth error code
- **THEN** the action returns the `safe.error` shape unchanged (so the action result envelope is preserved)
- **AND** the rendered user-facing string is the `i18n.auth.errors.<code>` entry in the active viewer language
- **AND** the action does not embed an English literal in the response payload.

#### Scenario: Unknown Better Auth code uses the missing-key placeholder
- **WHEN** the action receives a Better Auth error code that is not present in the typed `AuthErrorCopy` shape
- **THEN** the rendered string is the `{i18n.missing:<key>}` placeholder (per the i18n-copy spec)
- **AND** a console warning logs the missing key and the active language during development.
