# landing-package Specification

## Purpose
TBD - created by archiving change add-landing-package. Update Purpose after archive.
## Requirements
### Requirement: `@unveiled/landing` is a Bun workspace package

The system MUST ship `@unveiled/landing` as a Bun workspace member under `packages/landing/`. The package MUST be `private: true`, declare `"name": "@unveiled/landing"`, and ship the scripts `dev`, `build`, `typecheck`, `lint`, `test:unit`, `preview`, and `preview:cloudflare`.

#### Scenario: Package is discoverable as a workspace member

- **WHEN** `bun pm ls` (or the Bun workspace equivalent) is run from the repo root
- **THEN** `@unveiled/landing` appears in the workspace list with `private: true`
- **AND** `packages/landing/package.json` declares the required scripts.

#### Scenario: Package scripts exist and resolve

- **WHEN** a contributor runs `bun --filter @unveiled/landing run <script>` for each of `dev`, `build`, `typecheck`, `lint`, `test:unit`, `preview`, `preview:cloudflare`
- **THEN** the package's `package.json` defines a script under that name and the filter invocation exits with code zero.

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

### Requirement: `@unveiled/landing` reuses design-system primitives

Every UI primitive used by the landing surface MUST be imported from `@unveiled/design-system` (the production export, never the Ladle-only `heroui-replica`). The landing package MUST NOT add HeroUI, NextUI, or any other component library as a direct dependency; it MUST consume them transitively through `@unveiled/design-system`. The landing Astro layout MUST mount a single `<LandingTemplate client:load>` from `@unveiled/design-system` (which composes the header, optional hero, page body, and footer) and MUST project the page body via `<slot />`. The landing page MUST render the hero by mounting `<LandingHeroPresentational client:load>` and MUST NOT instantiate the header, footer, or Astro layout directly.

#### Scenario: No direct HeroUI dependency

- **WHEN** `packages/landing/package.json` is read
- **THEN** the `dependencies` list does NOT contain `@nextui-org/react`, `@heroui/react`, `@mantine/core`, or any equivalent component-library package.

#### Scenario: Production primitives are imported through the design system

- **WHEN** a file under `packages/landing/src/**` imports a UI primitive
- **THEN** the import resolves through `@unveiled/design-system` (or `@unveiled/design-system/<subpath>`)
- **AND** the import does NOT land inside `@unveiled/design-system/heroui-replica`.

#### Scenario: Landing Astro layout mounts a single LandingTemplate

- **WHEN** `packages/landing/src/layouts/landing-layout.astro` is read
- **THEN** the `<body>` contains exactly one design-system mount: `<LandingTemplate client:load>` wrapping `<slot />`
- **AND** the layout imports `LandingTemplate` from `@unveiled/design-system` (the public barrel).

#### Scenario: Landing page renders only the hero

- **WHEN** `packages/landing/src/pages/index.astro` is read
- **THEN** it imports `LandingHeroPresentational` from `@unveiled/design-system` (the public barrel)
- **AND** it renders `<LandingHeroPresentational client:load>` as the only top-level element inside the layout slot
- **AND** it does NOT import `LandingHeader`, `LandingFooter`, or `LandingTemplate` directly (the layout owns those mounts).

### Requirement: `@unveiled/landing` imports global CSS once

The landing package MUST ship exactly one stylesheet file at `packages/landing/src/styles/global.css`. That file MUST contain only `@import "@unveiled/design-system/styles/global.css";` and MUST NOT declare `@theme`, `@layer`, bespoke class rules, or Tailwind directives. The single global `@media (prefers-reduced-motion: reduce)` block that governs landing motion MUST live in `packages/design-system/src/styles/global.css`, not in the landing package.

#### Scenario: Landing global CSS is a single import

- **WHEN** `packages/landing/src/styles/global.css` is read
- **THEN** it contains exactly one line: `@import "@unveiled/design-system/styles/global.css";`
- **AND** `packages/landing/src/styles/` contains no other CSS files.

#### Scenario: Landing source uses semantic classes only

- **WHEN** `bun run check:styling-ownership` runs against `packages/landing/src/**`
- **THEN** no `.tsx`, `.astro`, or `.html` file contains forbidden raw Tailwind utilities in `className` strings
- **AND** layout and chrome use semantic classes exported from `@unveiled/design-system/styles/global.css`.

### Requirement: `@unveiled/landing` has its own global stylesheet

The package MUST ship `packages/landing/src/styles/global.css` which imports `@unveiled/design-system/styles/global.css`. The design-system global CSS MUST include the single global `@media (prefers-reduced-motion: reduce)` block that governs the landing surface. The landing package MUST NOT duplicate that block locally.

#### Scenario: Stylesheet imports design-system global CSS

- **WHEN** `packages/landing/src/styles/global.css` is read
- **THEN** it contains only `@import "@unveiled/design-system/styles/global.css";`
- **AND** the imported file applies Tailwind v4 layers and semantic classes for the landing surface.

#### Scenario: Motion guard is a single global block in the design system

- **WHEN** the design-system global CSS is audited
- **THEN** every landing motion surface is covered by a single `@media (prefers-reduced-motion: reduce)` block in `packages/design-system/src/styles/global.css`
- **AND** no per-island `useReducedMotion()` hook is introduced
- **AND** `packages/landing/src/styles/global.css` does not declare its own motion-guard block.

### Requirement: `@unveiled/landing` is covered by gherkin and Ladle

The package MUST ship a gherkin feature folder at `tests/features/landing/home/` containing `feature.feature` and `landing-hero.ladle.tsx`. The gherkin scenarios MUST include the `prefers-reduced-motion` rule lifted from the `app-shell` capability and the "Go to app" link for authenticated visitors.

#### Scenario: Gherkin feature covers the public landing hero

- **WHEN** a contributor reads `tests/features/landing/home/feature.feature`
- **THEN** at least one scenario asserts that a visitor opening `/` sees the landing hero with a CTA that links to `/app`.

#### Scenario: Gherkin feature covers reduced motion on the landing

- **WHEN** a contributor reads `tests/features/landing/home/feature.feature`
- **THEN** at least one scenario asserts that a visitor with `prefers-reduced-motion: reduce` sees the hero with motion suppressed.

#### Scenario: Gherkin feature covers the authenticated "Go to app" link

- **WHEN** a contributor reads `tests/features/landing/home/feature.feature`
- **THEN** at least one scenario asserts that an authenticated visitor sees a "Go to app" link that targets `/app`.

#### Scenario: Ladle harness is coverage-locked

- **WHEN** `bun run ladle:coverage` is run
- **THEN** it references the `landing-hero` story in `tests/features/landing/home/landing-hero.ladle.tsx` via a `@ladle(component=LandingHero, story=…)` tag
- **AND** the coverage script exits with code zero.

### Requirement: Root scripts fan out to `@unveiled/landing`

The root `package.json` scripts `dev`, `build`, and `check` MUST fan out to `@unveiled/landing` alongside the existing workspace members. `bun run dev` MUST start the landing dev server on port 4322 and the app dev server on port 4321; the orchestrator (change 06) is responsible for the public dispatch in production and the dev proxy locally.

#### Scenario: dev script starts the landing dev server

- **WHEN** a contributor runs `bun run dev` at the repo root
- **THEN** the command fans out to `bun --filter @unveiled/landing run dev` (port 4322) and `bun --filter @unveiled/app run dev` (port 4321).

#### Scenario: build script builds the landing package

- **WHEN** a contributor runs `bun run build` at the repo root
- **THEN** the command includes `bun --filter @unveiled/landing run build`
- **AND** `packages/landing/dist/server/entry.mjs` is produced.

#### Scenario: check script fans out to the landing package

- **WHEN** a contributor runs `bun run check` at the repo root
- **THEN** the umbrella runs `astro check` and `biome check .` (or the equivalent) inside `@unveiled/landing`
- **AND** the umbrella exits non-zero if any landing check fails.

