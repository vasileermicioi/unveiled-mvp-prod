## Purpose

Define the canonical /[lang]/... route table, the public/member/partner/admin surface map, the middleware guard order, and the rules for adding a new route.
## Requirements
### Requirement: Gherkin Coverage For The /[lang]/... Route Table
The routing spec SHALL be exercised by at least one Gherkin scenario per surface (public, member, partner, admin), and the scenario id SHALL be referenced from this capability spec.

#### Scenario: Gherkin scenario covers a public route
- **WHEN** a contributor reads `tests/features/core-platform/app-shell.feature`
- **THEN** at least one scenario targets a public route from the route table (e.g. `/[lang]/discover`) as a Guest and asserts that the page renders without an auth challenge

#### Scenario: Gherkin scenario covers a member route
- **WHEN** a contributor reads `tests/features/identity/authorization.feature`
- **THEN** at least one scenario targets a member route (e.g. `/[lang]/bookings`) as a Member and asserts that the page renders

#### Scenario: Gherkin scenario covers a partner route
- **WHEN** a contributor reads `tests/features/operations/partner-check-in.feature`
- **THEN** at least one scenario targets a partner route (e.g. `/[lang]/partner`) as a Partner and asserts that the page renders

#### Scenario: Gherkin scenario covers an admin route
- **WHEN** a contributor reads `tests/features/operations/admin-crud.feature`
- **THEN** at least one scenario targets an admin route (e.g. `/[lang]/admin`) as an Admin and asserts that the page renders

#### Scenario: Gherkin scenario covers cross-surface redirect
- **WHEN** a contributor reads `tests/features/identity/authorization.feature`
- **THEN** at least one scenario logs in as a Member and asserts that visiting an admin or partner route redirects to a safe route for the Member surface

### Requirement: Canonical /[lang]/... Route Table Exists

The application SHALL publish a canonical route table that lists every route under `/app/<lang>/...` (per the `app-package` capability), the surface it belongs to, the viewer kinds allowed, and the matching TypeSpec operation id. After this change, every URL prefixed `/api/*` is dispatched to the API Worker via the Cloudflare service binding declared in `wrangler.orchestrator.toml` (`binding = "API"`) before any Astro routing or middleware guard runs. The route table also lists every URL under `/` owned by the `landing-package` capability (the public marketing surface); the production URL space is the union of the landing surface (`/*`, dispatched by the orchestrator's `LANDING` service binding), the app surface (`/app/*`, dispatched by the orchestrator's `APP` service binding), and the API surface (`/api/*`, dispatched by the orchestrator's `API` service binding). The orchestrator Worker (`packages/orchestrator/src/worker.ts`, configured via `wrangler.orchestrator.toml`) is the single entry point for the public hostname and owns the dispatch contract. The orchestrator's path normalization layer (see `routing-orchestrator` capability: `Orchestrator Normalizes App-Shaped Paths To The Canonical Form`) SHALL redirect any "app-shaped" path — bare language prefixes (`/en`, `/de`, `/en/admin`) and bare route segments (`/discover`, `/admin`, `/membership`, …) — to the canonical `/app/<lang>/...` form with `302 Found` so the canonical route table is the single source of truth for navigation regardless of how the URL is reached.

Every app-owned navigation link emitted by the app surface — nav items in `packages/app/src/lib/auth-display.ts`, hero CTAs in `packages/app/src/components/unveiled/visual-system-app.tsx`, the logo home link and language switcher in `packages/app/src/components/unveiled/app-shell.tsx`, the back link in `packages/app/src/components/unveiled/PublicDiscover.tsx`, and the client-side language-switcher / membership / logout navigators in `packages/app/src/components/unveiled/context.tsx` — SHALL use the canonical `/app/<lang>/...` form. The `prefix` value in `auth-display.ts` SHALL be derived from the shared `APP_BASE_PREFIX` constant exported by `packages/app/src/lib/app-base.ts` (the same constant that the `app-package` capability uses for static asset paths), so the app base is a single source of truth across asset paths and navigation links. The client-side language switcher in `context.tsx` SHALL strip the `/app` base from the current path before swapping the language prefix and re-prepend `/app` to the new path, using the `stripAppBase` helper exported by `packages/app/src/lib/app-base.ts`.

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

#### Scenario: Orchestrator normalizes app-shaped paths to the canonical form

- **WHEN** a Guest visits an app-shaped path without the `/app` base (e.g. `/en/admin`, `/de`, `/discover`, `/admin`, `/membership`, `/en/admin/events`)
- **THEN** the orchestrator returns `302 Found` with `Location: /app/<lang>/...` (e.g. `/app/en/admin`, `/app/de`, `/app/en/discover`, `/app/en/admin`, `/app/en/membership`, `/app/en/admin/events`)
- **AND** the resolved `<lang>` is the user's language preference (the `unveiled_lang` cookie, then `Accept-Language`, defaulting to `en`)
- **AND** canonical paths (`/app/<lang>/...`), the landing home (`/`), API paths (`/api/...`), `/healthz`, `/readyz`, and Vite / static asset paths are not redirected.

#### Scenario: App-owned nav items use the canonical /app/<lang>/ form

- **WHEN** a contributor inspects the rendered HTML of any `/app/<lang>/...` route (e.g. `curl http://localhost:4320/app/en/`)
- **THEN** every nav-item `<a href>` emitted by `packages/app/src/lib/auth-display.ts` (e.g. `discover`, `how`, `membership`, `faq`, `member`, `saved`, `bookings`, `profile`, `partner`, `admin`) begins with `/app/<lang>/...`
- **AND** the nav `prefix` is constructed from `APP_BASE_PREFIX` (not from a string literal that hardcodes `/app`).

#### Scenario: Hero CTAs use the canonical /app/<lang>/ form

- **WHEN** a contributor inspects the rendered HTML of the landing-style hero on `/app/<lang>/...`
- **THEN** the `EXPLORE ACCESS` `<a href>` is `/app/<lang>/discover`
- **AND** the `HOW IT WORKS` `<a href>` is `/app/<lang>/how-it-works`
- **AND** both hrefs are constructed from `APP_BASE_PREFIX` (not from a string literal that hardcodes `/app`).

#### Scenario: Logo, back, and language-switcher links use the canonical /app/<lang>/ form

- **WHEN** a contributor inspects the rendered HTML of any `/app/<lang>/...` route
- **THEN** the logo home `<a href>` is `/app/<lang>/`
- **AND** the back link on the discover page is `/app/<lang>/`
- **AND** every language-switcher option rendered by the client-side navigator in `context.tsx` is `/app/<other-lang>/...` (built from the current path with the lang prefix swapped using the `stripAppBase` helper).

#### Scenario: Membership and logout navigators use the canonical /app/<lang>/ form

- **WHEN** an authenticated member clicks the membership or logout control
- **THEN** the client-side navigator in `context.tsx` routes to `/app/<lang>/membership` (membership) or `/app/<lang>/` followed by the API `/api/auth/sign-out` call (logout)
- **AND** the destination is constructed from `APP_BASE_PREFIX` (not from a string literal that hardcodes `/app`).

#### Scenario: stripAppBase handles the documented edge cases

- **WHEN** the `stripAppBase` helper exported by `packages/app/src/lib/app-base.ts` is invoked
- **THEN** `stripAppBase("/app/en/discover")` returns `"/en/discover"`
- **AND** `stripAppBase("/app")` returns `"/"`
- **AND** `stripAppBase("/app/")` returns `"/"`
- **AND** `stripAppBase("/en/discover")` returns `"/en/discover"` unchanged (no base to strip)
- **AND** `stripAppBase("/apple")` returns `"/apple"` unchanged (not a base prefix).

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

### Requirement: Deep-Link Preservation On Login Challenge

The routing spec SHALL guarantee that a Guest who visits a guarded member, partner, or admin route is redirected to `/app/<lang>/login?redirect=<safe-relative-path>` (with `<safe-relative-path>` URL-encoded, including the `/app/<lang>/...` prefix and original query string) so the intended destination survives the sign-in round-trip, and the login form SHALL forward the viewer to that destination after a successful sign-in once the target has been validated against the canonical route table. The middleware branch that emits the deep-link redirect SHALL be activated when a real `/app/<lang>/login` page is mounted; until then the contract is exercised by the `parseSafeRedirectTarget` unit test and the login-form deep-link preview story.

#### Scenario: Guest visits a member route and the destination survives the login challenge

- **WHEN** a Guest visits `/app/<lang>/bookings` while not authenticated and the deep-link preservation middleware branch is active (a public `/app/<lang>/login` page exists)
- **THEN** the middleware issues a 302 to `/app/<lang>/login?redirect=%2Fapp%2F<lang>%2Fbookings` (the destination is preserved and URL-encoded)
- **AND** the destination is rendered on the login form as a hidden input.

#### Scenario: Guest visits a member route with a query string and the query string survives the login challenge

- **WHEN** a Guest visits `/app/<lang>/bookings?status=upcoming` while not authenticated and the deep-link preservation middleware branch is active
- **THEN** the middleware issues a 302 to `/app/<lang>/login?redirect=%2Fapp%2F<lang>%2Fbookings%3Fstatus%3Dupcoming` (the query string is preserved and URL-encoded)
- **AND** after a successful sign-in the viewer lands on `/app/<lang>/bookings?status=upcoming`.

#### Scenario: Deep-link target is validated against the canonical route table

- **WHEN** the login form receives a `?redirect=` value
- **THEN** the value is passed through `parseSafeRedirectTarget` which returns `null` for any value that is not a known `productRoutes` path (and for any cross-language value, and for any value that does not begin with `/app/<lang>/`)
- **AND** when the helper returns `null` the form falls back to the `routing.deepLink.fallbackDestination` for the active viewer kind
- **AND** no open-redirect target (off-site URL, foreign host, protocol-relative URL, double-slash path) is ever issued by the post-login redirect.

#### Scenario: Open-redirect attempts are rejected

- **WHEN** the `?redirect=` value is `https://evil.example/x`, `//evil.example/x`, or any value not present in `productRoutes`
- **THEN** `parseSafeRedirectTarget` returns `null`
- **AND** the post-login redirect lands on the safe fallback destination for the active viewer kind
- **AND** no off-site navigation is ever issued.

#### Scenario: Deep-link copy is localized in DE and EN

- **WHEN** the login form renders the deep-link preview
- **THEN** the preview string is read from `i18n.routing.deepLink.preview` and the cancel-link string is read from `i18n.routing.deepLink.cancel`
- **AND** the typed `RoutingCopy` shape in `packages/app/src/lib/i18n.ts` enforces DE/EN parity at type-check time
- **AND** the i18n parity unit test asserts full coverage of the new keys.

#### Scenario: Deep-link preservation is gherkin-disciplined

- **WHEN** a contributor reads `tests/features/identity/deep-link-preservation.feature`
- **THEN** at least one happy-path scenario asserts the destination survives the round-trip (driving the login form directly with a `?redirect=` parameter, since the middleware branch is activation-gated on a public login page)
- **AND** at least one edge-case scenario asserts the open-redirect rejection behavior
- **AND** every step uses only proximity + layout selectors (`getFieldNearestTo`, `getButtonNearestTo`, `getLinkNearestTo`, `getByRole`, `getByLabel`, `getInside`)
- **AND** every `Given` URL is prefixed with `/app` to match the Astro `base`.

### Requirement: Canonical Redirect-After-Login Table

The routing spec SHALL declare a single typed source of truth, `redirectAfterLoginFor(viewer, owner)`, that returns the safe destination for an authenticated viewer who lands on a route their surface does not own, and every cross-surface redirect in the middleware SHALL be routed through that function. The function SHALL return destinations under the `/app/<lang>/...` prefix (per the `app-package` capability).

#### Scenario: The function is the only place cross-surface destinations are computed

- **WHEN** a contributor reads `packages/app/src/middleware.ts`
- **THEN** the only call site that returns a cross-surface fallback destination is `redirectAfterLoginFor(viewer, owner)`
- **AND** no inline string literal under `packages/app/src/middleware.ts` names a fallback destination for a `member`, `partner`, or `admin` route.

#### Scenario: Member visiting an admin route lands on the member safe destination

- **WHEN** a Member (`role: USER`) visits `/app/<lang>/admin`
- **THEN** the middleware calls `redirectAfterLoginFor(viewer, "admin")`
- **AND** the returned destination is the `member`-owner safe route for the active viewer (per the table)
- **AND** the request is redirected with status 302.

#### Scenario: Partner visiting an admin route lands on the partner safe destination

- **WHEN** a Partner (`role: PARTNER` with a `partnerId`) visits `/app/<lang>/admin`
- **THEN** the middleware calls `redirectAfterLoginFor(viewer, "admin")`
- **AND** the returned destination is the `partner`-owner safe route for the active viewer (per the table)
- **AND** the request is redirected with status 302.

#### Scenario: Admin visiting a partner route lands on the admin safe destination

- **WHEN** an Admin (`role: ADMIN`) visits `/app/<lang>/partner`
- **THEN** the middleware calls `redirectAfterLoginFor(viewer, "partner")`
- **AND** the returned destination is the `admin`-owner safe route for the active viewer (per the table)
- **AND** the request is redirected with status 302.

#### Scenario: The table is the routing spec's source of truth

- **WHEN** a contributor opens a PR that adds a new fallback destination
- **THEN** the change updates `redirectAfterLoginFor` in `packages/app/src/lib/product-routes.ts`
- **AND** the change adds a `#### Scenario:` block to the `Canonical Redirect-After-Login Table` requirement that names the new `viewer.kind × viewer.role × owner` cell
- **AND** the change does not introduce a second source of truth for cross-surface fallbacks.

#### Scenario: The table is gherkin-disciplined

- **WHEN** a contributor reads `tests/features/identity/redirect-after-login-table.feature`
- **THEN** at least one happy-path scenario asserts a Member-visit-admin redirect lands on the member safe destination
- **AND** at least one edge-case scenario asserts a Partner-visit-admin redirect lands on the partner safe destination
- **AND** every step uses only proximity + layout selectors (`getFieldNearestTo`, `getButtonNearestTo`, `getLinkNearestTo`, `getByRole`, `getByLabel`, `getInside`)
- **AND** every `Given` URL is prefixed with `/app` to match the Astro `base`.

#### Scenario: The table is ladle-disciplined

- **WHEN** a contributor reads `tests/features/identity/redirect-after-login-table.ladle.tsx`
- **THEN** at least one story renders the table with a `Member × admin` cell
- **AND** at least one story renders the table with a `Partner × admin` cell
- **AND** every story is tagged with `@ladle(component=RedirectAfterLoginTable, story=…)` referencing the scenario id from `feature.feature`.

