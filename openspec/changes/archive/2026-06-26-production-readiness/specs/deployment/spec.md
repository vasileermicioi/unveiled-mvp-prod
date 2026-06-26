## ADDED Requirements

### Requirement: Env Contract Is Enforced

The `wrangler.*.toml` files MUST declare every key in `PRODUCTION_ENVS` under `[env.production.vars]` (or document it as a Cloudflare secret), and the `wrangler:check-env` script MUST fail the build otherwise. `PRODUCTION_ENVS` is the `readonly string[]` exported from `packages/api/src/env.ts` listing `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `PUBLIC_ASSET_BASE_URL`, `AUTH_COOKIE_DOMAIN`, `PUBLIC_ORCHESTRATOR_URL`.

#### Scenario: Missing env fails the build

- **WHEN** `bun run wrangler:check-env` runs and `wrangler.api.toml` is missing `AUTH_COOKIE_DOMAIN` under `[env.production.vars]`
- **THEN** the script exits non-zero
- **AND** the error message lists the missing keys per file

#### Scenario: Present env passes the build

- **WHEN** `bun run wrangler:check-env` runs and every key in `PRODUCTION_ENVS` is declared under `[env.production.vars]` in every `wrangler.*.toml`
- **THEN** the script exits zero

#### Scenario: Gate is wired into `bun run check`

- **WHEN** `bun run check` runs in CI
- **THEN** `bun run wrangler:check-env` is executed as one of the gate steps
- **AND** any non-zero exit from `wrangler:check-env` fails the overall `bun run check` command

#### Scenario: Secrets are allowed without a `[vars]` declaration

- **WHEN** a key in `PRODUCTION_ENVS` is listed under the documented Cloudflare secrets list (e.g. `BETTER_AUTH_SECRET`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`)
- **THEN** the script does NOT require a `[env.production.vars]` entry for that key
- **AND** the absence is treated as a documented secret, not a missing variable.

## MODIFIED Requirements

### Requirement: Health and Observability

The app SHALL expose safe liveness/readiness checks and operational logs for Cloudflare deployment, database connectivity, and scheduled jobs. After this change, the public-facing liveness and readiness probes are owned by the orchestrator Worker (`packages/orchestrator/src/worker.ts`, configured via `wrangler.orchestrator.toml`) at `/healthz` and `/readyz`. The previously-public `/api/health.json` and `/api/readiness.json` endpoints (still served by the API Worker for internal health checks) are no longer the public-facing health surface; the orchestrator's `/readyz` endpoint calls the API Worker's internal `/api/readiness.json` via service binding and composes the readiness of all downstream Workers (API, app, landing) into a single safe envelope. The orchestrator's `/readyz` MUST additionally return `503` when the API Worker's internal readiness payload reports any of `database`, `auth`, `stripe`, or `assets` as `{ ok: false }`.

#### Scenario: Liveness check succeeds

- **WHEN** the liveness health endpoint (`GET /healthz`) is requested on a running deployment
- **THEN** the orchestrator returns a `200` response with body `"ok"`
- **AND** the response carries no secret or provider payload data.

#### Scenario: Readiness check validates dependencies

- **WHEN** the readiness health endpoint (`GET /readyz`) is requested by an authorized operator or deployment check
- **THEN** the orchestrator calls `env.API.fetch("/api/readiness.json")`, `env.APP.fetch("/app/_health")`, and `env.LANDING.fetch("/_health")` via service binding (each wrapped in a 1-second timeout)
- **AND** returns `200` only when all three downstream health probes return `200` AND the API Worker's readiness payload reports `database`, `auth`, `stripe`, and `assets` as `ok: true`
- **AND** returns `503` with a safe envelope listing the failing surfaces otherwise.

#### Scenario: Runtime error is logged

- **WHEN** SSR, API, auth, database, storage, or job runtime code fails
- **THEN** the app records safe diagnostic context suitable for Cloudflare operational review without logging secrets
- **AND** the orchestrator's request log carries a `requestId` correlation id that is forwarded to the failing Worker so the error log can be joined to the request.