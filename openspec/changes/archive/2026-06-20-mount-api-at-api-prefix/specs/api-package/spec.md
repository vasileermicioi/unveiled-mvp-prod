## MODIFIED Requirements

### Requirement: Every Existing Astro Endpoint Has A Matching Hono Route

Every endpoint that exists under `src/pages/api/**` SHALL have a matching Hono route under `packages/api/src/routes/**` that returns a byte-identical response for the same request. After this change, `src/pages/api/**` no longer exists: requests under `/api/*` are forwarded from the Astro app Worker to the API Worker via the Cloudflare service binding declared in `wrangler.toml` (`binding = "API"`, `service = "unveiled-api"`, `entrypoint = "fetch"`). The Astro app keeps a `/api/*` short-circuit in `src/middleware.ts` that returns `env.API.fetch(request)` before any Astro guard runs; the catch-all shim from change 02 is removed.

#### Scenario: Catch-all shim forwards to the Hono app

- **WHEN** a request arrives at any path under `src/pages/api/**`
- **THEN** the catch-all handler invokes the `@unveiled/api` fetch handler with the original `Request` and `env`
- **AND** the returned `Response` is returned to the caller unchanged

#### Scenario: Astro catch-all shim is removed

- **WHEN** the change is applied
- **THEN** no file exists under `src/pages/api/**`
- **AND** every `/api/*` request is handled by the service-binding short-circuit in `src/middleware.ts`
- **AND** the service-binding short-circuit runs before any Astro middleware guard (language resolution, viewer hydration, route-table match, permission check)

#### Scenario: /api/* short-circuit runs before the guard chain

- **WHEN** a request arrives at any path under `/api/*`
- **THEN** `src/middleware.ts` imports `env` from `cloudflare:workers` and returns `env.API.fetch(request)` before the language resolution guard runs
- **AND** no Better Auth session read, viewer hydration, route-table match, or permission check is performed for that request

#### Scenario: Existing endpoints keep byte-identical responses

- **WHEN** the integration suite under `tests/api/` replays the seeded request fixtures for every prior `src/pages/api/**` path
- **THEN** the Hono route returns a response whose status, headers, and body match the prior Astro endpoint byte-for-byte

### Requirement: Cloudflare Worker Deploys From packages/api

The Hono app SHALL deploy to Cloudflare Workers via a dedicated `wrangler.api.toml` at the repo root, with `name = "unveiled-api"` and `main = "packages/api/dist/worker.js"`. `wrangler.api.toml` SHALL declare the same `SESSION` KV namespace id and `ASSETS_BUCKET` R2 binding as the root `wrangler.toml` so service-bound calls from the Astro app Worker succeed in dev, preview, and production.

#### Scenario: Worker responds to health probes

- **WHEN** the Worker is deployed to a preview or production environment
- **THEN** `GET /api/health.json` returns `200` with the same payload shape the Astro endpoint returned
- **AND** `GET /api/readiness.json` returns `200` with the same payload shape the Astro endpoint returned

#### Scenario: wrangler.api.toml binds the same secrets and bindings

- **WHEN** `wrangler.api.toml` is inspected
- **THEN** it declares the same secrets (`BETTER_AUTH_SECRET`, `STRIPE_*`, etc.) and the same KV/R2 bindings as the root `wrangler.toml`
- **AND** no secret values are checked into the repository

#### Scenario: wrangler.api.toml declares the SESSION KV binding

- **WHEN** `wrangler.api.toml` is inspected
- **THEN** it declares the `SESSION` KV namespace binding with the same id as the root `wrangler.toml`
- **AND** the id matches the value the Astro app uses for `env.SESSION`

#### Scenario: wrangler.api.toml declares the ASSETS_BUCKET R2 binding

- **WHEN** `wrangler.api.toml` is inspected
- **THEN** it declares the `ASSETS_BUCKET` R2 binding with the same bucket name as the root `wrangler.toml`

#### Scenario: Binding parity is asserted in CI

- **WHEN** `bun run test:unit` runs
- **THEN** `tests/unit/wrangler-bindings.test.ts` parses both Wrangler configs
- **AND** fails when a binding declared in `wrangler.toml` is missing from `wrangler.api.toml` (or vice versa)

## ADDED Requirements

### Requirement: Astro App Forwards /api/* To The API Worker Via Service Binding

The Astro app SHALL declare a Cloudflare service binding named `API` in `wrangler.toml` that points at the deployed `unveiled-api` Worker (`entrypoint = "fetch"`). `src/middleware.ts` SHALL short-circuit every request whose `url.pathname` starts with `/api/` by importing `env` from `cloudflare:workers` and returning `env.API.fetch(request)` before the Astro middleware guard chain runs.

#### Scenario: wrangler.toml declares the service binding

- **WHEN** the root `wrangler.toml` is inspected
- **THEN** it contains the `[[services]] binding = "API" service = "unveiled-api" entrypoint = "fetch"` block

#### Scenario: Service-binding request returns the upstream Response

- **WHEN** any request arrives at `/api/*` on the deployed Astro app Worker
- **THEN** the response status, headers, and body match the response the API Worker would have returned had the request been sent directly
- **AND** no Astro middleware guard runs for that request
- **AND** the short-circuit uses `import { env } from "cloudflare:workers"` (Astro v6 typed env) rather than `context.locals.runtime.env`, which throws at runtime in Astro v6

#### Scenario: Cookie is preserved across the binding

- **WHEN** a request with a `Cookie` header arrives at `/api/*`
- **THEN** the inbound `Cookie` header is forwarded to the API Worker unchanged
- **AND** any `Set-Cookie` header returned by the API Worker is returned to the caller unchanged

#### Scenario: Streaming response is preserved across the binding

- **WHEN** the API Worker returns a `ReadableStream` body (e.g. the Stripe webhook handler's raw-body read, a future SSE endpoint)
- **THEN** the Astro app Worker returns the same stream to the caller
- **AND** chunked transfer encoding is preserved

#### Scenario: Preview and production use the same binding name

- **WHEN** `bun run preview:cloudflare` or `bun run deploy:cloudflare` runs
- **THEN** the Astro app Worker is deployed with the `API` service binding pointing at the preview or production `unveiled-api` Worker
- **AND** the binding id matches between environments

### Requirement: Astro Pages Do Not Reach Into src/pages/api

After this change, no source file under `src/pages/` or `src/components/` SHALL import from `src/pages/api/**`. The catch-all shim from change 02 is deleted; the only remaining `/api/*` path in the Astro app is the middleware short-circuit.

#### Scenario: No imports from the deleted shim

- **WHEN** `bun run check` runs
- **THEN** no source file imports from `src/pages/api/**`
- **AND** `rg "from ['\"]@/pages/api" src` returns no matches
- **AND** `src/pages/api/**` does not exist on disk
