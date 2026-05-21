## ADDED Requirements

### Requirement: Visual Parity Regression Coverage
The app SHALL have automated screenshot-based visual regression coverage for critical public, member, partner, and admin route surfaces across both desktop and mobile viewports.

#### Scenario: Public route screenshots are captured
- **WHEN** the visual parity suite runs
- **THEN** landing, discover, membership, how-it-works, and FAQ routes match approved desktop and mobile baselines

#### Scenario: Authenticated route screenshots are captured
- **WHEN** the suite runs with seeded member, partner, and admin users
- **THEN** member discovery, saved, bookings, profile, partner, and admin route screenshots match approved desktop and mobile baselines

#### Scenario: Visual baseline update is intentional
- **WHEN** a screenshot differs from its baseline
- **THEN** the test output identifies the route, viewport, and diff artifact so visual changes can be reviewed before baseline updates
