## ADDED Requirements

### Requirement: Collapsible Mobile Navigation Drawer
The app shell SHALL provide a responsive mobile header on narrow screens containing a hamburger toggle button that reveals a collapsible slide-in navigation drawer.

#### Scenario: Mobile drawer is toggled
- **WHEN** the viewer is on a viewport below 1024px and clicks the hamburger menu button
- **THEN** the navigation drawer transitions into view from the side using a smooth CSS transition
- **AND** displaying all role-relevant navigation links, language selector, and logout controls.
