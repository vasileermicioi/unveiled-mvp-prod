## ADDED Requirements

### Requirement: Member Onboarding And Preference Actions
The app SHALL validate and persist member onboarding, preference, profile, billing address, newsletter, and language mutations through server actions.

#### Scenario: Onboarding values are saved
- **WHEN** a member submits or skips onboarding
- **THEN** the action validates submitted preference fields, persists onboarding completion state, and returns a success result for routing to discovery

#### Scenario: Profile preferences are saved
- **WHEN** a member updates profile, preferences, billing address, newsletter preference, or language preference
- **THEN** the action validates fields server-side, persists the change, and returns refreshed data or invalidation metadata for profile and shell queries

### Requirement: Member Saved Event Actions
The app SHALL provide authorized save and unsave event actions that refresh dependent member discovery state.

#### Scenario: Member saves an event
- **WHEN** a member saves an upcoming event
- **THEN** the action persists the saved state for that member
- **AND** event card state and shell saved count are refreshed after mutation

#### Scenario: Member unsaves an event
- **WHEN** a member unsaves an event
- **THEN** the action removes the saved state for that member
- **AND** event card state and shell saved count are refreshed after mutation
