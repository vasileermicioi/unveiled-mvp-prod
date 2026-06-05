# e2e-gherkin-playwright Specification

## Purpose
TBD - created by archiving change e2e-gherkin-playwright. Update Purpose after archive.
## Requirements
### Requirement: Gherkin Test Integration
The testing architecture SHALL support executing Gherkin feature files (`.feature`) directly within the Playwright test runner.

#### Scenario: Playwright test runner parses feature specifications
- **WHEN** a developer runs the E2E test command (e.g., `bun run test:e2e`)
- **THEN** the runner parses feature files defined under `tests/features/`
- **AND** maps Gherkin step syntax (`Given`, `When`, `Then`, `And`) to Playwright execution steps

### Requirement: Proximity And Layout Selectors
Step definitions SHALL locate UI elements relative to visible text labels or layout positions to ensure high resilience to ID changes.

#### Scenario: Input selection relative to text label
- **WHEN** filling out forms like login or billing details in E2E tests
- **THEN** fields are targeted using proximity indicators (e.g., locating the input box nearest to "Email" or "SEPA")
- **AND** assertions verify success/failure banners render visually close to their contextual regions

### Requirement: Responsive Viewports Validation
E2E tests SHALL run against multiple viewport dimensions to ensure layouts adapt correctly across devices.

#### Scenario: Menu collapses on mobile viewport
- **WHEN** E2E tests execute against a mobile viewport size
- **THEN** the test verifies that standard desktop navigation items collapse into the mobile drawer
- **AND** the drawer triggers open/close actions successfully via layout buttons

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

