## MODIFIED Requirements

### Requirement: Canonical /[lang]/... Route Table Exists

The application SHALL publish a canonical route table that lists every route under `/app/<lang>/...` (per the `app-package` capability), the surface it belongs to, the viewer kinds allowed, and the matching TypeSpec operation id. After this change, every URL prefixed `/api/*` is dispatched to the API Worker via the Cloudflare service binding declared in `wrangler.orchestrator.toml` (`binding = "API"`) before any Astro routing or middleware guard runs. The route table also lists every URL under `/` owned by the `landing-package` capability (the public marketing surface); the production URL space is the union of the landing surface (`/*`, dispatched by the orchestrator's `LANDING` service binding), the app surface (`/app/*`, dispatched by the orchestrator's `APP` service binding), and the API surface (`/api/*`, dispatched by the orchestrator's `API` service binding). The orchestrator Worker (`packages/orchestrator/src/worker.ts`, configured via `wrangler.orchestrator.toml`) is the single entry point for the public hostname and owns the dispatch contract.

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
- **AND** the route table additionally lists `/api/*` as a separate dispatch surface owned by the API Worker (reached via the orchestrator's service binding in `wrangler.orchestrator.toml`)
- **AND** the route table additionally lists `/healthz` and `/readyz` as orchestrator-owned health surfaces (not dispatched to any downstream Worker).

#### Scenario: Route table is the source of truth for navigation

- **WHEN** a navigation control targets a product surface
- **THEN** the target URL is read from the routing spec's route table
- **AND** targets under `/app/*` are prefixed with `/app`, targets under `/` are not prefixed
- **AND** no navigation control hardcodes a route string that is not in the table.

### Requirement: Public, Member, Partner, and Admin Surfaces Are Disjoint

The application SHALL treat the four app surfaces as disjoint permission scopes, and the routing spec SHALL declare which viewer kinds are allowed on each route. After this change, the `/api/*` short-circuit and the landing surface (`/*`) bypass the surface check entirely; the API Worker enforces its own authorization via Better Auth and the generated Zod schemas, and the landing surface is unauthenticated by design (no surface check, no language guard). Everything else flows through the surface check unchanged. The orchestrator's dispatch contract (`/api/*` → API, `/app/*` → app, `/*` → landing, `/healthz` and `/readyz` → orchestrator) is the single canonical URL mapping; the app's middleware `/api/*` short-circuit is preserved as defense-in-depth for direct app-only deploys but is no longer the canonical entry path in production.

#### Scenario: Guest access to a protected route is challenged

- **WHEN** a Guest visits a member, partner, or admin route
- **THEN** the middleware redirects to `/app/<lang>/login?redirect=...` per the redirect-after-login table

#### Scenario: /api/* bypasses the surface check

- **WHEN** a request arrives at any path under `/api/*`
- **THEN** the surface permission check does not run
- **AND** the API Worker enforces authorization via Better Auth and the generated Zod schemas
- **AND** an unauthorized request returns a `401` or `403` from the API Worker, not an Astro redirect
- **AND** the orchestrator's `API` service binding is the canonical dispatch path in production.

#### Scenario: Landing surface bypasses the app surface check

- **WHEN** a request arrives at any path under `/` (the landing surface, owned by `@unveiled/landing`)
- **THEN** the app's surface permission check does not run for that request (the landing Worker handles it)
- **AND** the app's middleware language guard does not run for that request (the landing surface is single-language at this stage)
- **AND** the production orchestrator dispatches `/` to `unveiled-landing` before any Astro middleware in the app runs.

### Requirement: Middleware Guard Order Is Declared

The routing spec SHALL declare the canonical order of middleware guards so a contributor can reason about request flow without reading the middleware code. After this change, the orchestrator's dispatch (`/api/*` → API, `/app/*` → app, `/*` → landing) runs **before** the guard chain; the app's `/api/*` short-circuit is preserved as defense-in-depth but is not the canonical entry path in production. The middleware lives in `packages/app/src/middleware.ts` (moved from `src/middleware.ts`), and the `env` import is sourced from `cloudflare:workers` so it works in Astro v6 (which throws when `context.locals.runtime.env` is read).

#### Scenario: Guards run in the declared order

- **WHEN** a request hits the Astro app's middleware at `packages/app/src/middleware.ts`
- **THEN** the routing spec's declared order is: `/api/*` short-circuit (defense-in-depth) → language resolution → viewer hydration → route-table match → permission check → redirect-or-render
- **AND** the actual middleware implementation runs them in that order.

#### Scenario: /api/* short-circuit runs first

- **WHEN** a request arrives at any path under `/api/*` on the Astro app Worker directly (not via the orchestrator)
- **THEN** the middleware short-circuit invokes the Cloudflare service binding `API` (declared in `wrangler.app.toml`) and returns the response
- **AND** the short-circuit uses `import { env } from "cloudflare:workers"` so it works in Astro v6 (which throws when `context.locals.runtime.env` is read)
- **AND** the language resolution, viewer hydration, route-table match, and permission check guards do not run.

#### Scenario: Production dispatch is owned by the orchestrator

- **WHEN** a request arrives at the public hostname
- **THEN** the orchestrator Worker (`packages/orchestrator/src/worker.ts`) dispatches the request to the matching service binding (`APP`, `LANDING`, or `API`) before any downstream middleware runs
- **AND** the app's middleware `/api/*` short-circuit is never reached in production (the orchestrator handled the dispatch upstream).

#### Scenario: Language resolution precedes viewer hydration

- **WHEN** a request arrives with an unsupported language prefix
- **THEN** the language guard runs before the viewer hydration guard
- **AND** the request is normalized (e.g. redirected to the default language) before any database lookup for the viewer.

#### Scenario: Viewer hydration precedes permission check

- **WHEN** a request matches a protected route
- **THEN** the viewer is hydrated from Better Auth and Drizzle before the permission check runs
- **AND** the permission check operates on the hydrated `Viewer.kind`.