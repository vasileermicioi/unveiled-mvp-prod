## MODIFIED Requirements

### Requirement: @unveiled/app Package Owns The Astro 6 SSR Application

A Bun workspace package named `@unveiled/app` SHALL exist at `packages/app/` and SHALL own the Astro 6 SSR application that powers the Unveiled app surface. The package SHALL be built on Astro 6 + the Cloudflare Workers adapter (`@astrojs/cloudflare`) and SHALL export a default Cloudflare Workers fetch handler from `packages/app/src/worker.ts`. The app SHALL be mounted under the `/app/*` URL prefix in production; in production the orchestrator Worker (`wrangler.orchestrator.toml`, `[[services]] binding = "APP"`) dispatches `/app/*` to this package's Worker via a Cloudflare service binding. In local dev, the orchestrator's Vite proxy (port 4320) forwards `/app/*` to `http://localhost:4321`.

#### Scenario: Workspace member exists

- **WHEN** a contributor inspects the root `package.json`
- **THEN** `packages/app` is listed in `workspaces`
- **AND** `packages/app/package.json` declares `"name": "@unveiled/app"` and `"private": true`

#### Scenario: Package declares required scripts

- **WHEN** a contributor inspects `packages/app/package.json`
- **THEN** it exposes the scripts `dev`, `build`, `typecheck`, `lint`, `test:unit`, `preview`, and `preview:cloudflare`
- **AND** each script delegates to `astro` (or `wrangler`) with the package's own `astro.config.mjs`

#### Scenario: Worker bundle is produced

- **WHEN** `bun --filter @unveiled/app run build` is run
- **THEN** `packages/app/dist/worker.js` is produced and is a valid ESM Workers entrypoint
- **AND** `wrangler.app.toml` declares `main = "packages/app/dist/worker.js"`.

#### Scenario: App package owns the app surface and its dependencies

- **WHEN** a contributor inspects `packages/app/package.json`
- **THEN** the `dependencies` list contains Astro, `@astrojs/cloudflare`, `@astrojs/react`, React, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `@radix-ui/react-slot`, `drizzle-orm`, `better-auth`, and `@unveiled/design-system`, `@unveiled/api` as workspace dependencies
- **AND** the same dependencies are removed from the root `package.json`.

### Requirement: Astro Pages Render Under /app/...

Every Astro page that previously rendered at `/<path>` SHALL render at `/app/<path>` in production. In production, the orchestrator dispatches `/app/*` to the app Worker via the `APP` service binding declared in `wrangler.orchestrator.toml`; the local dev server SHALL serve the same pages at `http://localhost:4321/app/...`, and the orchestrator's Vite dev proxy SHALL forward them through `http://localhost:4320/app/...`. The mapping SHALL be uniform: there is no per-page prefix configuration; the `base: "/app"` setting handles every route.

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

### Requirement: Per-Package Wrangler Config Is Renamed To wrangler.app.toml

The Cloudflare Workers/Pages config that previously lived at the repo root as `wrangler.toml` SHALL be renamed to `wrangler.app.toml` (kept at the repo root for Wrangler CLI ergonomics). The renamed config SHALL declare `main = "packages/app/dist/worker.js"`, the Astro Cloudflare adapter compatibility date, the service binding to the API Worker (`binding = "API"`, `service = "unveiled-api"`, `entrypoint = "fetch"`), and any environment-specific bindings (D1/KV/R2/Queues/Analytics Engine) that the app needs. After this change, `wrangler.app.toml` does NOT declare a top-level `assets = ...` block — the orchestrator (`wrangler.orchestrator.toml`) owns the top-level static asset binding for the public hostname.

#### Scenario: wrangler.app.toml is the per-package config

- **WHEN** a contributor searches for `wrangler.*.toml`
- **THEN** the matching files include `wrangler.app.toml`, `wrangler.api.toml`, `wrangler.landing.toml`, and `wrangler.orchestrator.toml`
- **AND** no `wrangler.toml` file exists at the repo root (the old name has been renamed).

#### Scenario: Service binding is preserved

- **WHEN** `wrangler.app.toml` is read
- **THEN** the `services` array contains an entry with `binding = "API"`, `service = "unveiled-api"`, and `entrypoint = "fetch"`
- **AND** the same service binding is preserved from change 03 (i.e. the API Worker binding is not lost during the rename).

#### Scenario: wrangler.app.toml drops the top-level assets binding

- **WHEN** `wrangler.app.toml` is read
- **THEN** it does NOT contain an `assets = ...` block at the top level
- **AND** the orchestrator (`wrangler.orchestrator.toml`) owns the top-level static asset binding.

#### Scenario: Astro Cloudflare adapter resolves the new config

- **WHEN** `bun --filter @unveiled/app run preview:cloudflare` is run
- **THEN** Wrangler reads `wrangler.app.toml` and uses `main = "packages/app/dist/worker.js"`
- **AND** the preview server starts without errors
- **AND** SSR pages render at `http://localhost:8787/app/...` (or the Wrangler default port).