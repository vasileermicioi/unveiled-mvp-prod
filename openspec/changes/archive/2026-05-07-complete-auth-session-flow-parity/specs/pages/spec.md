## ADDED Requirements

### Requirement: Mandatory Onboarding Interception
The app SHALL intercept attempts to access protected routes if the user's profile is incomplete.

#### Scenario: Redirect to onboarding
- **WHEN** an authenticated user with `onboardingComplete: false` attempts to access `/app`, `/admin`, or `/partner`
- **THEN** the app redirects the user to `/onboarding`.

### Requirement: Post-Auth Role Routing
The app SHALL route users to the appropriate product surface based on their domain role after successful authentication.

#### Scenario: Admin login redirect
- **WHEN** an authenticated user with role `ADMIN` logs in
- **THEN** the app redirects them to `/admin`.

#### Scenario: Partner login redirect
- **WHEN** an authenticated user with role `PARTNER` logs in
- **THEN** the app redirects them to `/partner`.
