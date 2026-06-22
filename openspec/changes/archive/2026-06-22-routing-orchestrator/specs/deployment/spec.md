## MODIFIED Requirements

### Requirement: Health and Observability

The app SHALL expose safe liveness/readiness checks and operational logs for Cloudflare deployment, database connectivity, and scheduled jobs. After this change, the public-facing liveness and readiness probes are owned by the orchestrator Worker (`packages/orchestrator/src/worker.ts`, configured via `wrangler.orchestrator.toml`) at `/healthz` and `/readyz`. The previously-public `/api/health.json` and `/api/readiness.json` endpoints (still served by the API Worker for internal health checks) are no longer the public-facing health surface; the orchestrator's `/readyz` endpoint calls the API Worker's internal `/api/readiness.json` via service binding and composes the readiness of all downstream Workers (API, app, landing) into a single safe envelope.

#### Scenario: Liveness check succeeds

- **WHEN** the liveness health endpoint (`GET /healthz`) is requested on a running deployment
- **THEN** the orchestrator returns a `200` response with body `"ok"`
- **AND** the response carries no secret or provider payload data.

#### Scenario: Readiness check validates dependencies

- **WHEN** the readiness health endpoint (`GET /readyz`) is requested by an authorized operator or deployment check
- **THEN** the orchestrator calls `env.API.fetch("/api/readiness.json")`, `env.APP.fetch("/app/_health")`, and `env.LANDING.fetch("/_health")` via service binding (each wrapped in a 1-second timeout)
- **AND** returns `200` only when all three downstream health probes return `200`
- **AND** returns `503` with a safe envelope listing the failing surfaces otherwise.

#### Scenario: Runtime error is logged

- **WHEN** SSR, API, auth, database, storage, or job runtime code fails
- **THEN** the app records safe diagnostic context suitable for Cloudflare operational review without logging secrets
- **AND** the orchestrator's request log carries a `requestId` correlation id that is forwarded to the failing Worker so the error log can be joined to the request.

### Requirement: Deploy and Preview Operations

The app SHALL provide documented local build, Cloudflare preview, and production deploy commands. After this change, the deploy chain is a four-step Wrangler sequence (`api` → `app` → `landing` → `orchestrator`) in both preview and production; the orchestrator deploys last because its service bindings require the downstream Workers to be live.

#### Scenario: Developer runs preview

- **WHEN** a developer runs `bun run preview:cloudflare`
- **THEN** the command chains `wrangler dev --remote` for `wrangler.api.toml`, `wrangler.app.toml`, `wrangler.landing.toml`, and `wrangler.orchestrator.toml` in dependency order
- **AND** the orchestrator's preview server dispatches the public URL surface to the three downstream preview Workers via service binding.

#### Scenario: Production deploy runs

- **WHEN** `bun run deploy:cloudflare` runs
- **THEN** the command chains `wrangler deploy --config wrangler.api.toml` → `wrangler deploy --config wrangler.app.toml` → `wrangler deploy --config wrangler.landing.toml` → `wrangler deploy --config wrangler.orchestrator.toml`
- **AND** each step exits non-zero if its Wrangler deploy fails
- **AND** the orchestrator deploys last so its `APP`, `LANDING`, and `API` service bindings resolve to the now-live downstream Workers.