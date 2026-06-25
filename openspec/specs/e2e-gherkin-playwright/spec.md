## Purpose

Define the Playwright runner that executes the per-domain Gherkin feature files through the shared step registry.
## Requirements
### Requirement: Gherkin Test Integration
The testing architecture SHALL support executing Gherkin feature files (`.feature`) directly within the Playwright test runner.

#### Scenario: Playwright test runner parses feature specifications
- **WHEN** a developer runs the E2E test command (e.g., `bun run test:e2e`)
- **THEN** the runner parses feature files defined under `tests/features/<domain>/<surface>.feature` (one file per domain per the `gherkin-domain-features` capability)
- **AND** maps Gherkin step syntax (`Given`, `When`, `Then`, `And`) to Playwright execution steps

### Requirement: Proximity And Layout Selectors
Step definitions SHALL locate UI elements relative to visible text labels or layout positions to ensure high resilience to ID changes.

#### Scenario: Input selection relative to text label
- **WHEN** filling out forms like login or billing details in E2E tests
- **THEN** fields are targeted using proximity indicators from `tests/steps/selectors/proximity.ts` (e.g. `getFieldNearestTo("Email")` or `getFieldNearestTo("SEPA")`)
- **AND** assertions verify success/failure banners render visually close to their contextual regions through the layout helpers in `tests/steps/selectors/layout.ts`

### Requirement: Responsive Viewports Validation
E2E tests SHALL run against multiple viewport dimensions to ensure layouts adapt correctly across devices.

#### Scenario: Menu collapses on mobile viewport
- **WHEN** E2E tests execute against a mobile viewport size
- **THEN** the test verifies that standard desktop navigation items collapse into the mobile drawer
- **AND** the drawer triggers open/close actions successfully via layout buttons resolved through the layout helpers

### Requirement: Localization And Theme Validation
The E2E tests SHALL validate that switching languages updates local cookies and translates page layout elements correctly.

#### Scenario: Switching language translates layout elements
- **WHEN** a visitor clicks the language toggle button (e.g., "EN" or "DE") in the header
- **THEN** the browser stores the selected language in the cookie (e.g. `unveiled_lang=EN`)
- **AND** the page content and menu labels are translated into the chosen language

### Requirement: Authentication And Access Protection
The E2E tests SHALL validate member authentication flows and enforce role-based route access controls.

#### Scenario: Authenticated user redirects to member dashboard
- **WHEN** a member logs in with valid credentials
- **THEN** the session is hydrated and user is redirected to the home feed page `/en/app`

#### Scenario: Unauthenticated users are redirected to landing page
- **WHEN** a guest attempts to directly navigate to a protected page (e.g., `/en/bookings`, `/en/profile`)
- **THEN** the request is intercepted and redirected back to the login/landing screen `/en/`

### Requirement: Booking Flow And Redemption Protocols
The E2E tests SHALL validate event bookings, waitlist entry, and ticket redemptions for active members.

#### Scenario: Active member successfully books an event
- **WHEN** a member clicks "Book now" on an event card with capacity
- **THEN** a booking confirmation modal is displayed containing event details
- **WHEN** the member clicks "Confirm access"
- **THEN** the booking transaction completes successfully
- **AND** the modal presents the access validation and unique redemption code

### Requirement: Calendar Integration
The E2E tests SHALL validate that successful booking screens display option download links for personal calendars.

#### Scenario: Booking success screen enables calendar download
- **WHEN** a member successfully completes a booking
- **THEN** the confirmation modal displays a calendar sync download button
- **AND** clicking the button downloads a valid `.ics` file

### Requirement: Partner Portal Validation
The E2E tests SHALL validate that venue partners can access the portal and process guest check-ins.

#### Scenario: Venue partner performs check-in status verification
- **WHEN** a partner is logged in on their venue portal `/en/partner`
- **THEN** the page displays the list of scheduled events and attendees
- **WHEN** the partner verifies the attendance status of a booking code
- **THEN** they trigger check-in actions and update the database state successfully

### Requirement: Administrator Operations Dashboard
The E2E tests SHALL validate that admins can navigate administrative control tabs and tables.

#### Scenario: Admin views paginated event, partner, and member records
- **WHEN** an admin accesses the operational dashboard `/en/admin`
- **THEN** they can click through tab buttons to view paginated grids of events, partners, and member profiles
- **AND** pagination controls (Previous/Next) traverse the page views correctly

### Requirement: Runner Lives At tests/parity/gherkin.spec.ts And Walks The Per-Domain Feature Tree
The single legacy `core-platform.feature` SHALL be replaced by the per-domain feature files declared by the `gherkin-domain-features` capability, and the runner SHALL live at `tests/parity/gherkin.spec.ts` (renamed from `e2e-gherkin.spec.ts`) and dispatch to the shared step registry under `tests/steps/verbs/`. The runner SHALL delegate any scenario that carries a `@story(component=…, story=…)` tag to the storybook Playwright project under `tests/storybook/` (see the `gherkin-storybook-interaction-tests` capability); the runner SHALL NOT implement its own storybook navigation.

#### Scenario: The runner walks the per-domain feature tree
- **WHEN** the runner at `tests/parity/gherkin.spec.ts` is invoked
- **THEN** it walks every `tests/features/**/*.feature` file
- **AND** it dispatches each step to a handler registered in `tests/steps/verbs/`
- **AND** it does not depend on the legacy `core-platform.feature` content

#### Scenario: The runner delegates tagged scenarios to the storybook project
- **WHEN** the runner reads a scenario that carries a `@story(component=…, story=…)` tag
- **THEN** the runner emits a marker (`test.skip()` with a storybook-project pointer) so the storybook project is the only one that executes the scenario
- **AND** the real-route project does not duplicate the execution of the scenario

#### Scenario: The legacy feature file is reduced to an empty header
- **WHEN** the legacy `tests/features/core-platform.feature` is read
- **THEN** the file contains only an empty `Feature:` header
- **AND** the 09-iteration parity-smoke migration moves the last smoke scenario into `tests/features/infrastructure/parity-smoke.feature`

### Requirement: Iteration 13 E2E Consolidation Reference

The per-domain gherkin parity runner at `tests/parity/gherkin.spec.ts` SHALL be cited by every iteration-13 refactor proposal through the `design-system-e2e-tests-collect` OpenSpec change rather than restating runner assumptions, selector discipline, or fixture layout in each proposal.

#### Scenario: Iteration-13 proposal cites the consolidation change

- **WHEN** an iteration-13 refactor proposal lists its gherkin parity obligations in its `Definition of done` block
- **THEN** the proposal references `design-system-e2e-tests-collect` by name
- **AND** the proposal does not restate runner location, selector helpers, or fixture layout inline

#### Scenario: Runner remains the single gherkin entry point

- **WHEN** the gherkin runner executes against the orchestrator's port-4320 dev proxy
- **THEN** it walks every `tests/features/**/*.feature` file under the per-domain tree declared by the `gherkin-domain-features` capability
- **AND** it does not introduce a second runner for the iteration-13 refactors

