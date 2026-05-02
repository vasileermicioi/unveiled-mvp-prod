## ADDED Requirements

### Requirement: Target Shell Composition
The app shell SHALL recreate the visible legacy shell using target-app layout components.

#### Scenario: Shell frame renders
- **WHEN** a primary page renders in the target app
- **THEN** it shows the brand-yellow page background, sticky white navigation, dark bottom nav border, centered content container, and responsive page padding visible in `_old_app/App.tsx` and `_old_app/components/Navbar.tsx`

#### Scenario: Shell is not legacy-coupled
- **WHEN** shell behavior is implemented
- **THEN** it does not import or reuse legacy shell code
- **AND** it preserves only visible navigation controls, status messages, and layout behavior

### Requirement: Navigation Visual States
The navigation SHALL support the visible guest, member, partner, and admin control sets described by the baseline shell spec.

#### Scenario: Navigation contexts render
- **WHEN** each viewer context is rendered
- **THEN** visible nav labels, icons, badges, active states, hover states, language toggle states, credit badge, saved-count badge, profile button, and logout button match the legacy visual reference

#### Scenario: Responsive navigation renders
- **WHEN** navigation is viewed on mobile and desktop
- **THEN** secondary text labels collapse or appear according to available space without hiding required icons or status indicators

### Requirement: Discovery And Modal Shell Parity
The target shell SHALL include reusable discovery and modal shell structures matching the legacy visual behavior.

#### Scenario: Discovery shell renders
- **WHEN** discovery content is displayed
- **THEN** active range summary, visible count, filter toggle, map toggle, collapsible panels, event grid container, and empty-state container match the visible legacy structure

#### Scenario: Modal shell renders
- **WHEN** the booking modal is displayed
- **THEN** it covers the viewport with a brand-yellow surface, logo header, large close action, scrollable content, and responsive one/two-column layout matching the legacy modal reference

