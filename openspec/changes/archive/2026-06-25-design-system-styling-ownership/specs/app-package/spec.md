## ADDED Requirements

### Requirement: `@unveiled/app` imports global CSS once

The app package MUST ship exactly one stylesheet file at `packages/app/src/styles/global.css`. That file MUST contain only `@import "@unveiled/design-system/styles/global.css";` and MUST NOT declare `@theme`, `@layer`, `@font-face`, bespoke class rules, or Tailwind directives. All CSS rules, semantic layout classes, font faces, and theme overrides live in the design-system global CSS.

#### Scenario: App global CSS is a single import

- **WHEN** `packages/app/src/styles/global.css` is read
- **THEN** it contains exactly one line: `@import "@unveiled/design-system/styles/global.css";`
- **AND** `packages/app/src/styles/` contains no other CSS files.

#### Scenario: App source uses semantic classes only

- **WHEN** `bun run check:styling-ownership` runs against `packages/app/src/**`
- **THEN** no `.tsx`, `.astro`, or `.html` file contains forbidden raw Tailwind utilities in `className` strings
- **AND** layout and chrome use semantic classes exported from `@unveiled/design-system/styles/global.css`.

## MODIFIED Requirements

### Requirement: Astro Pages Render Under /app/...

Every Astro page that previously rendered at `/<path>` SHALL render at `/app/<path>` in production. In production, the orchestrator dispatches `/app/*` to the app Worker via the `APP` service binding declared in `wrangler.orchestrator.toml`; the local dev server SHALL serve the same pages at `http://localhost:4321/app/...`, and the orchestrator's Vite dev proxy SHALL forward them through `http://localhost:4320/app/...`. The mapping SHALL be uniform: there is no per-page prefix configuration; the `base: "/app"` setting handles every route.

The app's static assets — the logo SVGs (`unveiled-logo-black.svg`, `unveiled-logo-white.svg`) and the EKNoticeSans-Black font files (`EKNoticeSans-Black.woff2`, `EKNoticeSans-Black.woff`, `EKNoticeSans-Black.otf`) — SHALL be checked into `packages/app/public/logos/` and `packages/app/public/fonts/` respectively. The Astro dev server (and the production build, which respects `base: "/app"`) SHALL serve those files from `/app/logos/...` and `/app/fonts/...`. The logo `<img src>` in the app shell SHALL be `/app/logos/unveiled-logo-${variant}.svg`, and the `@font-face` `src` URLs SHALL be declared in `packages/design-system/src/styles/global.css` as `/app/fonts/EKNoticeSans-Black.{woff2,woff,otf}`. The asset path is centralized in a shared `APP_BASE_PREFIX` constant exported from `packages/app/src/lib/app-base.ts` so a future base-prefix change is a single-line update.

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

- **WHEN** a contributor visits `/app/healthz` or `/app/readyz` in dev or production
- **THEN** the Astro app responds with the same status codes and bodies as before the `/app` prefix migration.

#### Scenario: Font faces resolve from design-system global CSS

- **WHEN** `packages/design-system/src/styles/global.css` is read
- **THEN** `@font-face` rules reference `/app/fonts/EKNoticeSans-Black.{woff2,woff,otf}`
- **AND** `packages/app/src/styles/global.css` does not declare `@font-face` rules.
