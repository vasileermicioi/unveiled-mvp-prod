# deployment Specification

## Requirements

### Requirement: Cloudflare SSR Runtime
The app SHALL run Astro server-rendered pages, API routes, auth routes, server actions, and React hydrated islands on the selected Cloudflare deployment target without Node-only runtime assumptions.

#### Scenario: Production SSR runs on Cloudflare
- **WHEN** the production deployment serves a server-rendered route
- **THEN** Astro renders the route through the Cloudflare runtime
- **AND** the route does not require the Node standalone adapter.

#### Scenario: API route runs on Cloudflare
- **WHEN** a client or operator requests an Astro API route in preview or production
- **THEN** the route executes in the Cloudflare runtime and returns the expected HTTP response.

#### Scenario: Hydrated island loads after SSR
- **WHEN** a server-rendered page includes a TanStack-powered React island
- **THEN** the page HTML is served by Cloudflare and the island hydrates from Cloudflare-hosted assets without missing asset errors.

### Requirement: Cloudflare Database Connectivity
The app SHALL use a Neon-compatible Drizzle/Postgres connection mode for Cloudflare runtime database access.

#### Scenario: Server code queries Postgres
- **WHEN** Cloudflare runtime code accesses application data through Drizzle
- **THEN** it uses a Neon-compatible connection mode and succeeds without local PGlite or Node TCP socket assumptions.

#### Scenario: Database configuration is missing
- **WHEN** a Cloudflare preview or production runtime starts without the required database connection secret
- **THEN** health/readiness checks report a safe configuration failure without exposing secret values.

### Requirement: Cloudflare Environment Configuration
The app SHALL document and require environment-specific configuration for auth, database, email, payments where enabled, asset storage, public URLs, and runtime mode.

#### Scenario: Production secrets are configured
- **WHEN** a production deployment is promoted
- **THEN** Better Auth, database, Resend, payment, and asset-storage secrets required by enabled features are present in Cloudflare configuration.

#### Scenario: Public configuration is exposed
- **WHEN** client-side code needs public app or auth URLs
- **THEN** only `PUBLIC_` configuration values are exposed to the browser.

#### Scenario: Secret values are inspected
- **WHEN** logs, health responses, build output, or client bundles are reviewed
- **THEN** secret values and provider authorization headers are absent.

### Requirement: Asset Storage Replacement
The app SHALL replace Firebase Storage rules with the selected Cloudflare-compatible asset storage approach for event and partner image assets.

#### Scenario: Admin uploads asset
- **WHEN** an admin uploads or updates an event or partner image asset
- **THEN** the server authorizes admin access before writing storage data
- **AND** the system returns a display URL usable by event or partner data.

#### Scenario: Non-admin upload is rejected
- **WHEN** a guest, member, or partner attempts to upload or replace an admin-managed image asset
- **THEN** the server rejects the write before storage data is changed.

#### Scenario: Remote URL launch path is used
- **WHEN** upload support is deferred for launch
- **THEN** event and partner data may use validated remote image URLs while the production storage target remains documented.

### Requirement: Deploy and Preview Operations
The app SHALL provide documented local build, Cloudflare preview, and production deploy commands.

#### Scenario: Developer runs preview
- **WHEN** a developer runs the documented preview command with local environment values
- **THEN** the app serves through a Cloudflare-compatible preview runtime.

#### Scenario: Production deploy runs
- **WHEN** the documented production deploy command runs
- **THEN** the build uses the Cloudflare adapter and deploys the generated assets and SSR runtime to Cloudflare.

### Requirement: Health and Observability
The app SHALL expose safe liveness/readiness checks and operational logs for Cloudflare deployment, database connectivity, and scheduled jobs.

#### Scenario: Liveness check succeeds
- **WHEN** the liveness health endpoint is requested on a running deployment
- **THEN** it returns a safe success response with no secret or provider payload data.

#### Scenario: Readiness check validates dependencies
- **WHEN** the readiness health endpoint is requested by an authorized operator or deployment check
- **THEN** it verifies required configuration and database connectivity using safe status details.

#### Scenario: Runtime error is logged
- **WHEN** SSR, API, auth, database, storage, or job runtime code fails
- **THEN** the app records safe diagnostic context suitable for Cloudflare operational review without logging secrets.
