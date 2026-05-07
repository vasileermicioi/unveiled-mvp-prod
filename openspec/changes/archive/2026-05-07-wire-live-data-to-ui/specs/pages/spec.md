## ADDED Requirements

### Requirement: Product Routes Pass Surface Initial Data
Product Astro routes SHALL pass route-specific server-loaded initial data into hydrated React islands.

#### Scenario: Public routes pass public data
- **WHEN** `/discover`, `/how-it-works`, `/membership`, `/faq`, or the landing route renders
- **THEN** the React island receives public surface identity and initial data loaded from the public discovery loader or equivalent public loader output.

#### Scenario: Member routes pass member data
- **WHEN** `/app`, `/saved`, `/bookings`, or `/profile` renders for an authorized member
- **THEN** the React island receives member surface identity, authorized member scope, and initial member data loaded for that member.

#### Scenario: Partner route passes partner data
- **WHEN** `/partner` renders for an authorized partner
- **THEN** the React island receives partner surface identity, authorized partner scope, and initial partner data loaded for that partner.

#### Scenario: Admin route passes admin data
- **WHEN** `/admin` renders for an authorized admin
- **THEN** the React island receives admin surface identity and initial admin data loaded through the admin loader.

### Requirement: Product Pages Render Live Data After Hydration
Hydrated product pages SHALL continue rendering the route's live data through TanStack Query after the initial SSR payload is consumed.

#### Scenario: Hydrated public route keeps public data
- **WHEN** a public route hydrates
- **THEN** visible events, partners, categories, options, and stats remain sourced from the public query result seeded by the route initial data.

#### Scenario: Hydrated member route keeps member data
- **WHEN** a member route hydrates
- **THEN** visible saved state, bookings, credits, ledger entries, profile fields, preferences, and discovery rows remain sourced from member-scoped query data.

#### Scenario: Hydrated partner route keeps partner data
- **WHEN** a partner route hydrates
- **THEN** visible partner details, guest rows, event options, and QR display state remain sourced from partner-scoped query data.

#### Scenario: Hydrated admin route keeps admin data
- **WHEN** an admin route hydrates
- **THEN** visible dashboard counts, event rows, partner rows, and member rows remain sourced from admin query data.

### Requirement: Production Pages Avoid Workbench Fixtures
Production pages SHALL NOT depend on workbench/demo fixtures for user-facing route behavior.

#### Scenario: Product page imports are audited
- **WHEN** a product page or product island renders a user-facing data row
- **THEN** the row comes from route initial data, a data-access hook, or static non-fixture constants.

#### Scenario: Workbench route remains isolated
- **WHEN** `/workbench` renders
- **THEN** fixture usage there does not affect the data rendered by production product routes.
