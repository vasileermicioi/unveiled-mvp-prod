## MODIFIED Requirements

### Requirement: Cloudflare Worker Deploys From packages/api

The Hono app SHALL deploy to Cloudflare Workers via a dedicated `wrangler.api.toml` at the repo root, with `name = "unveiled-api"` and `main = "packages/api/dist/worker.js"`. `wrangler.api.toml` SHALL declare the same `SESSION` KV namespace id and `ASSETS_BUCKET` R2 binding as the per-package Wrangler configs used by the app and landing so service-bound calls from the orchestrator and from the Astro app succeed in dev, preview, and production. The API Worker is the downstream target of the orchestrator's `[[services]] binding = "API"` declaration in `wrangler.orchestrator.toml`; the API Worker is no longer the public-facing entry point for `/api/*` traffic — the orchestrator is.

#### Scenario: Worker responds to health probes

- **WHEN** the Worker is deployed to a preview or production environment
- **THEN** `GET /api/health.json` returns `200` with the same payload shape the Astro endpoint returned
- **AND** `GET /api/readiness.json` returns `200` with the same payload shape the Astro endpoint returned
- **AND** both endpoints are reachable via service binding (from the orchestrator's `/readyz` probe and from the app's middleware short-circuit) but are not the public-facing health surface — `/healthz` and `/readyz` (served by the orchestrator) are.

#### Scenario: wrangler.api.toml binds the same secrets and bindings

- **WHEN** `wrangler.api.toml` is inspected
- **THEN** it declares the same secrets (`BETTER_AUTH_SECRET`, `STRIPE_*`, etc.) and the same KV/R2 bindings as `wrangler.app.toml` and `wrangler.landing.toml`
- **AND** no secret values are checked into the repository.

#### Scenario: wrangler.api.toml declares the SESSION KV binding

- **WHEN** `wrangler.api.toml` is inspected
- **THEN** it declares the `SESSION` KV namespace binding with the same id as `wrangler.app.toml`
- **AND** the id matches the value the Astro app uses for `env.SESSION`
- **AND** the orchestrator's service binding to the API Worker does not require any KV/R2 re-declaration (the binding lives on the API Worker's `wrangler.api.toml`).

#### Scenario: wrangler.api.toml declares the ASSETS_BUCKET R2 binding

- **WHEN** `wrangler.api.toml` is inspected
- **THEN** it declares the `ASSETS_BUCKET` R2 binding with the same bucket name as `wrangler.app.toml`.

#### Scenario: Binding parity is asserted in CI

- **WHEN** `bun run test:unit` runs
- **THEN** `tests/unit/wrangler-bindings.test.ts` parses every per-package Wrangler config (`wrangler.app.toml`, `wrangler.api.toml`, `wrangler.landing.toml`, `wrangler.orchestrator.toml`)
- **AND** fails when a binding declared in one config is missing from another (the orchestrator's service bindings must reference Workers that exist in their respective per-package configs).

### Requirement: Astro App Forwards /api/* To The API Worker Via Service Binding

The Astro app SHALL declare a Cloudflare service binding named `API` in `wrangler.app.toml` that points at the deployed `unveiled-api` Worker (`entrypoint = "fetch"`). `packages/app/src/middleware.ts` SHALL short-circuit every request whose `url.pathname` starts with `/api/` by importing `env` from `cloudflare:workers` and returning `env.API.fetch(request)` before the Astro middleware guard chain runs. In production, the orchestrator (`wrangler.orchestrator.toml`) is the canonical entry point and dispatches `/api/*` to the API Worker via its own `API` service binding; the app's middleware short-circuit is preserved as defense-in-depth for direct app-only deploys.

#### Scenario: wrangler.app.toml declares the service binding

- **WHEN** `wrangler.app.toml` is inspected
- **THEN** it contains the `[[services]] binding = "API" service = "unveiled-api" entrypoint = "fetch"` block.

#### Scenario: Service-binding request returns the upstream Response

- **WHEN** any request arrives at `/api/*` on the deployed Astro app Worker
- **THEN** the response status, headers, and body match the response the API Worker would have returned had the request been sent directly
- **AND** no Astro middleware guard runs for that request
- **AND** the short-circuit uses `import { env } from "cloudflare:workers"` (Astro v6 typed env) rather than `context.locals.runtime.env`, which throws at runtime in Astro v6.

#### Scenario: Cookie is preserved across the binding

- **WHEN** a request with a `Cookie` header arrives at `/api/*`
- **THEN** the inbound `Cookie` header is forwarded to the API Worker unchanged
- **AND** any `Set-Cookie` header returned by the API Worker is returned to the caller unchanged
- **AND** the orchestrator's dispatch path preserves cookies the same way (the orchestrator forwards the inbound `Request` object directly to `env.API.fetch`).

#### Scenario: Streaming response is preserved across the binding

- **WHEN** the API Worker returns a `ReadableStream` body (e.g. the Stripe webhook handler's raw-body read, a future SSE endpoint)
- **THEN** the Astro app Worker returns the same stream to the caller
- **AND** chunked transfer encoding is preserved.

#### Scenario: Preview and production use the same binding name

- **WHEN** `bun run preview:cloudflare` or `bun run deploy:cloudflare` runs
- **THEN** the Astro app Worker is deployed with the `API` service binding pointing at the preview or production `unveiled-api` Worker
- **AND** the binding id matches between environments
- **AND** the orchestrator deploys last in the chain and binds to the now-live `unveiled-api` Worker via its own `[[services]] binding = "API"` declaration.

### Requirement: OpenAPI Document Is Served From The Hono App

The OpenAPI document served at `GET /api/openapi.json` SHALL be produced by the Hono app and SHALL be byte-identical to the committed `typespec/output/openapi.yaml` modulo server URL. The request reaches the API Worker via the orchestrator's `API` service binding in production; the orchestrator does not transform the response.

#### Scenario: /api/openapi.json is served by Hono

- **WHEN** a client issues `GET /api/openapi.json` to the public hostname
- **THEN** the orchestrator dispatches the request to `env.API.fetch(request)` (the API Worker)
- **AND** the response body is the Hono-app-generated OpenAPI document
- **AND** the `Content-Type` is `application/json; charset=utf-8`
- **AND** the orchestrator does not transform the response (no extra headers, no body re-encoding).