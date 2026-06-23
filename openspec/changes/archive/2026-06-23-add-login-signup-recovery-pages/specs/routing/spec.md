## MODIFIED Requirements

### Requirement: Canonical /[lang]/... Route Table Exists

The application SHALL publish a canonical route table that lists every route under `/app/<lang>/...` (per the `app-package` capability), the surface it belongs to, the viewer kinds allowed, and the matching TypeSpec operation id. After this change, every URL prefixed `/api/*` is dispatched to the API Worker via the Cloudflare service binding declared in `wrangler.orchestrator.toml` (`binding = "API"`) before any Astro routing or middleware guard runs. The route table also lists every URL under `/` owned by the `landing-package` capability (the public marketing surface); the production URL space is the union of the landing surface (`/*`, dispatched by the orchestrator's `LANDING` service binding), the app surface (`/app/*`, dispatched by the orchestrator's `APP` service binding), and the API surface (`/api/*`, dispatched by the orchestrator's `API` service binding). The orchestrator Worker (`packages/orchestrator/src/worker.ts`, configured via `wrangler.orchestrator.toml`) is the single entry point for the public hostname and owns the dispatch contract. The orchestrator's path normalization layer (see `routing-orchestrator` capability: `Orchestrator Normalizes App-Shaped Paths To The Canonical Form`) SHALL redirect any "app-shaped" path — bare language prefixes (`/en`, `/de`, `/en/admin`) and bare route segments (`/discover`, `/admin`, `/membership`, …) — to the canonical `/app/<lang>/...` form with `302 Found` so the canonical route table is the single source of truth for navigation regardless of how the URL is reached.

Every app-owned navigation link emitted by the app surface — nav items in `packages/app/src/lib/auth-display.ts`, hero CTAs in `packages/app/src/components/unveiled/visual-system-app.tsx`, the logo home link and language switcher in `packages/app/src/components/unveiled/app-shell.tsx`, the back link in `packages/app/src/components/unveiled/PublicDiscover.tsx`, and the client-side language-switcher / membership / logout navigators in `packages/app/src/components/unveiled/context.tsx` — SHALL use the canonical `/app/<lang>/...` form. The `prefix` value in `auth-display.ts` SHALL be derived from the shared `APP_BASE_PREFIX` constant exported by `packages/app/src/lib/app-base.ts` (the same constant that the `app-package` capability uses for static asset paths), so the app base is a single source of truth across asset paths and navigation links. The client-side language switcher in `context.tsx` SHALL strip the `/app` base from the current path before swapping the language prefix and re-prepend `/app` to the new path, using the `stripAppBase` helper exported by `packages/app/src/lib/app-base.ts`.

The route table SHALL list `/app/<lang>/login`, `/app/<lang>/signup`, and `/app/<lang>/recovery` as public-owner routes that resolve under `/app/<lang>/...`. Each of the three pages SHALL have a dedicated Astro page under `packages/app/src/pages/[lang]/` (one of `login.astro`, `signup.astro`, `recovery.astro`) so the public auth routes declared by the table are reachable by direct URL and by deep-link redirect from a guarded route.

#### Scenario: Every committed route appears in the table

- **WHEN** a contributor adds a new Astro page under `packages/app/src/pages/[lang]/`
- **THEN** the same route appears in the routing spec's route table
- **AND** the table entry names the surface (public, member, partner, admin), the allowed viewer kinds, and the matching TypeSpec operation id
- **AND** the route table records that the route is mounted at `/app/<lang>/...` (the `/app` prefix is the Astro `base`, not part of the route segment)
- **AND** when a contributor adds a new Astro page under `packages/landing/src/pages/`
- **THEN** the same route appears in the landing section of the route table
- **AND** the entry names the marketing surface and is mounted at `/` (no prefix).
- **AND** the dedicated `/app/<lang>/login`, `/app/<lang>/signup`, and `/app/<lang>/recovery` Astro pages exist and render the login form with the matching `initialMode` (login, signup, or recovery).

#### Scenario: Routes are grouped by surface

- **WHEN** the route table is read
- **THEN** landing routes (e.g. `/`, `/pricing`) are listed under the landing surface and resolve under `/`
- **AND** public routes (e.g. `/app/<lang>/discover`, `/app/<lang>/how-it-works`, `/app/<lang>/membership`, `/app/<lang>/faq`, `/app/<lang>/login`, `/app/<lang>/signup`, `/app/<lang>/recovery`) are listed under the public surface and resolve under `/app/<lang>/...`
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

### Requirement: Deep-Link Preservation On Login Challenge

The routing spec SHALL guarantee that a Guest who visits a guarded member, partner, or admin route is redirected to `/app/<lang>/login?redirect=<safe-relative-path>` (with `<safe-relative-path>` URL-encoded, including the `/app/<lang>/...` prefix and original query string) so the intended destination survives the sign-in round-trip, and the login form SHALL forward the viewer to that destination after a successful sign-in once the target has been validated against the canonical route table. The dedicated `/app/<lang>/login`, `/app/<lang>/signup`, and `/app/<lang>/recovery` pages exist as public-owner routes (see the `Canonical /[lang]/... Route Table Exists` requirement), so the deep-link preservation middleware branch is the canonical entry path: a Guest visiting any guarded member / partner / admin route is redirected to `/app/<lang>/login?redirect=<safe-relative-path>` with status `302`. The `<safe-relative-path>` SHALL be the post-lang form (e.g. `/admin`, `/partner`, `/bookings`) URL-encoded together with the original query string, and the login page parses it through `parseSafeRedirectTarget` before forwarding the viewer to the validated destination.

#### Scenario: Guest visits a member route and the destination survives the login challenge

- **WHEN** a Guest visits `/app/<lang>/bookings` while not authenticated
- **THEN** the middleware issues a 302 to `/app/<lang>/login?redirect=%2Fbookings` (the destination is preserved and URL-encoded)
- **AND** the destination is rendered on the login form as a hidden input.

#### Scenario: Guest visits a member route with a query string and the query string survives the login challenge

- **WHEN** a Guest visits `/app/<lang>/bookings?status=upcoming` while not authenticated
- **THEN** the middleware issues a 302 to `/app/<lang>/login?redirect=%2Fbookings%3Fstatus%3Dupcoming` (the query string is preserved and URL-encoded)
- **AND** after a successful sign-in the viewer lands on `/app/<lang>/bookings?status=upcoming`.

#### Scenario: Guest visits an admin or partner route and the destination survives the login challenge

- **WHEN** a Guest visits `/app/<lang>/admin`, `/app/<lang>/partner`, or any other guarded non-public route
- **THEN** the middleware issues a 302 to `/app/<lang>/login?redirect=<encoded-post-lang-path>` (the destination is preserved and URL-encoded)
- **AND** the redirect uses the post-lang path form (e.g. `/admin`, `/partner`, `/bookings`) — NOT the `/app/<lang>/...` prefix — so the URL stays compact and the `parseSafeRedirectTarget` validator can resolve it against the canonical route table.

#### Scenario: Deep-link target is validated against the canonical route table

- **WHEN** the login form receives a `?redirect=` value
- **THEN** the value is passed through `parseSafeRedirectTarget` which returns `null` for any value that is not a known `productRoutes` path (and for any cross-language value, and for any value that does not begin with `/` or `/<de|en>`)
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
- **THEN** at least one happy-path scenario asserts the destination survives the round-trip (driving the login form directly with a `?redirect=` parameter, and asserting the middleware issues the expected `302`)
- **AND** at least one edge-case scenario asserts the open-redirect rejection behavior
- **AND** every step uses only proximity + layout selectors (`getFieldNearestTo`, `getButtonNearestTo`, `getLinkNearestTo`, `getByRole`, `getByLabel`, `getInside`)
- **AND** every `Given` URL is prefixed with `/app` to match the Astro `base`.

#### Scenario: Dedicated auth pages render with the matching initialMode

- **WHEN** a contributor visits `/app/<lang>/login`, `/app/<lang>/signup`, or `/app/<lang>/recovery`
- **THEN** the response status is `200`
- **AND** the `VisualSystemApp` is rendered with the matching `initialMode` prop (`login`, `signup`, or `recovery`) so the auth form opens on the correct tab without an extra click
- **AND** the rendered page mounts `BaseLayout` with a localized title (`Login | Unveiled`, `Sign up | Unveiled`, or `Password recovery | Unveiled`).