# routing-orchestrator Specification

## Purpose
TBD - created by archiving change routing-orchestrator. Update Purpose after archive.
## Requirements
### Requirement: Orchestrator Worker Dispatches The Public URL Surface

A Cloudflare Worker SHALL be the single entry point for the public URL surface. The Worker SHALL inspect `url.pathname` and dispatch each request to the matching downstream service binding:

- `/api/*` → `env.API.fetch(request)`
- `/app/*` → `env.APP.fetch(request)`
- everything else (including `/`, `/ladle/*`, `/favicon.ico`, and any other top-level static asset) → `env.LANDING.fetch(request)`
- `/healthz` → orchestrator-owned liveness response (`200` with body `"ok"`)
- `/readyz` → orchestrator-owned readiness response (see `Readiness Probe Composes Downstream Health` requirement)

The Worker SHALL live at `packages/orchestrator/src/worker.ts` and SHALL be the `main` entry of `wrangler.orchestrator.toml`.

#### Scenario: /api/* is forwarded to the API Worker

- **WHEN** a request arrives at any path under `/api/*`
- **THEN** the orchestrator returns `env.API.fetch(request)` without buffering the body
- **AND** no Astro, Hono, or other downstream middleware runs before the binding call.

#### Scenario: /app/* is forwarded to the app Worker

- **WHEN** a request arrives at any path under `/app/*`
- **THEN** the orchestrator returns `env.APP.fetch(request)` without buffering the body.

#### Scenario: Everything else is forwarded to the landing Worker

- **WHEN** a request arrives at `/`, `/ladle/*`, `/favicon.ico`, or any other path not under `/api/` or `/app/`
- **THEN** the orchestrator returns `env.LANDING.fetch(request)` without buffering the body.

#### Scenario: /healthz returns 200 "ok"

- **WHEN** a request arrives at `/healthz`
- **THEN** the orchestrator returns a `200` response with body `"ok"` and `Content-Type: text/plain; charset=utf-8`
- **AND** no downstream Worker is invoked.

#### Scenario: /readyz dispatches to the readiness probe

- **WHEN** a request arrives at `/readyz`
- **THEN** the orchestrator invokes the readiness probe (see `Readiness Probe Composes Downstream Health`)
- **AND** returns either `200` (all downstream Workers green) or `503` (any downstream Worker red) with a safe JSON envelope.

#### Scenario: Service binding latency is not amplified by the orchestrator

- **WHEN** the orchestrator forwards a request to a downstream Worker via service binding
- **THEN** it returns the upstream `Response` object directly without buffering the body
- **AND** `ReadableStream` bodies (Stripe webhook raw body, future SSE endpoints) stream end-to-end through the binding.

#### Scenario: Bare /app and /app/ are redirected to /app/<lang>/

- **WHEN** a request arrives at the bare paths `/app` or `/app/` (no language segment)
- **THEN** the orchestrator returns `302` with `Location: /app/<lang>/` where `<lang>` is resolved from (in order) the `unveiled_lang` cookie, the `Accept-Language` request header (matching `de`), or the default `en`
- **AND** the original query string is preserved on the `Location` header (e.g. `/app?venuePartner=abc&venueToken=xyz` → `/app/en/?venuePartner=abc&venueToken=xyz`)
- **AND** paths already under `/app/<lang>/...` are forwarded to the app Worker unchanged (no redirect loop).

### Requirement: Orchestrator Declares Service Bindings And A Static Asset Binding

`wrangler.orchestrator.toml` SHALL declare the three downstream service bindings and the top-level static asset binding. No other `wrangler.*.toml` SHALL declare `assets = ...` for the top-level hostname (the orchestrator owns it).

#### Scenario: wrangler.orchestrator.toml declares the three service bindings

- **WHEN** `wrangler.orchestrator.toml` is read
- **THEN** it declares:
  - `[[services]] binding = "APP" service = "unveiled-app" entrypoint = "fetch"`
  - `[[services]] binding = "LANDING" service = "unveiled-landing" entrypoint = "fetch"`
  - `[[services]] binding = "API" service = "unveiled-api" entrypoint = "fetch"`
- **AND** `name = "unveiled"` and `main = "packages/orchestrator/dist/worker.js"`.

#### Scenario: wrangler.orchestrator.toml declares the top-level assets binding

- **WHEN** `wrangler.orchestrator.toml` is read
- **THEN** it declares `assets = { binding = "ASSETS", directory = "./dist/client" }` (the orchestrator's own static build directory; the Ladle build is copied here by `bun run ladle:build`).

#### Scenario: wrangler.app.toml drops the top-level assets binding

- **WHEN** `wrangler.app.toml` is read
- **THEN** it does NOT contain an `assets = ...` block at the top level
- **AND** the per-page static folder under `/app/*` remains handled by the Astro build's per-page static folder (no top-level static asset binding is needed).

#### Scenario: wrangler.landing.toml drops the top-level assets binding

- **WHEN** `wrangler.landing.toml` is read
- **THEN** it does NOT contain an `assets = ...` block at the top level
- **AND** the landing's own static asset bundle is served via the orchestrator's `LANDING` service binding.

#### Scenario: wrangler.api.toml is unchanged

- **WHEN** `wrangler.api.toml` is read
- **THEN** it declares the same content as before this change (no new bindings, no dropped bindings)
- **AND** the API Worker continues to expose `/api/health.json` and `/api/readiness.json` for internal health checks (reachable only via service binding from the orchestrator's readiness probe).

### Requirement: Readiness Probe Composes Downstream Health

The orchestrator's `/readyz` endpoint SHALL return `200` only when every downstream Worker's health check is green; otherwise it SHALL return `503` with a safe JSON envelope listing the failing surfaces.

#### Scenario: All downstream Workers are green

- **WHEN** `/readyz` is invoked and `env.API.fetch("/api/health.json")`, `env.APP.fetch("/app/_health")`, and `env.LANDING.fetch("/_health")` all return `200`
- **THEN** the orchestrator returns `200` with body `{"status":"ok","surfaces":{"api":"ok","app":"ok","landing":"ok"}}`.

#### Scenario: One downstream Worker is red

- **WHEN** `/readyz` is invoked and one of the three health probes returns non-`200`
- **THEN** the orchestrator returns `503` with body `{"status":"degraded","surfaces":{...}}` listing the failing surface and a short reason (no secret values).

#### Scenario: Health probes use a short timeout

- **WHEN** `/readyz` is invoked
- **THEN** each downstream health probe is wrapped in a 1-second timeout (so a stuck downstream Worker does not block the readiness check).

#### Scenario: Readiness probe is reachable from Cloudflare load balancers

- **WHEN** a Cloudflare load balancer or operator issues `GET /readyz`
- **THEN** the response status is `200` only when the deployment is ready to serve traffic
- **AND** the response body never contains secret values, credentials, or provider authorization headers.

### Requirement: Orchestrator Applies Uniform Security Headers

The orchestrator SHALL apply a uniform security header policy to every non-API response: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Frame-Options: DENY`.

#### Scenario: CSP allows the surfaces' required origins

- **WHEN** the orchestrator composes the CSP header
- **THEN** the policy allows `'self'`, the Stripe endpoints required by the JS SDK (`*.stripe.com`, `r.stripe.com`, `m.stripe.network`), and Resend mailto links
- **AND** `frame-ancestors 'none'` is set so the orchestrator's hostname cannot be framed.

#### Scenario: HSTS is sent on every response

- **WHEN** any request reaches the orchestrator (including health probes, static assets, and forwarded responses)
- **THEN** the response includes `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.

#### Scenario: X-Content-Type-Options is set

- **WHEN** any non-API response is returned
- **THEN** the response includes `X-Content-Type-Options: nosniff`.

#### Scenario: Security headers are applied to forwarded responses too

- **WHEN** the orchestrator forwards a request to a downstream Worker via service binding
- **THEN** the orchestrator sets the security headers on the response returned to the caller (overwriting any headers the downstream Worker set, so the policy is uniform across surfaces).

#### Scenario: API responses are exempt from the orchestrator's CSP

- **WHEN** the orchestrator forwards a request to the API Worker
- **THEN** the API Worker's response is returned as-is (no CSP header is set by the orchestrator), because `/api/*` returns JSON and is not a renderable document.

### Requirement: Structured JSON Request Logging With Request Correlation

The orchestrator SHALL emit one structured JSON log line per inbound request, stamped with a `requestId` correlation id. The `requestId` SHALL be forwarded to every downstream Worker via an `x-request-id` request header so downstream logs can be correlated.

#### Scenario: Every inbound request emits one log line

- **WHEN** any request reaches the orchestrator
- **THEN** the orchestrator emits exactly one log line whose body is a single line of valid JSON
- **AND** the line includes `timestamp` (ISO 8601 UTC), `level`, `message`, `service: "unveiled-orchestrator"`, `env`, `requestId`, `method`, `path`, `status`, and `durationMs`.

#### Scenario: Request id is forwarded to downstream Workers

- **WHEN** the orchestrator forwards a request to a downstream Worker
- **THEN** the inbound request (or a generated one if missing) carries an `x-request-id` header
- **AND** the downstream Worker's logger adds the inherited `requestId` to its `context` object.

#### Scenario: Sensitive headers are redacted

- **WHEN** the log line would contain the `Cookie`, `Authorization`, or `Stripe-Signature` header
- **THEN** the value is replaced with `"[REDACTED]"` before the line is emitted.

#### Scenario: Logs are emitted on stdout (Workers Tail)

- **WHEN** the orchestrator runs on Cloudflare Workers
- **THEN** every log line is emitted via `console.log(JSON.stringify(...))` so it appears in the Workers Tail stream.

### Requirement: Local Dev Boots All Workers Behind A Single Proxy

The root `bun run dev` command SHALL boot the API Worker, the app Astro Worker, the landing Astro Worker, and the orchestrator dev proxy behind a single local port (4320). The dev proxy SHALL forward:

- `/api/*` → `http://localhost:8787` (Wrangler dev for the API Worker)
- `/app/*` → `http://localhost:4321` (Astro dev for `@unveiled/app`)
- `/`, `/ladle/*`, `/favicon.ico`, and any other top-level path → `http://localhost:4322` (Astro dev for `@unveiled/landing`)

The orchestrator's `dev` script SHALL NOT start until the three downstream dev servers are listening on their declared ports.

#### Scenario: bun run dev boots all four Workers

- **WHEN** a contributor runs `bun run dev` at the repo root
- **THEN** the command fans out to `bun --filter @unveiled/api run dev`, `bun --filter @unveiled/app run dev`, `bun --filter @unveiled/landing run dev`, and `bun --filter @unveiled/orchestrator run dev`
- **AND** the orchestrator's `dev` script uses `wait-on` to gate its start on the three downstream dev servers' ports.

#### Scenario: Single port serves the entire URL surface

- **WHEN** a contributor opens `http://localhost:4320/` after `bun run dev`
- **THEN** they see the landing hero (forwarded from `http://localhost:4322/`)
- **AND** `http://localhost:4320/app/<lang>/discover` resolves to the app's discover page (forwarded from `http://localhost:4321/app/<lang>/discover`)
- **AND** `http://localhost:4320/api/openapi.json` resolves to the API Worker's Hono OpenAPI document (forwarded from `http://localhost:8787/api/openapi.json`).

#### Scenario: Security headers are applied in dev too

- **WHEN** any request reaches the orchestrator's dev proxy
- **THEN** the same security header policy (CSP, HSTS, X-Content-Type-Options) is applied as in production (so dev parity holds).

### Requirement: Deploy Chains Workers In Dependency Order

`bun run preview:cloudflare` and `bun run deploy:cloudflare` SHALL chain four Wrangler deploys in dependency order: `api` → `app` → `landing` → `orchestrator`. The orchestrator deploys last because its service bindings require the downstream Workers to be live.

#### Scenario: API Worker deploys first

- **WHEN** `bun run deploy:cloudflare` runs
- **THEN** the first step is `wrangler deploy --config wrangler.api.toml`
- **AND** the step exits non-zero if the API Worker build or deploy fails.

#### Scenario: App Worker deploys second

- **WHEN** `bun run deploy:cloudflare` runs
- **THEN** the second step is `wrangler deploy --config wrangler.app.toml`
- **AND** the step depends on the API Worker being live (the app's `/api/*` short-circuit runs in production behind the orchestrator).

#### Scenario: Landing Worker deploys third

- **WHEN** `bun run deploy:cloudflare` runs
- **THEN** the third step is `wrangler deploy --config wrangler.landing.toml`.

#### Scenario: Orchestrator deploys last

- **WHEN** `bun run deploy:cloudflare` runs
- **THEN** the final step is `wrangler deploy --config wrangler.orchestrator.toml`
- **AND** the step fails fast if any of the three downstream Workers' deploys did not succeed.

#### Scenario: bun run preview:cloudflare mirrors the same chain

- **WHEN** `bun run preview:cloudflare` runs
- **THEN** the four steps run in the same order with `wrangler dev --remote` semantics (so the preview environment exercises real service bindings).

### Requirement: Orchestrator Replaces Public Health JSON Endpoints

The orchestrator SHALL answer `/healthz` and `/readyz` directly. The previously public `GET /api/health.json` and `GET /api/readiness.json` endpoints SHALL return `301` redirects to `/healthz` and `/readyz` for one release so existing monitoring can be migrated.

#### Scenario: /api/health.json redirects to /healthz

- **WHEN** a client issues `GET /api/health.json`
- **THEN** the orchestrator returns `301` with `Location: /healthz`
- **AND** the redirect is served by the orchestrator (the API Worker's internal `/api/health.json` is no longer the public-facing endpoint).

#### Scenario: /api/readiness.json redirects to /readyz

- **WHEN** a client issues `GET /api/readiness.json`
- **THEN** the orchestrator returns `301` with `Location: /readyz`.

#### Scenario: API Worker internal endpoints remain reachable via service binding

- **WHEN** the orchestrator's readiness probe calls `env.API.fetch("/api/health.json")`
- **THEN** the API Worker returns its internal health response (no redirect)
- **AND** the redirect logic only applies to requests whose `Host` header is the public hostname (the orchestrator's), not to internal service-binding calls.

#### Scenario: Redirects are removed in a follow-up release

- **WHEN** one release has passed since this change landed
- **THEN** the orchestrator drops the `/api/health.json` and `/api/readiness.json` redirect handlers
- **AND** requests for those paths return `404` from the orchestrator (no downstream Worker is invoked).

### Requirement: LikeC4 Model Captures The Orchestrator Topology

The LikeC4 model under `architecture/` SHALL model the orchestrator as the entry container with three downstream service bindings (`APP`, `LANDING`, `API`) and a top-level static asset binding (`ASSETS`).

#### Scenario: Orchestrator container is modeled

- **WHEN** the LikeC4 model is read
- **THEN** it contains a `container '@unveiled/orchestrator Worker'` with `metadata.path = 'packages/orchestrator'`
- **AND** it declares relationships `orchestrator -> appWorker 'forwards /app/* via service binding'`, `orchestrator -> landingWorker 'forwards /* via service binding'`, and `orchestrator -> apiWorker 'forwards /api/* via service binding'`.

#### Scenario: Architecture drift check passes

- **WHEN** `bun run arch:check` runs
- **THEN** `likec4 validate` reports Valid
- **AND** `arch:drift` reports OK (every `metadata.path` value in the model exists on disk).

### Requirement: Gherkin Coverage For The Public URL Surface

A gherkin feature folder at `tests/features/core-platform/orchestrator/` SHALL exercise the public URL surface end-to-end (`/`, `/app/<lang>/discover`, `/api/openapi.json`, `/healthz`, `/readyz`).

#### Scenario: Gherkin scenario covers the landing dispatch

- **WHEN** a contributor reads `tests/features/core-platform/orchestrator/feature.feature`
- **THEN** at least one scenario asserts that `GET /` returns the landing hero (forwarded through the orchestrator to the landing Worker).

#### Scenario: Gherkin scenario covers the app dispatch

- **WHEN** a contributor reads `tests/features/core-platform/orchestrator/feature.feature`
- **THEN** at least one scenario asserts that `GET /app/<lang>/discover` returns the app's discover page (forwarded through the orchestrator to the app Worker).

#### Scenario: Gherkin scenario covers the API dispatch

- **WHEN** a contributor reads `tests/features/core-platform/orchestrator/feature.feature`
- **THEN** at least one scenario asserts that `GET /api/openapi.json` returns the API Worker's Hono OpenAPI document (forwarded through the orchestrator to the API Worker).

#### Scenario: Gherkin scenario covers /healthz

- **WHEN** a contributor reads `tests/features/core-platform/orchestrator/feature.feature`
- **THEN** at least one scenario asserts that `GET /healthz` returns `200` with body `ok`.

#### Scenario: Gherkin scenario covers /readyz

- **WHEN** a contributor reads `tests/features/core-platform/orchestrator/feature.feature`
- **THEN** at least one scenario asserts that `GET /readyz` returns `200` when all downstream Workers are green
- **AND** at least one scenario asserts that `GET /readyz` returns `503` when any downstream Worker is red.

#### Scenario: Ladle harness is coverage-locked

- **WHEN** `bun run ladle:coverage` is run
- **THEN** it references the `dispatch` story in `tests/features/core-platform/orchestrator/dispatch.ladle.tsx` via a `@ladle(component=OrchestratorDispatch, story=…)` tag
- **AND** the coverage script exits with code zero.

