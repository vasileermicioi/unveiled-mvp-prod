## ADDED Requirements

### Requirement: Route-Level Data Ownership
Pages SHALL own their initial data loading through server loaders and pass only display-ready data to child UI.

#### Scenario: Public page owns public loader
- **WHEN** a public page renders discovery, partner preview, how-it-works, FAQ, or landing data
- **THEN** the route loads or selects its initial display data server-side and passes stable display-ready props to components.

#### Scenario: Member page owns member loader
- **WHEN** a member page renders discovery with saved state, bookings, profile, wallet, preferences, or onboarding state
- **THEN** the route verifies the viewer and loads member-owned display data before rendering protected UI.

#### Scenario: Partner page owns partner loader
- **WHEN** a partner portal page renders guest lists, event options, check-in state, or venue identity
- **THEN** the route verifies partner ownership and loads only partner-owned display data.

#### Scenario: Admin page owns admin loader
- **WHEN** an admin page renders dashboards, event management, partner management, member management, or operations data
- **THEN** the route verifies admin role and loads administrative display data through the data access layer.

### Requirement: Hydrated Island Query Integration
Pages with interactive React islands SHALL use shared query keys and initial data consistently.

#### Scenario: Island receives SSR initial data
- **WHEN** a React island is hydrated for an SSR-loaded surface
- **THEN** the page passes initial data and query identity that match the island's TanStack Query fetcher.

#### Scenario: Island refreshes after action
- **WHEN** an island submits an Astro Action or API mutation from a page
- **THEN** the page or island consumes returned invalidation hints so visible route data and hydrated query data refresh coherently.

#### Scenario: Client-only query is used
- **WHEN** a page intentionally defers non-critical or interaction-specific data to a client query
- **THEN** the page still renders a stable initial shell and the island renders loading, empty, and error states that match the page display requirements.
