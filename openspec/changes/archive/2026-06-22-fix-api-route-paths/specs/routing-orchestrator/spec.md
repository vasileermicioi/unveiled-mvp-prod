## MODIFIED Requirements

### Requirement: Orchestrator Replaces Public Health JSON Endpoints

The orchestrator SHALL answer `/healthz` and `/readyz` directly. The previously public `GET /api/health.json` and `GET /api/readiness.json` endpoints are no longer served by the orchestrator: after the one-release deprecation window from change `routing-orchestrator` ended, the redirect handlers were removed. Requests for `/api/health.json` and `/api/readiness.json` on the public hostname SHALL be forwarded to the API Worker via the `API` service binding, which serves them at `/api/health.json` and `/api/readiness.json` (the public-facing URLs declared by `api-package` and `openapi-contract`).

#### Scenario: /api/health.json is forwarded to the API Worker

- **WHEN** a client issues `GET /api/health.json` to the orchestrator's public hostname
- **THEN** the orchestrator forwards the request to `env.API.fetch(request)`
- **AND** the API Worker returns `200` with its liveness payload (`{ ok: true, checkedAt: <ISO timestamp> }`)
- **AND** no redirect is returned (the redirect handler has been removed; the deprecation window from change `routing-orchestrator` is closed).

#### Scenario: /api/readiness.json is forwarded to the API Worker

- **WHEN** a client issues `GET /api/readiness.json` to the orchestrator's public hostname
- **THEN** the orchestrator forwards the request to `env.API.fetch(request)`
- **AND** the API Worker returns `200` with its readiness payload (the same shape returned during the deprecation window's service-binding path).

#### Scenario: API Worker internal endpoints remain reachable via service binding

- **WHEN** the orchestrator's readiness probe calls `env.API.fetch("/api/readiness.json")`
- **THEN** the API Worker returns its internal readiness response
- **AND** no orchestrator-side redirect logic is applied to the request.

## REMOVED Requirements

### Requirement: Legacy Redirect Handlers For /api/health.json And /api/readiness.json

**Reason:** The legacy 301 redirect handlers (`/api/health.json` → `/healthz`, `/api/readiness.json` → `/readyz`) existed only as a one-release deprecation window so external monitoring could migrate to the new public probes. After that window, the API Worker was updated (change `fix-api-route-paths`) to register its system routes with the `/api/` prefix, so `/api/health.json` and `/api/readiness.json` now resolve directly to the API Worker without a redirect.

**Migration:** Existing monitoring MUST target the canonical endpoints:
- Liveness: `GET /healthz` (orchestrator, plain text `ok`).
- Readiness: `GET /readyz` (orchestrator, aggregated envelope across `api`, `app`, `landing`).
- API Worker health/readiness: `GET /api/health.json` and `GET /api/readiness.json` (no redirect; served by the API Worker).