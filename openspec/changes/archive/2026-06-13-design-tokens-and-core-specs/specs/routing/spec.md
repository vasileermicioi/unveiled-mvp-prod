## ADDED Requirements

### Requirement: Canonical /[lang]/... Route Table Exists
The application SHALL publish a canonical route table that lists every route under `/[lang]/...`, the surface it belongs to, the viewer kinds allowed, and the matching TypeSpec operation id.

#### Scenario: Every committed route appears in the table
- **WHEN** a contributor adds a new Astro page under `src/pages/[lang]/`
- **THEN** the same route appears in the routing spec's route table
- **AND** the table entry names the surface (public, member, partner, admin), the allowed viewer kinds, and the matching TypeSpec operation id

#### Scenario: Routes are grouped by surface
- **WHEN** the route table is read
- **THEN** public routes (e.g. `/[lang]/`, `/[lang]/discover`, `/[lang]/how-it-works`, `/[lang]/membership`, `/[lang]/faq`, `/[lang]/login`, `/[lang]/signup`) are listed under the public surface
- **AND** member routes (e.g. `/[lang]/app`, `/[lang]/saved`, `/[lang]/bookings`, `/[lang]/profile`) are listed under the member surface
- **AND** partner routes (e.g. `/[lang]/partner`, `/[lang]/partner/events`, `/[lang]/partner/guests`, `/[lang]/partner/check-in`) are listed under the partner surface
- **AND** admin routes (e.g. `/[lang]/admin`, `/[lang]/admin/events`, `/[lang]/admin/partners`, `/[lang]/admin/members`, `/[lang]/admin/exports`) are listed under the admin surface

#### Scenario: Route table is the source of truth for navigation
- **WHEN** a navigation control targets a product surface
- **THEN** the target URL is read from the routing spec's route table
- **AND** no navigation control hardcodes a route string that is not in the table

### Requirement: Public, Member, Partner, and Admin Surfaces Are Disjoint
The application SHALL treat the four surfaces as disjoint permission scopes, and the routing spec SHALL declare which viewer kinds are allowed on each route.

#### Scenario: Public routes accept Guests
- **WHEN** a Guest visits a public route from the route table
- **THEN** the middleware allows the request through without an auth challenge
- **AND** the page renders the guest navigation

#### Scenario: Member routes accept Members
- **WHEN** a Member visits a member route from the route table
- **THEN** the middleware allows the request through
- **AND** the page renders the member navigation

#### Scenario: Partner routes accept Partners
- **WHEN** a Partner visits a partner route from the route table
- **THEN** the middleware allows the request through
- **AND** operational controls are rendered from the page-local content area

#### Scenario: Admin routes accept Admins
- **WHEN** an Admin visits an admin route from the route table
- **THEN** the middleware allows the request through
- **AND** operational controls are rendered from the page-local content area

#### Scenario: Cross-surface access is rejected
- **WHEN** a Member visits an admin or partner route
- **THEN** the middleware redirects the viewer to a safe route for their surface (per the redirect-after-login table) and does not render the operational page

#### Scenario: Guest access to a protected route is challenged
- **WHEN** a Guest visits a member, partner, or admin route
- **THEN** the middleware redirects to `/[lang]/login?redirect=...` per the redirect-after-login table

### Requirement: Middleware Guard Order Is Declared
The routing spec SHALL declare the canonical order of middleware guards so a contributor can reason about request flow without reading the middleware code.

#### Scenario: Guards run in the declared order
- **WHEN** a request hits the middleware
- **THEN** the routing spec's declared order is: language resolution → viewer hydration → route-table match → permission check → redirect-or-render
- **AND** the actual middleware implementation runs them in that order

#### Scenario: Language resolution precedes viewer hydration
- **WHEN** a request arrives with an unsupported language prefix
- **THEN** the language guard runs before the viewer hydration guard
- **AND** the request is normalized (e.g. redirected to the default language) before any database lookup for the viewer

#### Scenario: Viewer hydration precedes permission check
- **WHEN** a request matches a protected route
- **THEN** the viewer is hydrated from Better Auth and Drizzle before the permission check runs
- **AND** the permission check operates on the hydrated `Viewer.kind`

### Requirement: Adding a New Route Requires Three Updates
The routing spec SHALL declare that adding a new route requires updating the route table, the LikeC4 model, and the TypeSpec contract before the route can be merged.

#### Scenario: Missing route table entry is a review blocker
- **WHEN** a contributor opens a PR that adds a new Astro page
- **THEN** the routing spec's route table contains the new route
- **AND** the LikeC4 model references the route by its element id
- **AND** the TypeSpec contract declares the matching operation

#### Scenario: Adding a route without updating the route table fails review
- **WHEN** a contributor adds a new Astro page without updating the route table
- **THEN** the PR is blocked at review until the route table, LikeC4 model, and TypeSpec contract are all updated
