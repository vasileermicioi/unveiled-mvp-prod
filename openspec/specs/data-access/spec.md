# data-access Specification

## Purpose
TBD - created by archiving change migrate-data-access-query-layer. Update Purpose after archive.
## Requirements
### Requirement: Server Data Loaders
The app SHALL expose typed server-side data loaders for migrated public, member, partner, and admin product surfaces.

#### Scenario: Public discovery data is loaded
- **WHEN** a public discovery route renders
- **THEN** the server loader returns featured events, active partners, category/filter options, public stats, and display-ready discovery models without requiring an authenticated session.

#### Scenario: Member data is loaded
- **WHEN** an authenticated member route renders member discovery, saved events, bookings, profile, wallet, or preferences
- **THEN** the server loader verifies the member session and returns only data owned by that member mapped to display view models.

#### Scenario: Partner data is loaded
- **WHEN** a partner portal route renders guest-list or venue data
- **THEN** the server loader verifies partner role and partner ownership before returning guest rows, event options, check-in state, and portal display data for that partner.

#### Scenario: Admin data is loaded
- **WHEN** an admin dashboard route renders events, partners, members, or operational overview data
- **THEN** the server loader verifies admin role before returning administrative display models.

### Requirement: Repository Query Modules
The app SHALL organize Drizzle reads behind typed repository/query modules instead of duplicating database queries in pages and components.

#### Scenario: Repository reads database rows
- **WHEN** a loader needs event, partner, booking, profile, wallet, preference, guest-list, or admin data
- **THEN** it calls a server repository/query module that encapsulates Drizzle joins, filters, ordering, and relation loading for that surface.

#### Scenario: UI receives mapped data
- **WHEN** repository rows are returned to a page, endpoint, or React island
- **THEN** they are mapped to the existing display-data view models before crossing the UI boundary.

#### Scenario: Client component needs data
- **WHEN** a hydrated React island needs product data
- **THEN** it calls a route/API fetcher or receives SSR initial data rather than importing Drizzle, database clients, or server-only repository modules.

### Requirement: Query Keys And Invalidation
The app SHALL define shared TanStack Query keys and invalidation conventions for every migrated query surface.

#### Scenario: Query key is created
- **WHEN** a public, member, partner, or admin query is defined
- **THEN** its key includes the surface, relevant entity identifiers, viewer ownership scope, and filter inputs needed to avoid cache collisions.

#### Scenario: Mutation succeeds
- **WHEN** an Astro Action or API mutation changes events, saved events, bookings, credits, profile preferences, partner guest state, admin events, partners, members, or dashboard data
- **THEN** the response includes invalidation hints for every affected shared query key.

#### Scenario: Client consumes invalidation hints
- **WHEN** a React island receives a successful action/API result with invalidation hints
- **THEN** it invalidates or refetches the affected TanStack Query keys before presenting stale dependent data as current.

### Requirement: SSR Prefetch And Hydration
The app SHALL support SSR-prefetched route data and React island hydration for interactive views.

#### Scenario: Page renders initial data
- **WHEN** an Astro page owns the initial data for a product surface
- **THEN** it loads authorized server data during SSR and renders the first route state without depending on a client-only fetch.

#### Scenario: Island hydrates with initial data
- **WHEN** a React island continues interaction for SSR-loaded data
- **THEN** it receives serializable initial data and uses the same query key and fetcher output shape as subsequent client refetches.

#### Scenario: Loading and error states render
- **WHEN** a client query is pending, refetching, rejected, or unauthorized
- **THEN** the island renders a stable loading, stale, empty, or safe error state that matches the page's display contract.

### Requirement: Authorization Before Reads
Protected data access SHALL verify required session, role, and ownership before reading unauthorized rows.

#### Scenario: Member query lacks session
- **WHEN** a member-scoped query is requested without an authenticated member session
- **THEN** the server rejects the request before reading member-owned rows.

#### Scenario: Partner query targets another partner
- **WHEN** a partner-scoped query requests data for a partner not owned by the current partner user
- **THEN** the server rejects the request before reading protected guest, booking, or event rows.

#### Scenario: Admin query lacks role
- **WHEN** an admin-scoped query is requested by a non-admin viewer
- **THEN** the server rejects the request before reading administrative rows.

### Requirement: Explicit Refetch Semantics
The app SHALL replace Firebase realtime listener assumptions with explicit stale-time, refetch, and invalidation behavior.

#### Scenario: Capacity-sensitive data is displayed
- **WHEN** event capacity, booking availability, credit balance, or guest check-in state is displayed
- **THEN** the query configuration uses conservative stale behavior or mutation-driven invalidation suitable for data that can change quickly.

#### Scenario: Public discovery metadata is displayed
- **WHEN** featured events, active partner lists, or category/filter metadata are displayed without user-specific state
- **THEN** the query configuration may use a longer stale time while still supporting manual refresh and mutation invalidation when admin changes affect public data.

#### Scenario: Legacy realtime code is absent
- **WHEN** product data loaders, fetchers, hooks, or invalidation helpers are implemented
- **THEN** they do not import `_old_app/store.ts`, `_old_app/queryClient.ts`, Firebase snapshot listeners, Firestore, Firebase Functions, or Firebase Auth runtime modules.

