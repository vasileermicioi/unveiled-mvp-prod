## ADDED Requirements

### Requirement: Language Preference Persistence
Auth and viewer hydration SHALL resolve, persist, and refresh selected language consistently for guest and authenticated member flows.

#### Scenario: Guest language resolves from cookie
- **WHEN** a request has no authenticated session
- **THEN** viewer and shell hydration use the persisted guest language cookie when valid
- **AND** fall back to the default supported language when the cookie is missing or invalid

#### Scenario: Member language resolves from profile
- **WHEN** a request has an authenticated member, partner, or admin session
- **THEN** viewer and shell hydration use the selected language stored on the authenticated profile when valid
- **AND** fall back to the default supported language when the stored profile language is missing or invalid

#### Scenario: Member language update is authorized
- **WHEN** an authenticated member submits a language preference update
- **THEN** the action authorizes against the current member identity before mutating the profile language
- **AND** subsequent viewer, shell, and member route display data use the updated language

#### Scenario: Guest language update does not require profile mutation
- **WHEN** a guest switches language
- **THEN** the app updates only the guest language cookie
- **AND** no authenticated profile mutation is attempted
