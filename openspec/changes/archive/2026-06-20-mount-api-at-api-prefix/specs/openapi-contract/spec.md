## MODIFIED Requirements

### Requirement: OpenAPI Document Is Served At A Stable URL

A stable URL SHALL serve the generated OpenAPI document so auditors, partner integrators, and downstream codegen can fetch the contract. The document SHALL be assembled by the `@unveiled/api` Hono app from `@hono/zod-openapi` and SHALL be byte-identical to `typespec/output/openapi.yaml` modulo server URL. After this change, `GET /api/openapi.json` is reached by sending the request to the Astro app Worker, which forwards it to the API Worker via the service binding.

#### Scenario: Document is served at /api/openapi.yaml

- **WHEN** a client issues `GET /api/openapi.yaml`
- **THEN** the response body is the committed `typespec/output/openapi.yaml`
- **AND** the response `Content-Type` is `application/yaml; charset=utf-8`
- **AND** the served document is byte-for-byte identical to the committed artifact
- **AND** the response is produced by the `@unveiled/api` Hono app (reached via the service binding in `wrangler.toml`, not via an Astro catch-all shim)

#### Scenario: Document is served at /api/openapi.json

- **WHEN** a client issues `GET /api/openapi.json` to the Astro app Worker
- **THEN** the Astro middleware short-circuits the request to `env.API.fetch(request)`
- **AND** the response body is the Hono-app-generated OpenAPI 3.1 document
- **AND** the response `Content-Type` is `application/json; charset=utf-8`
- **AND** no Astro endpoint handler runs for this request

#### Scenario: No Astro OpenAPI endpoint exists

- **WHEN** the repository is inspected after the change is applied
- **THEN** no Astro page or endpoint exists under `src/pages/api/openapi.*`
- **AND** `rg "openapi\\.(json|yaml)" src/pages/` returns no matches
