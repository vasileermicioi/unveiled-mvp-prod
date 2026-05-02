## ADDED Requirements

### Requirement: Target-Native Shell Composition
The app shell SHALL recreate the visible legacy frame using migrated target UI-system primitives and target-native layout components.

#### Scenario: Primary shell frame renders
- **WHEN** a primary page renders inside the shell
- **THEN** the viewport uses the brand-yellow page background with brand-dark text
- **AND** a sticky white navigation/header appears above the page content with a dark bottom border
- **AND** the main content is centered in a wide responsive container with mobile and desktop padding matching the legacy shell intent

#### Scenario: Shell uses migrated UI foundation
- **WHEN** shell components render buttons, badges, panels, state wrappers, or icon controls
- **THEN** they use the already migrated UI-system tokens and primitives
- **AND** they do not introduce a parallel shell-specific visual system

#### Scenario: Legacy app remains reference-only
- **WHEN** the shell is implemented
- **THEN** no runtime code, state management, routing internals, or framework-specific implementation is imported from `_old_app/`
- **AND** `_old_app/` remains unmodified

### Requirement: Shell Navigation Variants
The app shell SHALL render guest, member, partner, and admin navigation variants from shell display data.

#### Scenario: Guest navigation renders
- **WHEN** the viewer context is guest
- **THEN** the navigation shows logo, optional curated cultural access tagline, public navigation actions, language toggle, and context-aware Login or Become a member action
- **AND** the current public page action uses the active brand-yellow and dark-border treatment

#### Scenario: Member navigation renders
- **WHEN** the viewer context is member
- **THEN** the navigation shows Current access, FAQ, saved events, bookings, credits, profile, language toggle, and logout controls where display data marks them visible
- **AND** saved events and credits render their count/badge values when provided

#### Scenario: Operational navigation renders
- **WHEN** the viewer context is partner or admin
- **THEN** the navigation keeps logo, language toggle, and logout controls visible
- **AND** operational tabs, filters, exports, and management tools remain page-local content rather than required global-shell controls

#### Scenario: Responsive navigation renders
- **WHEN** navigation is displayed on small viewports
- **THEN** secondary text labels can collapse while required icons, active state indicators, count badges, language controls, and logout/profile controls remain reachable

### Requirement: Shared Page Shell Containers
The app shell SHALL provide reusable containers for page title areas, breadcrumbs when present, top-bar actions when present, and shell-level status placement.

#### Scenario: Page container renders
- **WHEN** page content is placed inside the shared shell container
- **THEN** it inherits consistent max-width, responsive spacing, and vertical rhythm from the shell
- **AND** page-specific content remains supplied by page components

#### Scenario: Breadcrumbs render when present
- **WHEN** breadcrumb display data is provided
- **THEN** breadcrumbs appear in the page title/top-bar area before or alongside the page heading
- **AND** each breadcrumb label and active/current state is visible without requiring legacy routing internals

#### Scenario: Top-bar actions render when present
- **WHEN** top-bar action display data is provided
- **THEN** actions appear in the page title/top-bar area using migrated button/icon primitives
- **AND** disabled, loading, active, and count states use migrated UI-system control treatments

#### Scenario: Status banners render
- **WHEN** shell status messages are provided
- **THEN** venue check-in, membership, frozen-account, or other shell-level notices render near the top of the relevant page container using the legacy high-contrast placement and migrated panel primitives

### Requirement: Global State Layout Wrappers
The app shell SHALL expose shared loading, error, and empty wrappers for page-level states.

#### Scenario: Loading wrapper renders
- **WHEN** a page-level loading state is provided
- **THEN** the shell renders a branded loading surface in the page content area without changing navigation/header visibility

#### Scenario: Error wrapper renders
- **WHEN** a page-level error state is provided
- **THEN** the shell renders a branded error surface with visible message text and optional retry action

#### Scenario: Empty wrapper renders
- **WHEN** a page-level empty state is provided
- **THEN** the shell renders a branded empty surface with visible title, explanatory text, optional icon, and optional CTA

### Requirement: Discovery And Modal Shell Containers
The app shell SHALL provide reusable structural containers for discovery and full-screen modal flows without owning page-specific content.

#### Scenario: Discovery shell structure renders
- **WHEN** discovery-style content uses the shell container
- **THEN** it can render active range summary, visible count, filter toggle, map toggle, collapsible panel area, grid content slot, and empty-state slot in the legacy shell structure
- **AND** opening filters can close map and opening map can close filters through caller-provided state/actions

#### Scenario: Modal shell structure renders
- **WHEN** a full-screen modal flow is active
- **THEN** the shell provides a viewport-covering brand-yellow modal layer with logo/header area, large close control, scrollable content region, and responsive one/two-column content support
- **AND** modal-specific body content remains supplied by the feature component
