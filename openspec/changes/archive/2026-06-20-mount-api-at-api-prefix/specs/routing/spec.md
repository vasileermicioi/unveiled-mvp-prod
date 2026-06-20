## MODIFIED Requirements

### Requirement: Canonical /[lang]/... Route Table Exists

The application SHALL publish a canonical route table that lists every route under `/[lang]/...`, the surface it belongs to, the viewer kinds allowed, and the matching TypeSpec operation id. After this change, every URL prefixed `/api/*` is dispatched to the API Worker via the Cloudflare service binding declared in `wrangler.toml` (`binding = "API"`) before any Astro routing or middleware guard runs; every other URL is served by the Astro app (or, after change 06, by the routing orchestrator).

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
- **AND** the route table additionally lists `/api/*` as a separate dispatch surface owned by the API Worker (reached via the service binding in `wrangler.toml`)

#### Scenario: Route table is the source of truth for navigation

- **WHEN** a navigation control targets a product surface
- **THEN** the target URL is read from the routing spec's route table
- **AND** no navigation control hardcodes a route string that is not in the table

### Requirement: Middleware Guard Order Is Declared

The routing spec SHALL declare the canonical order of middleware guards so a contributor can reason about request flow without reading the middleware code. After this change, the `/api/*` short-circuit runs **before** the guard chain; everything else flows through the chain unchanged.

#### Scenario: Guards run in the declared order

- **WHEN** a request hits the middleware
- **THEN** the routing spec's declared order is: `/api/*` short-circuit → language resolution → viewer hydration → route-table match → permission check → redirect-or-render
- **AND** the actual middleware implementation runs them in that order

#### Scenario: /api/* short-circuit runs first

- **WHEN** a request arrives at any path under `/api/*`
- **THEN** the middleware short-circuit invokes the Cloudflare service binding `API` (declared in `wrangler.toml`) and returns the response
- **AND** the short-circuit uses `import { env } from "cloudflare:workers"` so it works in Astro v6 (which throws when `context.locals.runtime.env` is read)
- **AND** the language resolution, viewer hydration, route-table match, and permission check guards do not run

#### Scenario: Language resolution precedes viewer hydration

- **WHEN** a request arrives with an unsupported language prefix
- **THEN** the language guard runs before the viewer hydration guard
- **AND** the request is normalized (e.g. redirected to the default language) before any database lookup for the viewer

#### Scenario: Viewer hydration precedes permission check

- **WHEN** a request matches a protected route
- **THEN** the viewer is hydrated from Better Auth and Drizzle before the permission check runs
- **AND** the permission check operates on the hydrated `Viewer.kind`

### Requirement: Public, Member, Partner, and Admin Surfaces Are Disjoint

The application SHALL treat the four surfaces as disjoint permission scopes, and the routing spec SHALL declare which viewer kinds are allowed on each route. After this change, `/api/*` requests bypass the surface check entirely (the API Worker enforces its own authorization via Better Auth and the generated Zod schemas).

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

#### Scenario: /api/* bypasses the surface check

- **WHEN** a request arrives at any path under `/api/*`
- **THEN** the surface permission check does not run
- **AND** the API Worker enforces authorization via Better Auth and the generated Zod schemas
- **AND** an unauthorized request returns a `401` or `403` from the API Worker, not an Astro redirect
