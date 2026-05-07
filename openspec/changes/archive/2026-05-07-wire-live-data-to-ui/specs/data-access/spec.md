## ADDED Requirements

### Requirement: Production Surface Query Coverage
The data-access layer SHALL provide loader and client query coverage for every production surface that renders database-backed rows.

#### Scenario: Public discovery query covers visible data
- **WHEN** `/discover` or another public discovery preview route renders
- **THEN** the data-access result includes featured event cards, category options, partner filter options, active partner cards, public stats, and any display metadata needed by the page.

#### Scenario: Member query covers visible data
- **WHEN** `/app`, `/saved`, `/bookings`, or `/profile` renders for an authorized member
- **THEN** the data-access result includes visible discovery events, saved event identifiers, bookings, wallet credit count, ledger entries, profile fields, preference values, and option lists needed by that member surface.

#### Scenario: Partner query covers visible data
- **WHEN** `/partner` renders for an authorized partner
- **THEN** the data-access result includes partner details, event options, guest rows, aggregate guest counts, and venue QR path or missing-token display state for that partner.

#### Scenario: Admin query covers visible data
- **WHEN** `/admin` renders for an authorized admin
- **THEN** the data-access result includes dashboard counts, event rows, partner rows, member rows, and supporting option data needed by the admin UI.

### Requirement: Surface Initial Data Matches Client Fetches
SSR loader output SHALL be serializable and compatible with the TanStack Query fetcher output for the same surface and query key.

#### Scenario: Public initial data is hydrated
- **WHEN** a public page passes initial discovery data into a React island
- **THEN** the island seeds the same public discovery query key and payload shape used by client refetches.

#### Scenario: Member initial data is hydrated
- **WHEN** a member page passes initial member data into a React island
- **THEN** the island seeds member-scoped query keys that include the authorized member identity and any discovery filter inputs.

#### Scenario: Partner initial data is hydrated
- **WHEN** a partner page passes initial partner data into a React island
- **THEN** the island seeds partner-scoped query keys that include the authorized partner identity.

#### Scenario: Admin initial data is hydrated
- **WHEN** an admin page passes initial admin data into a React island
- **THEN** the island seeds admin query keys used for dashboard, events, partners, and members data.

### Requirement: Filtered Discovery Query Consistency
Discovery filters SHALL be normalized consistently across server loaders, API fetchers, query keys, and UI state.

#### Scenario: Filter values are included in query key
- **WHEN** a discovery result is loaded with category, partner, start date, or end date filters
- **THEN** the query key includes the normalized filter values used by the server loader.

#### Scenario: Filtered refetch returns matching shape
- **WHEN** a hydrated discovery view refetches after filter changes
- **THEN** the response shape matches the SSR-loaded discovery data shape for that surface.
