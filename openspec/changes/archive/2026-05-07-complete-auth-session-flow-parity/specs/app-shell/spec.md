## ADDED Requirements

### Requirement: Session-Driven Navbar State
The navbar SHALL reflect the current user's session state, including authentication status, role, and key domain metrics.

#### Scenario: Member navbar renders
- **WHEN** an authenticated user with role `USER` views the app
- **THEN** the navbar displays the member's credit balance, saved items count, and profile link.

#### Scenario: Partner navbar renders
- **WHEN** an authenticated user with role `PARTNER` views the app
- **THEN** the navbar displays a link to the Partner Portal and the venue name.

### Requirement: Global Language Persistence
The app SHALL persist the user's selected language across the session and navigation.

#### Scenario: Language preference synced to profile
- **WHEN** a user changes their language selection
- **THEN** the app updates the local cookie for immediate feedback
- **AND** the server persists the preference to the user's domain profile.
