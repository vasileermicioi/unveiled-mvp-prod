## ADDED Requirements

### Requirement: Navigation Uses URL Routes
Shell navigation SHALL navigate to stable route URLs for product surfaces and derive selected state from the current route.

#### Scenario: Nav item is selected
- **WHEN** a shell nav item is activated
- **THEN** the browser navigates to the route for that product surface
- **AND** the selected nav item is derived from the current route.

#### Scenario: Guest navigation targets public routes
- **WHEN** guest navigation renders
- **THEN** Discover, How it works, Membership, and FAQ controls target `/discover`, `/how-it-works`, `/membership`, and `/faq`.

#### Scenario: Member navigation targets member routes
- **WHEN** member navigation renders
- **THEN** Current access, saved events, bookings, and profile controls target `/app`, `/saved`, `/bookings`, and `/profile`.

#### Scenario: Operational navigation targets operational routes
- **WHEN** partner or admin navigation renders
- **THEN** global operational entry points target `/partner` for partners and `/admin` for admins.

#### Scenario: Mobile nav renders route controls
- **WHEN** the shell renders on small screens
- **THEN** all role-relevant product routes remain reachable without exposing demo or workbench-only controls.

### Requirement: Shell Active State Is Route-Derived
The app shell SHALL use route display data as the source of truth for active navigation state.

#### Scenario: Current route is public
- **WHEN** a public page renders
- **THEN** the matching public navigation action receives active treatment when it exists in the visible shell.

#### Scenario: Current route is protected
- **WHEN** a member, partner, or admin page renders
- **THEN** the matching role-specific navigation action receives active treatment.

#### Scenario: Hydrated interactions do not replace route state
- **WHEN** hydrated shell controls handle local UI state
- **THEN** they do not change the primary active product surface without a URL navigation.
