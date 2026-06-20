## MODIFIED Requirements

### Requirement: Canonical /[lang]/... Route Table Exists

The application SHALL publish a canonical route table that lists every route under `/app/<lang>/...` (per the `app-package` capability), the surface it belongs to, the viewer kinds allowed, and the matching TypeSpec operation id. After this change, every URL prefixed `/api/*` is dispatched to the API Worker via the Cloudflare service binding declared in `wrangler.app.toml` (`binding = "API"`) before any Astro routing or middleware guard runs; every other URL is served by the Astro app (or, after change 06, by the routing orchestrator).

#### Scenario: Every committed route appears in the table

- **WHEN** a contributor adds a new Astro page under `packages/app/src/pages/[lang]/`
- **THEN** the same route appears in the routing spec's route table
- **AND** the table entry names the surface (public, member, partner, admin), the allowed viewer kinds, and the matching TypeSpec operation id
- **AND** the route table records that the route is mounted at `/app/<lang>/...` (the `/app` prefix is the Astro `base`, not part of the route segment).

#### Scenario: Routes are grouped by surface

- **WHEN** the route table is read
- **THEN** public routes (e.g. `/app/<lang>/`, `/app/<lang>/discover`, `/app/<lang>/how-it-works`, `/app/<lang>/membership`, `/app/<lang>/faq`, `/app/<lang>/login`, `/app/<lang>/signup`) are listed under the public surface
- **AND** member routes (e.g. `/app/<lang>/app`, `/app/<lang>/saved`, `/app/<lang>/bookings`, `/app/<lang>/profile`) are listed under the member surface
- **AND** partner routes (e.g. `/app/<lang>/partner`, `/app/<lang>/partner/events`, `/app/<lang>/partner/guests`, `/app/<lang>/partner/check-in`) are listed under the partner surface
- **AND** admin routes (e.g. `/app/<lang>/admin`, `/app/<lang>/admin/events`, `/app/<lang>/admin/partners`, `/app/<lang>/admin/members`, `/app/<lang>/admin/exports`) are listed under the admin surface
- **AND** the route table additionally lists `/api/*` as a separate dispatch surface owned by the API Worker (reached via the service binding in `wrangler.app.toml`).

#### Scenario: Route table is the source of truth for navigation

- **WHEN** a navigation control targets a product surface
- **THEN** the target URL is read from the routing spec's route table and is prefixed with `/app`
- **AND** no navigation control hardcodes a route string that is not in the table.

### Requirement: Middleware Guard Order Is Declared

The routing spec SHALL declare the canonical order of middleware guards so a contributor can reason about request flow without reading the middleware code. After this change, the `/api/*` short-circuit runs **before** the guard chain; everything else flows through the chain unchanged. The middleware now lives in `packages/app/src/middleware.ts` (moved from `src/middleware.ts`), and the `env` import is sourced from `cloudflare:workers` so it works in Astro v6 (which throws when `context.locals.runtime.env` is read).

#### Scenario: Guards run in the declared order

- **WHEN** a request hits the Astro app's middleware at `packages/app/src/middleware.ts`
- **THEN** the routing spec's declared order is: `/api/*` short-circuit → language resolution → viewer hydration → route-table match → permission check → redirect-or-render
- **AND** the actual middleware implementation runs them in that order.

#### Scenario: /api/* short-circuit runs first

- **WHEN** a request arrives at any path under `/api/*`
- **THEN** the middleware short-circuit invokes the Cloudflare service binding `API` (declared in `wrangler.app.toml`) and returns the response
- **AND** the short-circuit uses `import { env } from "cloudflare:workers"` so it works in Astro v6 (which throws when `context.locals.runtime.env` is read)
- **AND** the language resolution, viewer hydration, route-table match, and permission check guards do not run.

#### Scenario: Language resolution precedes viewer hydration

- **WHEN** a request arrives with an unsupported language prefix
- **THEN** the language guard runs before the viewer hydration guard
- **AND** the request is normalized (e.g. redirected to the default language) before any database lookup for the viewer.

#### Scenario: Viewer hydration precedes permission check

- **WHEN** a request matches a protected route
- **THEN** the viewer is hydrated from Better Auth and Drizzle before the permission check runs
- **AND** the permission check operates on the hydrated `Viewer.kind`.

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
