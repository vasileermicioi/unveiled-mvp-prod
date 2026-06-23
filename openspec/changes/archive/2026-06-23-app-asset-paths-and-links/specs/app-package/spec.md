## MODIFIED Requirements

### Requirement: Astro Pages Render Under /app/...

Every Astro page that previously rendered at `/<path>` SHALL render at `/app/<path>` in production. In production, the orchestrator dispatches `/app/*` to the app Worker via the `APP` service binding declared in `wrangler.orchestrator.toml`; the local dev server SHALL serve the same pages at `http://localhost:4321/app/...`, and the orchestrator's Vite dev proxy SHALL forward them through `http://localhost:4320/app/...`. The mapping SHALL be uniform: there is no per-page prefix configuration; the `base: "/app"` setting handles every route.

The app's static assets — the logo SVGs (`unveiled-logo-black.svg`, `unveiled-logo-white.svg`) and the EKNoticeSans-Black font files (`EKNoticeSans-Black.woff2`, `EKNoticeSans-Black.woff`, `EKNoticeSans-Black.otf`) — SHALL be checked into `packages/app/public/logos/` and `packages/app/public/fonts/` respectively. The Astro dev server (and the production build, which respects `base: "/app"`) SHALL serve those files from `/app/logos/...` and `/app/fonts/...`. The logo `<img src>` in the app shell SHALL be `/app/logos/unveiled-logo-${variant}.svg`, and the `@font-face` `src` URLs in `packages/app/src/styles/global.css` SHALL be `/app/fonts/EKNoticeSans-Black.{woff2,woff,otf}`. The asset path is centralized in a shared `APP_BASE_PREFIX` constant exported from `packages/app/src/lib/app-base.ts` so a future base-prefix change is a single-line update.

#### Scenario: Public route renders under /app

- **WHEN** a contributor visits `/app/<lang>/discover` in dev or production
- **THEN** the Astro app renders the discovery page
- **AND** the response is byte-equivalent to the prior `/<lang>/discover` response modulo the `/app` URL prefix in emitted `<link>` and `<script>` href attributes.

#### Scenario: Member route renders under /app

- **WHEN** an authenticated member visits `/app/<lang>/bookings`
- **THEN** the Astro app renders the bookings page
- **AND** the Better Auth session cookie is read and validated by the app's middleware
- **AND** the response is byte-equivalent to the prior `/<lang>/bookings` response modulo the `/app` URL prefix.

#### Scenario: Operational routes render under /app

- **WHEN** a partner visits `/app/<lang>/partner` or an admin visits `/app/<lang>/admin`
- **THEN** the Astro app renders the matching operational page
- **AND** the response is byte-equivalent to the prior `/<lang>/partner` or `/<lang>/admin` response modulo the `/app` URL prefix.

#### Scenario: Every emitted link begins with /app/

- **WHEN** a gherkin scenario or a unit test inspects the rendered HTML of any route
- **THEN** every emitted `<link>` and `<script>` `href` begins with `/app/`
- **AND** no emitted URL begins with a bare `/` that bypasses the prefix.

#### Scenario: Static assets are served from /app/logos and /app/fonts

- **WHEN** a contributor inspects `packages/app/public/`
- **THEN** the directory contains a `logos/` subdirectory holding `unveiled-logo-black.svg` and `unveiled-logo-white.svg`
- **AND** a `fonts/` subdirectory holding `EKNoticeSans-Black.woff2`, `EKNoticeSans-Black.woff`, and `EKNoticeSans-Black.otf`
- **AND** the Astro dev server serves those files at `http://localhost:4321/app/logos/...` and `http://localhost:4321/app/fonts/...`
- **AND** the production build emits the same files at `/app/logos/...` and `/app/fonts/...` in the served HTML.

#### Scenario: Logo img src uses the /app prefix

- **WHEN** a contributor inspects the rendered HTML of any `/app/<lang>/...` route
- **THEN** the logo `<img>` element has `src="/app/logos/unveiled-logo-black.svg"` (or the matching white variant)
- **AND** the value is constructed from the `APP_BASE_PREFIX` constant (not a string literal that hardcodes `/app`).

#### Scenario: @font-face URLs use the /app prefix

- **WHEN** a contributor inspects the served CSS on any `/app/<lang>/...` route
- **THEN** every `@font-face` `src` URL under the `EKNoticeSans` family resolves to `/app/fonts/EKNoticeSans-Black.{woff2,woff,otf}`
- **AND** the values are constructed from the `APP_BASE_PREFIX` constant (not a string literal that hardcodes `/app`).