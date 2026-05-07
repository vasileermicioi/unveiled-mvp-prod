## ADDED Requirements

### Requirement: Route-Scoped Server Display Data
URL-backed product routes SHALL load display data through server-side loaders scoped to the route surface and authorized viewer.

#### Scenario: Public route data loads
- **WHEN** `/discover`, `/how-it-works`, `/membership`, or `/faq` renders
- **THEN** the page loads only public display data and does not require an authenticated session.

#### Scenario: Member route data loads
- **WHEN** `/app`, `/saved`, `/bookings`, or `/profile` renders for an authenticated member
- **THEN** the page loads member-owned display data only after member authorization succeeds.

#### Scenario: Partner route data loads
- **WHEN** `/partner` renders for an authenticated partner
- **THEN** the page loads only data owned by the partner profile's partner context.

#### Scenario: Admin route data loads
- **WHEN** `/admin` renders for an authenticated admin
- **THEN** the page loads administrative display data only after admin authorization succeeds.

#### Scenario: Redirect prevents protected reads
- **WHEN** route ownership evaluation returns a redirect for a protected route
- **THEN** protected server loaders for the rejected route are not executed.

### Requirement: Route Initial Data Hydrates Consistently
SSR-loaded route data SHALL hydrate React islands with the same surface identity, query keys, and display model shapes used by client refetches.

#### Scenario: Route data is serialized
- **WHEN** an Astro route passes initial data into a hydrated product island
- **THEN** the data is serializable and matches the display model expected by that route surface.

#### Scenario: Client refetch matches SSR data
- **WHEN** a hydrated route refetches its display data
- **THEN** it uses query keys and fetcher output shapes compatible with the SSR-loaded initial data.
