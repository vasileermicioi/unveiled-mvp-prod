## ADDED Requirements

### Requirement: URL-Backed Product Routes
The app SHALL expose stable Astro routes for all legacy-visible product surfaces while preserving the target app shell.

#### Scenario: Public routes render
- **WHEN** a visitor opens `/`, `/discover`, `/how-it-works`, `/membership`, or `/faq`
- **THEN** the corresponding public page renders inside the target app shell
- **AND** the URL remains stable after hydration.

#### Scenario: Member routes render
- **WHEN** an authenticated member opens `/app`, `/saved`, `/bookings`, or `/profile`
- **THEN** the corresponding member surface renders with server-authorized display data.

#### Scenario: Operational routes render
- **WHEN** an authenticated partner opens `/partner`
- **THEN** partner portal content renders.
- **WHEN** an authenticated admin opens `/admin`
- **THEN** admin operations content renders.

#### Scenario: Member app route owns discovery
- **WHEN** an authenticated member opens `/app`
- **THEN** the app renders member discovery/current-access content rather than redirecting to public `/discover`.

#### Scenario: Venue check-in route remains target-native
- **WHEN** a visitor opens `/venue-check-in/[partnerId]?token=...`
- **THEN** the target QR check-in route remains available as the visible replacement for legacy QR query handling.

### Requirement: Route Pages Own Initial Rendering
Each URL-backed page SHALL own its initial server rendering state instead of depending on hydrated local view switching for primary route selection.

#### Scenario: Route determines visible surface
- **WHEN** any URL-backed product route renders
- **THEN** the visible page surface is derived from the requested route on the server
- **AND** hydration preserves that surface rather than replacing it with a demo default view.

#### Scenario: Page-specific content remains scoped
- **WHEN** route parity is implemented
- **THEN** page components may reuse shared shell and visual primitives
- **AND** they do not require completing unrelated form workflows that are outside this change.
