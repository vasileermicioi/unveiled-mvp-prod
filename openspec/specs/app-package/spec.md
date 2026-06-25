# app-package Specification

## Purpose
Define `@unveiled/app`, the Astro 6 SSR application that powers the Unveiled app surface under the `/app/*` URL prefix.
## Requirements
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

### Requirement: @unveiled/app Astro Config Uses base "/app"

The Astro config in `packages/app/astro.config.mjs` SHALL declare `base: "/app"` so every static asset, page route, and asset reference is rewritten under the `/app` prefix. The config SHALL re-register the Cloudflare adapter with `configPath: "wrangler.app.toml"` (a per-package Wrangler config kept at the repo root) and SHALL preserve the React integration, the `@tailwindcss/vite` plugin, and the existing Vite `optimize-ssr-deps` block.

#### Scenario: Astro config is in the package

- **WHEN** a contributor searches for `astro.config.mjs` in the repo
- **THEN** the only committed file matching that path is `packages/app/astro.config.mjs`
- **AND** no file exists at the repo root

#### Scenario: Base path is /app

- **WHEN** the config is read
- **THEN** it sets `base: "/app"`
- **AND** the build output references every emitted asset under `/app/...`

#### Scenario: Cloudflare adapter is registered with per-package config

- **WHEN** the config is read
- **THEN** it imports the Cloudflare adapter from `@astrojs/cloudflare`
- **AND** passes `{ configPath: "wrangler.app.toml" }` to the adapter
- **AND** the React integration, the `@tailwindcss/vite` plugin, and the Vite `optimize-ssr-deps` block are present and unchanged in behavior

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

### Requirement: Legacy @/ Alias Is Removed

The legacy `@/` TypeScript path alias that resolves to `src/` SHALL be removed from `tsconfig.json` and `tsconfig.base.json` once every import has been migrated. Every import that previously read `@/...` SHALL read `~/...` (resolves to `packages/app/src/...`), `@unveiled/design-system`, `@unveiled/design-system/<subpath>`, `@unveiled/api`, or `@unveiled/api/<subpath>`. The `~/` alias SHALL be declared in `packages/app/tsconfig.json` and `packages/app/package.json`'s `imports` field. No file in the repository — not under `packages/*/src/**`, not under `scripts/`, and not under `tests/` — SHALL contain a `@/` import. The `scripts/codemod-remove-legacy-alias.ts` codemod wired into `bun run check` SHALL scan the entire repository (excluding `node_modules`, `dist`, `.astro`, `_old_app`, `.data`, and the Bun cache) and SHALL fail the check if any `@/` import is found anywhere.

#### Scenario: tsconfig no longer declares the @/ alias

- **WHEN** a contributor reads `tsconfig.base.json`
- **THEN** the `paths` object does not contain a `"@/*"` key
- **AND** it does contain `"~/*": ["packages/app/src/*"]` (or the equivalent package-local entry)
- **AND** the same alias resolution is declared in `packages/app/package.json`'s `imports` field

#### Scenario: No @/ imports remain anywhere in the repo

- **WHEN** `bun run check` runs the umbrella lint + typecheck
- **THEN** the codemod verification step asserts that no file under `packages/app/src/**`, `packages/api/src/**`, `packages/landing/src/**`, `packages/design-system/src/**`, `packages/orchestrator/src/**`, `scripts/**`, or `tests/**` contains a `@/` import
- **AND** the codemod recursively walks the repo (excluding `node_modules`, `dist`, `.astro`, `_old_app`, `.data`, and the Bun cache) instead of only scanning two package directories
- **AND** `bun run check` fails if any such import slips through

#### Scenario: Aliases resolve cross-package

- **WHEN** a file under `packages/app/src/**` imports `@unveiled/design-system` or `@unveiled/api`
- **THEN** the import resolves to the corresponding workspace package's `src/index.ts`
- **AND** TypeScript and Bun's bundler both accept the import

#### Scenario: Seed script at the repo root imports via @unveiled/* aliases

- **WHEN** `bun run scripts/seed-operations-smoke.ts` is invoked from the repo root
- **THEN** every import resolves through the post-monorepo aliases (`@unveiled/app/db/client`, `@unveiled/app/db/schema`, `@unveiled/api/auth-account-actions`, `@unveiled/api/auth-profile`, `@unveiled/app/lib/data-access/loaders`)
- **AND** the script runs to completion against the local PGlite database and inserts the four smoke users (`ops-smoke-admin`, `ops-smoke-partner`, `ops-smoke-member`, `ops-smoke-guest`) plus the test partner and test events
- **AND** `bun run db:seed:operations-smoke` (delegating to the app package) works equivalently

#### Scenario: Viewport-meta script walks the post-monorepo paths

- **WHEN** `bun run lint:viewport` runs `scripts/check-viewport-meta.ts`
- **THEN** the script walks `packages/app/src/pages/` and `packages/app/src/components/` (not the legacy `src/pages/` and `src/components/`)
- **AND** the string-match that flags stale imports reads `"~/layouts/base-layout.astro"` (not the legacy `"@/layouts/base-layout.astro"`)
- **AND** the script reports zero violations across the app package

### Requirement: Drizzle Config And Shared Migrations Live In @unveiled/app

The Drizzle Kit config (`drizzle.config.ts`) and the single shared migration history (`drizzle/`) SHALL live inside `packages/app/`. The Astro app SHALL own the Drizzle client and the schema (which is the canonical source of the domain model). `@unveiled/api` SHALL consume the shared schema and the migrations via workspace import paths declared in its own `package.json` and `tsconfig.json`.

#### Scenario: drizzle.config.ts is inside the app package

- **WHEN** a contributor searches for `drizzle.config.ts`
- **THEN** the only committed file matching that path is `packages/app/drizzle.config.ts`
- **AND** no file exists at the repo root

#### Scenario: Shared migration history lives in packages/app/drizzle/

- **WHEN** a contributor inspects `packages/app/drizzle/`
- **THEN** it contains the canonical `meta/` directory and the `0000_*.sql` ... `NNNN_*.sql` migration files in dependency order
- **AND** no top-level `drizzle/` directory exists at the repo root

#### Scenario: @unveiled/api consumes the shared schema

- **WHEN** `@unveiled/api` imports the Drizzle schema
- **THEN** it imports from `@unveiled/app/db/schema` (or an equivalent workspace path declared in its `tsconfig.json` and `package.json`)
- **AND** the import resolves at type-check and bundle time to the same schema module used by the Astro app

#### Scenario: Database scripts cd into the app package

- **WHEN** `bun run db:generate`, `bun run db:migrate:local`, `bun run db:migrate`, or `bun run db:seed:operations-smoke` runs
- **THEN** the root script `cd`s into `packages/app/` before invoking `drizzle-kit`
- **AND** the resulting migrations and seed runs operate on the local PGlite database at `./.data/pglite` (or the cloud database via `DATABASE_URL`)

#### Scenario: Both packages can apply migrations

- **WHEN** `bun run db:migrate:local` is run
- **THEN** the migrations under `packages/app/drizzle/` apply cleanly to the local PGlite database
- **AND** both `@unveiled/app` and `@unveiled/api` can read and write the resulting schema without drift

### Requirement: Server Actions Live In @unveiled/app And Delegate To @unveiled/api

Typed server actions declared under `packages/app/src/actions/index.ts` SHALL remain the only mutation surface invoked from Astro SSR pages and islands, and SHALL preserve Astro Action's `safe` / `data` / `error` envelope. Each action's handler logic SHALL live in `@unveiled/api` under `packages/api/src/routes/actions/**` (wired in change 03), and the app-side action SHALL delegate to that handler so non-Astro callers (cron jobs, webhooks, third-party SDKs) can hit the same validator over HTTP via the service binding.

#### Scenario: Action handler logic lives in @unveiled/api

- **WHEN** a contributor inspects `packages/app/src/actions/index.ts`
- **THEN** the input parsing delegates to a Zod schema imported from `@unveiled/api`
- **AND** the handler body calls into a function exported by `@unveiled/api` (e.g. `submitBooking`, `saveEvent`)
- **AND** the `safe` / `data` / `error` envelope returned by the delegate is passed through unchanged

#### Scenario: Astro side preserves the action envelope

- **WHEN** a form or page calls an Astro action
- **THEN** the consumer's TypeScript types import the action's input and result from `@unveiled/api` (or from the generated module re-exported by it)
- **AND** the runtime envelope is identical to the pre-extraction envelope

#### Scenario: /api/actions/* is reached via the service binding

- **WHEN** a request arrives at `/api/actions/<name>`
- **THEN** the middleware short-circuit (running first in the guard chain) forwards the request to `env.API.fetch(request)`
- **AND** the matching Hono route in `packages/api/src/routes/actions/**` validates the input against the generated Zod schema
- **AND** returns the action's typed result envelope

### Requirement: Astro Worker Reads The Better Auth Session Cookie

The Astro app's middleware SHALL verify the Better Auth session cookie and hydrate the `Viewer` discriminated union by reading the shared Drizzle schema (which lives in `packages/app/src/db/`). The session cookie itself is issued by the API Worker (which mounts Better Auth in change 03), so the app middleware only reads and validates the cookie and then queries the shared schema for the user, role, and profile data.

#### Scenario: App middleware validates the session cookie

- **WHEN** a request arrives at the Astro app (i.e. anything outside the `/api/*` short-circuit)
- **THEN** the middleware reads the Better Auth session cookie from the request
- **AND** validates the cookie against the Better Auth configuration shared with `@unveiled/api`
- **AND** a valid cookie yields a `Viewer` (Member, Partner, or Admin) hydrated from the shared Drizzle schema
- **AND** a missing or invalid cookie yields a `Guest` viewer

#### Scenario: Hydration uses the shared schema

- **WHEN** the middleware hydrates a Member
- **THEN** it queries the `users`, `profiles`, `partners`, and related tables defined in `packages/app/src/db/schema.ts`
- **AND** the resulting `Viewer` is the same shape that the API Worker returns over HTTP

#### Scenario: /api/* requests do not run session verification in the app

- **WHEN** a request arrives at any path under `/api/*`
- **THEN** the middleware short-circuit forwards the request to `env.API.fetch(request)` and returns the response
- **AND** the app's Better Auth session verification does not run for that request (the API Worker does its own)

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

### Requirement: Root Scripts Delegate To Workspace Packages

The root `package.json` scripts SHALL delegate to the workspace packages via `bun --filter` (or `cd` into a package for scripts that need to read package-local config). The umbrella `bun run check` SHALL run `astro check` and `biome check .` in `@unveiled/app` and `@unveiled/design-system` and SHALL fail if any package's check fails.

#### Scenario: dev script delegates to the app

- **WHEN** a contributor runs `bun run dev` at the repo root
- **THEN** the command is `bun --filter @unveiled/app run dev`
- **AND** the dev server starts on `http://localhost:4321/app/`

#### Scenario: build script delegates to the design system and the app

- **WHEN** a contributor runs `bun run build` at the repo root
- **THEN** the command fans out to `bun --filter @unveiled/design-system run build` followed by `bun --filter @unveiled/app run build`
- **AND** both packages produce their respective bundles

#### Scenario: check script fans out per-package

- **WHEN** a contributor runs `bun run check` at the repo root
- **THEN** the umbrella runs `astro check` and `biome check .` in `@unveiled/app`, `biome check .` and `tsc --noEmit` in `@unveiled/design-system`, and the same in `@unveiled/api`
- **AND** the umbrella exits non-zero if any package's check fails

#### Scenario: Database scripts cd into the app

- **WHEN** a contributor runs `bun run db:generate`, `bun run db:migrate:local`, `bun run db:migrate`, or `bun run db:seed:operations-smoke` at the repo root
- **THEN** the command `cd`s into `packages/app/` before invoking `drizzle-kit`
- **AND** the resulting migrations and seed runs operate on the local PGlite database (or the cloud database via `DATABASE_URL`)

### Requirement: Tests Reference packages/app/ Paths

Tests under `tests/features/**`, `tests/parity/**`, `tests/visual/**`, and `tests/unit/**` SHALL reference the Astro app's paths inside `packages/app/` rather than the top-level `src/`. The Playwright `baseURL` for the gherkin parity suite SHALL be `http://localhost:4321/app/` in this change; the URL prefix change at the orchestrator level is captured by change 06.

#### Scenario: Gherkin feature steps prepend /app

- **WHEN** a contributor reads any `*.feature` file under `tests/features/**`
- **THEN** every `Given`, `When`, or `Then` step that visits a route prepends `/app` to the prior route path
- **AND** no step visits a bare `/discover`, `/bookings`, `/partner`, or `/admin` route directly

#### Scenario: Playwright baseURL is the /app dev server

- **WHEN** `bun run test:e2e` is run
- **THEN** the Playwright config sets `baseURL = "http://localhost:4321/app/"`
- **AND** the dev server is started with the `/app` base (Astro's `--base /app` flag)
- **AND** every gherkin scenario that visits a relative URL resolves under `/app/...`

#### Scenario: Unit tests scan packages/app/

- **WHEN** `bun run test:unit` is run
- **THEN** `tests/unit/no-ladle-replica-in-production.test.ts` scans `packages/app/src/**` (and, after change 05, `packages/landing/src/**`)
- **AND** the scan asserts that no production import lands inside `src/components/ui/heroui-replica/` (in the app) or `packages/landing/src/components/ui/heroui-replica/`

#### Scenario: Visual baselines are re-recorded

- **WHEN** `bun run test:visual` is run against the new prefix
- **THEN** the visual baselines under `tests/visual/**` are re-recorded against `/app/...` URLs
- **AND** the re-recorded baselines are committed alongside the prefix change

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

