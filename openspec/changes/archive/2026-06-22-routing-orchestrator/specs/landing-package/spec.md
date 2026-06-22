## MODIFIED Requirements

### Requirement: `@unveiled/landing` Astro config uses `base: "/"`

The Astro config in `packages/landing/astro.config.mjs` MUST declare `base: "/"` so that, in production, every static asset and page route resolves at the URL root (no `/landing` or `/public` prefix). The config MUST register the Cloudflare adapter with `configPath: "wrangler.landing.toml"`, the React integration, and the `@tailwindcss/vite` plugin. The Vite `optimize-ssr-deps` block MUST match the `@unveiled/app` package so the same HeroUI-backed primitives resolve cleanly during SSR. In production, the orchestrator Worker (`wrangler.orchestrator.toml`, `[[services]] binding = "LANDING"`) dispatches every URL under `/` to this package's Worker via a Cloudflare service binding; the landing package no longer owns the top-level static asset binding — that lives on the orchestrator's `wrangler.orchestrator.toml`.

#### Scenario: Astro config is in the package

- **WHEN** a contributor searches for `astro.config.mjs` under `packages/landing/`
- **THEN** exactly one file matches and it is `packages/landing/astro.config.mjs`.

#### Scenario: Base path is the site root

- **WHEN** the config is read
- **THEN** it sets `base: "/"`
- **AND** the build output references every emitted asset under `/...` (no `/landing/...` prefix).

#### Scenario: Cloudflare adapter is registered with the per-package config

- **WHEN** the config is read
- **THEN** it imports the Cloudflare adapter from `@astrojs/cloudflare`
- **AND** passes `{ configPath: "wrangler.landing.toml" }` to the adapter
- **AND** the React integration and the `@tailwindcss/vite` plugin are present and unchanged in behavior.

### Requirement: `@unveiled/landing` Worker bundle is produced and deployable

The package MUST produce a deployable Astro Cloudflare Worker bundle at `packages/landing/dist/server/entry.mjs`. The `wrangler.landing.toml` MUST declare `name = "unveiled-landing"` and MUST reuse the same `SESSION` KV namespace and `ASSETS_BUCKET` R2 binding declared in `wrangler.app.toml` (no separate stores). After this change, `wrangler.landing.toml` does NOT declare an `assets.directory` (the orchestrator owns the top-level static asset binding for `/`).

#### Scenario: Worker bundle is produced by the build script

- **WHEN** `bun --filter @unveiled/landing run build` runs
- **THEN** `packages/landing/dist/server/entry.mjs` is produced and is a valid ESM Workers entrypoint.

#### Scenario: Wrangler config reuses app bindings

- **WHEN** `wrangler.landing.toml` is read
- **THEN** it declares `name = "unveiled-landing"`
- **AND** the `kv_namespaces` array references the same `SESSION` binding id declared in `wrangler.app.toml`
- **AND** the `r2_buckets` array references the same `ASSETS_BUCKET` binding declared in `wrangler.app.toml`
- **AND** it does NOT declare an `assets.directory` (the orchestrator owns the top-level static asset binding).

#### Scenario: Orchestrator dispatches / to the landing Worker

- **WHEN** a request arrives at `/` (or any path not under `/api/` or `/app/`) on the public hostname
- **THEN** the orchestrator Worker dispatches the request to `env.LANDING.fetch(request)` via the `[[services]] binding = "LANDING" service = "unveiled-landing" entrypoint = "fetch"` declaration in `wrangler.orchestrator.toml`
- **AND** the landing Worker renders the index page (or 404 for unknown paths under `/`).

### Requirement: `@unveiled/landing` exposes a single index page with brand chrome

The package MUST ship a single index page at `packages/landing/src/pages/index.astro` that renders the brand header, a hero with a call to action that links to `/app`, and a footer. Every component MUST be imported from `@unveiled/design-system` or from `packages/landing/src/components/landing/`. The page MUST NOT contain app business logic (no server actions, no Better Auth reads, no Drizzle queries, no `/app/*` route handling).

#### Scenario: Index page renders the hero with a CTA to /app

- **WHEN** a visitor opens `/` in dev (port 4322 behind the orchestrator's port 4320 proxy) or production (behind the orchestrator's `LANDING` service binding)
- **THEN** the page renders the landing header, the landing hero, and the landing footer
- **AND** the hero exposes a call-to-action element whose `href` resolves to `/app`.

#### Scenario: Index page does not mount app chrome

- **WHEN** the page is rendered
- **THEN** no app navigation (saved, bookings, profile, credits) is rendered
- **AND** no language toggle owned by the app shell is rendered (the landing surface is single-language at this stage).

#### Scenario: Authenticated visitor sees a "Go to app" link

- **WHEN** an authenticated visitor opens `/`
- **THEN** the page renders a "Go to app" link that targets `/app`
- **AND** the landing hero CTA remains visible.