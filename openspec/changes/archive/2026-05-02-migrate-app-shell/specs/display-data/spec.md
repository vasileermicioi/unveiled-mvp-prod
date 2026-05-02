## ADDED Requirements

### Requirement: Shell Display View Models
The app shell SHALL receive UI-facing display data for global frame, navigation, page container, and state wrapper rendering.

#### Scenario: Navigation display data is available
- **WHEN** navigation renders
- **THEN** required display data is viewer context, active navigation item, logo variant, selected language, visible navigation labels, optional tagline, saved count, credit count, profile visibility, logout visibility, and context-aware primary action label

#### Scenario: Shell action display data is available
- **WHEN** header actions or page top-bar actions render
- **THEN** required display data is action label, optional icon, target or callback identifier, active state, disabled state, loading state, optional count badge, and optional accessibility label

#### Scenario: Breadcrumb display data is available
- **WHEN** breadcrumbs render
- **THEN** required display data is ordered breadcrumb labels, optional targets, and current-item state

#### Scenario: Status banner display data is available
- **WHEN** shell status messages render
- **THEN** required display data is status type, localized message text, optional icon, optional support email, optional target action label, and dismissibility or action availability

#### Scenario: Global state wrapper data is available
- **WHEN** loading, error, or empty wrappers render
- **THEN** required display data is state type, title or loading label, explanatory message, optional icon, optional retry action label, optional CTA label, and optional disabled/loading action state

### Requirement: Discovery And Modal Shell Display Data
Discovery and modal shell containers SHALL receive only the display data needed for shell structure and leave feature content data to page components.

#### Scenario: Discovery shell display data is available
- **WHEN** discovery shell structure renders
- **THEN** required display data is active range label, visible result count, filter panel open state, map panel open state, active filter count, filter toggle label, map toggle label, and optional empty-state display data

#### Scenario: Modal shell display data is available
- **WHEN** a full-screen modal shell renders
- **THEN** required display data is modal open state, close action availability, logo variant, optional heading/metadata labels, loading state, and scroll/content layout mode
