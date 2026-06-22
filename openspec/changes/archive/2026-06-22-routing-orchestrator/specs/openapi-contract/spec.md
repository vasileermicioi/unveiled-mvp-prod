## MODIFIED Requirements

### Requirement: OpenAPI Document Is Served At A Stable URL

A stable URL SHALL serve the generated OpenAPI document so auditors, partner integrators, and downstream codegen can fetch the contract. The document SHALL be assembled by the `@unveiled/api` Hono app from `@hono/zod-openapi` and SHALL be byte-identical to `typespec/output/openapi.yaml` modulo server URL. `GET /api/openapi.json` is reached by sending the request to the public hostname, where the orchestrator dispatches `/api/*` to the API Worker via the `API` service binding declared in `wrangler.orchestrator.toml`; the orchestrator does not transform the response. The `servers` block in `typespec/output/openapi.yaml` points at the orchestrator's public hostname.

#### Scenario: Document is served at /api/openapi.yaml

- **WHEN** a client issues `GET /api/openapi.yaml` to the public hostname
- **THEN** the orchestrator dispatches the request to `env.API.fetch(request)`
- **AND** the response body is the committed `typespec/output/openapi.yaml`
- **AND** the response `Content-Type` is `application/yaml; charset=utf-8`
- **AND** the served document is byte-for-byte identical to the committed artifact.

#### Scenario: Document is served at /api/openapi.json

- **WHEN** a client issues `GET /api/openapi.json` to the public hostname
- **THEN** the orchestrator dispatches the request to `env.API.fetch(request)` (the API Worker)
- **AND** the response body is the Hono-app-generated OpenAPI 3.1 document
- **AND** the response `Content-Type` is `application/json; charset=utf-8`
- **AND** no Astro endpoint handler runs for this request
- **AND** the orchestrator does not transform the response (no extra headers, no body re-encoding).

#### Scenario: No Astro OpenAPI endpoint exists

- **WHEN** the repository is inspected after the change is applied
- **THEN** no Astro page or endpoint exists under `packages/app/src/pages/api/openapi.*`
- **AND** `rg "openapi\\.(json|yaml)" packages/app/src/pages/` returns no matches.

#### Scenario: Servers block points at the orchestrator's hostname

- **WHEN** `typespec/output/openapi.yaml` is regenerated
- **THEN** its `servers` block declares the orchestrator's public hostname (e.g. `https://unveiled.app/api`) so downstream codegen and auditors target the canonical URL space.