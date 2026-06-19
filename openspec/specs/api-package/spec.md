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

Every endpoint that exists under `src/pages/api/**` SHALL have a matching Hono route under `packages/api/src/routes/**` that returns a byte-identical response for the same request. During the shim window, `src/pages/api/[...path].ts` forwards every request to the Hono app so the existing surface keeps working.

#### Scenario: Catch-all shim forwards to the Hono app

- **WHEN** a request arrives at any path under `src/pages/api/**`
- **THEN** the catch-all handler invokes the `@unveiled/api` fetch handler with the original `Request` and `env`
- **AND** the returned `Response` is returned to the caller unchanged

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

The OpenAPI document served at `GET /api/openapi.json` SHALL be produced by the Hono app and SHALL be byte-identical to the committed `typespec/output/openapi.yaml` modulo server URL.

#### Scenario: /api/openapi.json is served by Hono

- **WHEN** a client issues `GET /api/openapi.json`
- **THEN** the response body is the Hono-app-generated OpenAPI document
- **AND** the `Content-Type` is `application/json; charset=utf-8`

### Requirement: Cloudflare Worker Deploys From packages/api

The Hono app SHALL deploy to Cloudflare Workers via a dedicated `wrangler.api.toml` at the repo root, with `name = "unveiled-api"` and `main = "packages/api/dist/worker.js"`.

#### Scenario: Worker responds to health probes

- **WHEN** the Worker is deployed to a preview or production environment
- **THEN** `GET /api/health.json` returns `200` with the same payload shape the Astro endpoint returned
- **AND** `GET /api/readiness.json` returns `200` with the same payload shape the Astro endpoint returned

#### Scenario: wrangler.api.toml binds the same secrets and bindings

- **WHEN** `wrangler.api.toml` is inspected
- **THEN** it declares the same secrets (`BETTER_AUTH_SECRET`, `STRIPE_*`, etc.) and the same KV/R2 bindings as the root `wrangler.toml`
- **AND** no secret values are checked into the repository

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

