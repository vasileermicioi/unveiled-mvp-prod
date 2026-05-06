## ADDED Requirements

### Requirement: Data Access View Model Mapping
Display data SHALL be produced by explicit data access mappers rather than raw database rows or legacy Firebase document shapes.

#### Scenario: Event display model is mapped
- **WHEN** event rows and related partner/booking/saved-state data are loaded for discovery, detail, map, booking, partner, or admin surfaces
- **THEN** the data access layer returns display fields required by the event display requirements without exposing persistence-only fields.

#### Scenario: Booking display model is mapped
- **WHEN** booking, redemption, credit ledger, or guest-list rows are loaded
- **THEN** the data access layer returns booking and ticket display fields required by member, partner, and admin UI requirements.

#### Scenario: Profile display model is mapped
- **WHEN** user profile, wallet, subscription, preference, or admin member rows are loaded
- **THEN** the data access layer returns display fields required by navigation, profile, onboarding, wallet, and admin member UI requirements.

#### Scenario: Legacy store shape is not required
- **WHEN** a page or component renders migrated display data
- **THEN** it does not require `_old_app/store.ts` state shape, Firebase document snapshots, or legacy singleton-store fields.

### Requirement: Query State Display Data
Display data SHALL include the UI states needed for SSR-loaded and client-refetched data.

#### Scenario: Initial SSR data renders
- **WHEN** a page renders server-loaded data
- **THEN** the displayed values, counts, empty states, and labels match the same display contract used after client refetch.

#### Scenario: Client data is stale or refetching
- **WHEN** a hydrated island is using stale initial data or refetching a query
- **THEN** the UI receives enough state to render stale, loading, disabled, or refreshed states without changing the display model shape.

#### Scenario: Query authorization fails
- **WHEN** a protected data query fails authorization
- **THEN** the UI receives a safe error or redirect state and no protected display fields from unauthorized rows.
