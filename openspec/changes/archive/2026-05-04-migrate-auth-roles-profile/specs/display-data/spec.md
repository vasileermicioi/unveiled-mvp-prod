## ADDED Requirements

### Requirement: Authenticated Viewer Display Data
Display view models SHALL include authenticated viewer data derived from Better Auth session and domain profile rows.

#### Scenario: Guest display data is available
- **WHEN** no session is present
- **THEN** display data identifies the viewer as guest and excludes protected profile, role, saved count, and credit data.

#### Scenario: Member display data is available
- **WHEN** a signed-in user has a member profile
- **THEN** display data includes viewer role, selected language, first and last name where needed, onboarding state, subscription status, credit count, saved count, profile visibility, and logout visibility.

#### Scenario: Partner display data is available
- **WHEN** a signed-in user has a partner profile
- **THEN** display data includes viewer role, selected language, linked partner ID, partner navigation context, and logout visibility.

#### Scenario: Admin display data is available
- **WHEN** a signed-in user has an admin profile
- **THEN** display data includes viewer role, selected language, admin navigation context, and logout visibility.

### Requirement: Auth Action Display Data
Auth-related form and shell actions SHALL expose user-facing loading, success, error, and disabled states.

#### Scenario: Auth form state is available
- **WHEN** signup, login, logout, or password recovery is submitted
- **THEN** display data can represent loading state, field validation messages, form-level errors, success notices, and the next route/action target.

#### Scenario: Protected action state is available
- **WHEN** a protected action is rejected because the viewer is unauthenticated or forbidden
- **THEN** display data can represent an auth-required or forbidden state without exposing protected record details.
