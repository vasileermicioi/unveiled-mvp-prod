## ADDED Requirements

### Requirement: Every Hono Route Uses The /api/ Prefix

Every Hono route registered via `createRoute({ path })` under `packages/api/src/routes/**` MUST declare its `path` with a leading `/api/` segment. This includes the system routes (`health`, `readiness`, `openapi.yaml`, `openapi.json`), which MUST be served at `/api/health.json`, `/api/readiness.json`, `/api/openapi.yaml`, and `/api/openapi.json` respectively. The orchestrator forwards inbound `/api/*` requests to the API Worker without stripping the prefix, so the API Worker MUST register its routes with the prefix intact.

#### Scenario: System routes use the /api/ prefix

- **WHEN** a developer inspects `packages/api/src/routes/system/index.ts`
- **THEN** the four `createRoute({ path })` values are `"/api/health.json"`, `"/api/readiness.json"`, `"/api/openapi.yaml"`, and `"/api/openapi.json"`
- **AND** no other Hono route under `packages/api/src/routes/**` declares a `path` that does not begin with `/api/`.

#### Scenario: Hono-generated OpenAPI document reflects the prefix

- **WHEN** `bun --filter @unveiled/api run openapi:gen` is run
- **THEN** `packages/api/openapi.generated.yaml` lists the four system routes under their `/api/...` paths
- **AND** the diff against `typespec/output/openapi.yaml` (modulo `servers`, `info.version`, and timestamps) is limited to the path-prefix change.

#### Scenario: Route-prefix guard fails CI on drift

- **WHEN** `bun run test:unit` runs
- **THEN** the permanent unit test under `tests/unit/api-route-prefixes.test.ts` parses every `createRoute({ path })` value under `packages/api/src/routes/**/*.ts`
- **AND** fails when any value does not start with `/api/`.

## MODIFIED Requirements

### Requirement: Worker responds to health probes

The Hono app MUST register `healthRoute`, `readinessRoute`, `openapiYamlRoute`, and `openapiJsonRoute` with `path` values of `"/api/health.json"`, `"/api/readiness.json"`, `"/api/openapi.yaml"`, and `"/api/openapi.json"` respectively. The API Worker MUST be the downstream target of the orchestrator's `[[services]] binding = "API"` declaration in `wrangler.orchestrator.toml`; the API Worker is no longer the public-facing entry point for `/api/*` traffic — the orchestrator is.

#### Scenario: Health probe is reachable through the orchestrator

- **WHEN** the Worker is deployed to a preview or production environment
- **THEN** `GET /api/health.json` returns `200` with the same payload shape the prior `/health.json` endpoint returned
- **AND** `GET /api/readiness.json` returns `200` with the same payload shape the prior `/readiness.json` endpoint returned
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