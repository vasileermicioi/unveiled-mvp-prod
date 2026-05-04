## ADDED Requirements

### Requirement: Authenticated Shell Hydration
The app shell SHALL be able to render from server-resolved Better Auth session and domain profile data.

#### Scenario: Guest shell renders from missing session
- **WHEN** no valid Better Auth session is present
- **THEN** the shell viewer context is guest and shows guest navigation, language controls, and public primary actions.

#### Scenario: Member shell renders from profile
- **WHEN** a signed-in user has role `USER`
- **THEN** the shell viewer context is member and shows member navigation, saved count, credit count, profile control, language control, and logout control from hydrated profile data.

#### Scenario: Partner shell renders from profile
- **WHEN** a signed-in user has role `PARTNER`
- **THEN** the shell viewer context is partner and keeps operational controls page-local while showing global logo, language, and logout controls.

#### Scenario: Admin shell renders from profile
- **WHEN** a signed-in user has role `ADMIN`
- **THEN** the shell viewer context is admin and keeps operational controls page-local while showing global logo, language, and logout controls.

### Requirement: Shell Auth Actions
The app shell SHALL expose auth-related actions that route to Better Auth-backed behavior.

#### Scenario: Logout is selected
- **WHEN** a signed-in viewer selects logout from the shell
- **THEN** the app clears the Better Auth session and returns the viewer to a guest-safe route.

#### Scenario: Profile action is selected
- **WHEN** a member selects the profile shell action
- **THEN** the app routes to the authenticated profile surface only if a valid session remains present.
