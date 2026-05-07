## ADDED Requirements

### Requirement: Production Display Data Uses Database Mappers
Production product routes SHALL derive user-facing display rows from database-backed data-access mapper output rather than demo fixtures.

#### Scenario: Public display rows are database-backed
- **WHEN** public discovery event cards, category options, partner options, partner cards, or stats render on a product route
- **THEN** those values are derived from `loadPublicDiscoveryData` or a compatible data-access client query result.

#### Scenario: Member display rows are database-backed
- **WHEN** member discovery, saved events, bookings, wallet, ledger, profile, or preferences render on a product route
- **THEN** those values are derived from authorized member data-access output for the current member.

#### Scenario: Partner display rows are database-backed
- **WHEN** partner portal details, event options, guest rows, guest counts, or QR display state render on a product route
- **THEN** those values are derived from authorized partner data-access output for the current partner context.

#### Scenario: Admin display rows are database-backed
- **WHEN** admin dashboard counts, event rows, partner rows, member rows, or expanded operational details render on a product route
- **THEN** those values are derived from authorized admin data-access output.

### Requirement: Demo Display Data Is Workbench-Only
Demo display fixtures SHALL be isolated from production product route behavior.

#### Scenario: Product route avoids fixture rows
- **WHEN** a production Astro route or production React island renders user-facing events, partners, bookings, credits, ledger entries, guests, profile fields, preferences, members, or admin rows
- **THEN** it does not import those rows from `src/lib/unveiled-view-models.ts`.

#### Scenario: Static labels remain shareable
- **WHEN** production UI needs static option labels or copy that is intentionally shared with demos
- **THEN** those constants may be imported from a shared non-fixture module that does not imply demo row ownership.

#### Scenario: Workbench keeps demo fixtures
- **WHEN** `/workbench` renders examples, component states, or fixture previews
- **THEN** it may continue to use demo display data isolated from production routes and product islands.

### Requirement: Live Data Empty And Partial States
Production display surfaces SHALL render stable empty, loading, and partial-data states for database-backed data.

#### Scenario: Public discovery has no featured events
- **WHEN** public discovery data contains no upcoming featured events
- **THEN** the page renders the specified no-upcoming-events empty state instead of falling back to demo events.

#### Scenario: Member has no owned rows
- **WHEN** a member has no saved events, bookings, ledger entries, or preference values
- **THEN** the relevant member surface renders the appropriate empty or default state without fixture rows.

#### Scenario: Operational surface has no rows
- **WHEN** a partner or admin data-access result contains no visible rows for a table
- **THEN** the corresponding table renders an empty state and does not backfill demo operational data.
