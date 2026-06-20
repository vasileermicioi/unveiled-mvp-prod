## MODIFIED Requirements

### Requirement: Canonical /[lang]/... Route Table Exists

The application SHALL publish a canonical route table that lists every route under `/app/<lang>/...` (per the `app-package` capability), the surface it belongs to, the viewer kinds allowed, and the matching TypeSpec operation id. After this change, every URL prefixed `/api/*` is dispatched to the API Worker via the Cloudflare service binding declared in `wrangler.app.toml` (`binding = "API"`) before any Astro routing or middleware guard runs. The route table now also lists every URL under `/` owned by the `landing-package` capability (the public marketing surface), and the production URL space is the union of the landing surface (`/*`) and the app surface (`/app/*`); the orchestrator in change 06 dispatches `/` to the landing Worker and `/app/*` to the app Worker.

#### Scenario: Every committed route appears in the table

- **WHEN** a contributor adds a new Astro page under `packages/app/src/pages/[lang]/`
- **THEN** the same route appears in the routing spec's route table
- **AND** the table entry names the surface (public, member, partner, admin), the allowed viewer kinds, and the matching TypeSpec operation id
- **AND** the route table records that the route is mounted at `/app/<lang>/...` (the `/app` prefix is the Astro `base`, not part of the route segment)
- **AND** when a contributor adds a new Astro page under `packages/landing/src/pages/`
- **THEN** the same route appears in the landing section of the route table
- **AND** the entry names the marketing surface and is mounted at `/` (no prefix).

#### Scenario: Routes are grouped by surface

- **WHEN** the route table is read
- **THEN** landing routes (e.g. `/`, `/pricing`) are listed under the landing surface and resolve under `/`
- **AND** public routes (e.g. `/app/<lang>/discover`, `/app/<lang>/how-it-works`, `/app/<lang>/membership`, `/app/<lang>/faq`, `/app/<lang>/login`, `/app/<lang>/signup`) are listed under the public surface and resolve under `/app/<lang>/...`
- **AND** member routes (e.g. `/app/<lang>/app`, `/app/<lang>/saved`, `/app/<lang>/bookings`, `/app/<lang>/profile`) are listed under the member surface
- **AND** partner routes (e.g. `/app/<lang>/partner`, `/app/<lang>/partner/events`, `/app/<lang>/partner/guests`, `/app/<lang>/partner/check-in`) are listed under the partner surface
- **AND** admin routes (e.g. `/app/<lang>/admin`, `/app/<lang>/admin/events`, `/app/<lang>/admin/partners`, `/app/<lang>/admin/members`, `/app/<lang>/admin/exports`) are listed under the admin surface
- **AND** the route table additionally lists `/api/*` as a separate dispatch surface owned by the API Worker (reached via the service binding in `wrangler.app.toml`).

#### Scenario: Route table is the source of truth for navigation

- **WHEN** a navigation control targets a product surface
- **THEN** the target URL is read from the routing spec's route table
- **AND** targets under `/app/*` are prefixed with `/app`, targets under `/` are not prefixed
- **AND** no navigation control hardcodes a route string that is not in the table.

### Requirement: Public, Member, Partner, and Admin Surfaces Are Disjoint

The application SHALL treat the four app surfaces as disjoint permission scopes, and the routing spec SHALL declare which viewer kinds are allowed on each route. After this change, the `/api/*` short-circuit and the landing surface (`/*`) bypass the surface check entirely; the API Worker enforces its own authorization via Better Auth and the generated Zod schemas, and the landing surface is unauthenticated by design (no surface check, no language guard). Everything else flows through the surface check unchanged.

#### Scenario: Guest access to a protected route is challenged

- **WHEN** a Guest visits a member, partner, or admin route
- **THEN** the middleware redirects to `/app/<lang>/login?redirect=...` per the redirect-after-login table

#### Scenario: /api/* bypasses the surface check

- **WHEN** a request arrives at any path under `/api/*`
- **THEN** the surface permission check does not run
- **AND** the API Worker enforces authorization via Better Auth and the generated Zod schemas
- **AND** an unauthorized request returns a `401` or `403` from the API Worker, not an Astro redirect.

#### Scenario: Landing surface bypasses the app surface check

- **WHEN** a request arrives at any path under `/` (the landing surface, owned by `@unveiled/landing`)
- **THEN** the app's surface permission check does not run for that request (the landing Worker handles it)
- **AND** the app's middleware language guard does not run for that request (the landing surface is single-language at this stage)
- **AND** the production orchestrator (change 06) dispatches `/` to `unveiled-landing` before any Astro middleware in the app runs.
