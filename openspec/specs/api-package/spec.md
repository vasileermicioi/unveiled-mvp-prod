# api-package Specification

## Purpose
TBD - created by archiving change extract-api-package. Update Purpose after archive.
## Requirements
### Requirement: @unveiled/api Package Owns The HTTP Surface

A Bun workspace package named `@unveiled/api` SHALL exist at `packages/api/` and SHALL own every HTTP route under `/api/*` plus the canonical HTTP shape of every Astro Action under `src/actions/index.ts`. The package SHALL be built on Hono 4 and SHALL export a default Cloudflare Workers fetch handler from `packages/api/src/worker.ts`.

#### Scenario: Workspace member exists

- **WHEN** a contributor inspects the root `package.json`
- **THEN** `packages/api` is listed in `workspaces`
- **AND** `packages/api/package.json` declares `"name": "@unveiled/api"` and `"private": true`

#### Scenario: Package declares required scripts

- **WHEN** a contributor inspects `packages/api/package.json`
- **THEN** it exposes the scripts `dev`, `build`, `typecheck`, `lint`, `test:unit`, `test:integration`, `openapi:gen`, and `openapi:check`

#### Scenario: Worker bundle is produced

- **WHEN** `bun run build` is run from `packages/api`
- **THEN** `packages/api/dist/worker.js` is produced and is a valid ESM Workers entrypoint
- **AND** `wrangler.api.toml` declares `main = "packages/api/dist/worker.js"`

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

### Requirement: Hono Routes Use Generated Zod Validators

Every Hono route under `packages/api/src/routes/**` SHALL parse its request body, query, headers, and params through the Zod validators emitted to `src/lib/generated/**` by the TypeSpec build, and SHALL NOT introduce ad-hoc Zod schemas for new routes.

#### Scenario: Route uses the generated validator

- **WHEN** a request reaches any route under `packages/api/src/routes/**`
- **THEN** the route parses the request through a schema imported from `@unveiled/api` (which re-exports `src/lib/generated/**`)
- **AND** validation failures return a typed 400 response with the field-level error shape declared in TypeSpec

#### Scenario: Response conforms to the OpenAPI model

- **WHEN** a Hono route returns a JSON response
- **THEN** the response body conforms to the `Response` model declared for that operation in TypeSpec

### Requirement: Hono App Produces An OpenAPI 3.1 Document

The Hono app SHALL assemble its OpenAPI 3.1 document via `@hono/zod-openapi` and SHALL write it to `packages/api/openapi.generated.yaml`. A `bun run openapi:check` script SHALL diff the assembled document against `typespec/output/openapi.yaml` (modulo `servers`, `info.version`, and timestamps) and SHALL exit non-zero on drift.

#### Scenario: Document is generated on demand

- **WHEN** `bun run openapi:gen` is run
- **THEN** `packages/api/openapi.generated.yaml` is written and matches the Hono app's registered routes

#### Scenario: Drift is caught in CI

- **WHEN** the Hono app's registered routes diverge from the TypeSpec contract
- **THEN** `bun run openapi:check` exits non-zero
- **AND** `bun run check` (which includes `openapi:check`) fails

### Requirement: OpenAPI Document Is Served From The Hono App

The OpenAPI document served at `GET /api/openapi.json` SHALL be produced by the Hono app and SHALL be byte-identical to the committed `typespec/output/openapi.yaml` modulo server URL. The request reaches the API Worker via the orchestrator's `API` service binding in production; the orchestrator does not transform the response.

#### Scenario: /api/openapi.json is served by Hono

- **WHEN** a client issues `GET /api/openapi.json` to the public hostname
- **THEN** the orchestrator dispatches the request to `env.API.fetch(request)` (the API Worker)
- **AND** the response body is the Hono-app-generated OpenAPI document
- **AND** the `Content-Type` is `application/json; charset=utf-8`
- **AND** the orchestrator does not transform the response (no extra headers, no body re-encoding).

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

### Requirement: Better Auth Is Mounted Inside The Hono App

The Better Auth HTTP handlers SHALL be mounted inside the Hono app at `/api/auth/*`, and the Astro app SHALL defer sign-in, sign-up, sign-out, password-recovery, and account endpoints to the API package while keeping its session-cookie verification for SSR pages.

#### Scenario: Astro forwards auth endpoints to the API package

- **WHEN** a request arrives at `/api/auth/*` from the Astro app
- **THEN** the catch-all shim forwards it to the Hono app's Better Auth mount
- **AND** the response is returned to the caller unchanged

#### Scenario: Astro app still reads the session cookie

- **WHEN** an SSR page in the Astro app resolves the authenticated viewer
- **THEN** `src/lib/auth.ts` continues to read the Better Auth session cookie via the shared adapter configuration
- **AND** the session cookie's `Domain` attribute is set to `AUTH_COOKIE_DOMAIN` so both runtimes read the same cookie

### Requirement: Stripe Webhook Verifies With Raw Body

The Stripe webhook handler SHALL live at `packages/api/src/routes/stripe/webhook.ts`, SHALL read the raw request body once via `await c.req.raw.text()`, and SHALL verify the `Stripe-Signature` header with `stripe.webhooks.constructEventAsync` before validating the parsed payload against the generated Zod schema.

#### Scenario: Signature failure rejects without mutation

- **WHEN** Stripe sends a webhook with an invalid `Stripe-Signature` header
- **THEN** the handler returns `400` and mutates no state

#### Scenario: Valid signature validates against the generated schema

- **WHEN** Stripe sends a webhook with a valid `Stripe-Signature` header
- **THEN** the parsed payload is validated against the Zod schema emitted for `WebhookService.stripe`
- **AND** schema failures are rejected without mutating state
- **AND** schema matches are processed by the existing handler logic (unchanged)

### Requirement: Astro Actions Expose A Canonical HTTP Shape In The Hono App

Every Astro Action under `src/actions/index.ts` SHALL have a matching Hono route under `packages/api/src/routes/actions/**` that accepts the action's input and returns the action's result. The handler logic SHALL be unchanged; only the binding moves.

#### Scenario: Non-Astro callers can hit an action via HTTP

- **WHEN** a cron job or third-party SDK issues `POST /api/actions/<name>` with the action's input JSON
- **THEN** the Hono route validates the input against the generated Zod schema
- **AND** invokes the action handler
- **AND** returns the action's typed result envelope

#### Scenario: Astro app still uses Astro Actions directly

- **WHEN** a page-level form in the Astro app calls an action
- **THEN** it continues to call `actions.<name>(input)` directly via Astro's typed action client
- **AND** the `safe` / `data` / `error` envelope is preserved

### Requirement: Server-Only Data Access Lives In @unveiled/api

Drizzle queries used by the HTTP layer SHALL live under `packages/api/src/data-access/**`. The Astro app SHALL keep a thin re-export at `src/lib/data-access/**` for the duration of the shim window and SHALL remove it in change 04.

#### Scenario: Hono routes import from @unveiled/api's data access

- **WHEN** a Hono route under `packages/api/src/routes/**` needs a Drizzle query
- **THEN** it imports the query from `@unveiled/api/data-access` (which is `packages/api/src/data-access/**`)
- **AND** it does not reach into `src/lib/data-access/**` directly

#### Scenario: Astro app keeps the re-export shim

- **WHEN** an SSR page in the Astro app imports a data-access helper
- **THEN** the import resolves through the `src/lib/data-access/**` re-export shim
- **AND** the shim delegates to `@unveiled/api/data-access`

### Requirement: Workspace Toolchain Is Wired For @unveiled/api

The root `package.json` SHALL wire `bun run --filter '*' typecheck` and `bun run --filter '*' test:unit` to fan out to `@unveiled/api`, and root-level scripts that read from the repo root (`check`, `lint`, `specs:check`, `openapi:check`) SHALL widen their globs to cover `packages/api/**`.

#### Scenario: Typecheck fans out to the package

- **WHEN** `bun run typecheck:workspaces` is run
- **THEN** every workspace member, including `@unveiled/api`, runs its own `tsc --noEmit`
- **AND** any per-package typecheck failure exits non-zero

#### Scenario: Unit tests fan out to the package

- **WHEN** `bun run test:workspaces` is run
- **THEN** every workspace member, including `@unveiled/api`, runs its own `bun test`
- **AND** any per-package unit test failure exits non-zero

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

### Requirement: Astro Pages Do Not Reach Into src/pages/api

After this change, no source file under `src/pages/` or `src/components/` SHALL import from `src/pages/api/**`. The catch-all shim from change 02 is deleted; the only remaining `/api/*` path in the Astro app is the middleware short-circuit.

#### Scenario: No imports from the deleted shim

- **WHEN** `bun run check` runs
- **THEN** no source file imports from `src/pages/api/**`
- **AND** `rg "from ['\"]@/pages/api" src` returns no matches
- **AND** `src/pages/api/**` does not exist on disk

