## MODIFIED Requirements

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