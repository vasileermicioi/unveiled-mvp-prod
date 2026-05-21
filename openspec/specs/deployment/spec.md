## Purpose
Define Cloudflare runtime, deployment, configuration, asset storage, health, and observability requirements.
## Requirements
### Requirement: Public Map Provider Configuration
The app SHALL expose only browser-safe map provider configuration values and keep map secrets out of server-only output.

#### Scenario: Client reads public configuration
- **WHEN** discovery renders an interactive map in the browser
- **THEN** the client reads only `PUBLIC_` map provider values or another explicitly browser-safe configuration surface

#### Scenario: Missing provider config fails safely
- **WHEN** map provider configuration is missing or invalid
- **THEN** startup, route rendering, or health reporting returns a safe configuration failure or visible fallback without exposing secret values

#### Scenario: Secret values remain hidden
- **WHEN** logs, build output, client bundles, or health responses are inspected
- **THEN** map provider secrets and authorization headers are absent

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

### Requirement: Admin Asset Upload Runtime Configuration
Deployment configuration SHALL support authorized admin asset uploads in environments where upload controls are enabled.

#### Scenario: Local upload configuration is documented
- **WHEN** a developer runs the app locally or under parity smoke tests
- **THEN** the required asset storage binding or documented upload-unavailable fallback is available without exposing storage secrets to the browser

#### Scenario: Preview upload configuration is available
- **WHEN** a Cloudflare preview deployment enables admin upload controls
- **THEN** the asset bucket binding and public asset base URL are configured so uploaded event images and partner logos can be displayed

#### Scenario: Production upload configuration is available
- **WHEN** a production deployment enables admin upload controls
- **THEN** the asset bucket binding and public asset base URL are configured as required deployment secrets or bindings

#### Scenario: Missing upload configuration fails safely
- **WHEN** asset storage configuration is missing or invalid
- **THEN** admin upload attempts fail with safe visible errors
- **AND** manual remote URL fields remain usable when valid HTTPS URLs are provided

#### Scenario: Storage secrets are not exposed
- **WHEN** client bundles, logs, health responses, or action errors are inspected
- **THEN** storage credentials, private binding details, and provider authorization values are not exposed

### Requirement: Transaction Test Environment Validation
The app SHALL provide a script to validate the transaction test environment configuration before test execution.

#### Scenario: Script detects missing configuration
- **WHEN** the validation script runs without a configured test database URL
- **THEN** it exits with a non-zero code and logs a descriptive setup error.

#### Scenario: Script detects active configuration
- **WHEN** the validation script runs with a valid test database URL
- **THEN** it exits with code 0 and logs verification success.

