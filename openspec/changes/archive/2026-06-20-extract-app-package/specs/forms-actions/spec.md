## MODIFIED Requirements

### Requirement: Astro Action Inputs Are Parsed By The Generated Zod Schema

Every Astro Action under `packages/app/src/actions/index.ts` SHALL declare its input schema by importing from `@unveiled/api` (which re-exports the generated module that the API Worker owns), and the runtime envelope SHALL remain Astro Action's `safe` / `data` / `error` shape.

#### Scenario: Action input is parsed by the generated schema

- **WHEN** an Astro Action is invoked
- **THEN** its input is parsed through the Zod schema exported by `@unveiled/api` for that action
- **AND** validation failures produce the same error envelope as the existing hand-written Zod schemas.

#### Scenario: Action result type is imported from the generated module

- **WHEN** a form or page consumes an Astro Action's result
- **THEN** the consumer's TypeScript types import from `@unveiled/api`
- **AND** the `safe` / `data` / `error` envelope is preserved.

#### Scenario: Hand-written Zod schemas in action-contracts are replaced

- **WHEN** an Astro Action is migrated to the generated module
- **THEN** its hand-written Zod schema in `packages/app/src/lib/action-contracts.ts` is removed
- **AND** `packages/app/src/actions/index.ts` imports the action's input schema and result type from `@unveiled/api`
- **AND** `packages/app/src/lib/action-contracts.ts` becomes a thin re-export shim or is removed entirely once every action is migrated.

### Requirement: Astro Actions Are The Mutation Surface From The Astro App

Astro Actions under `packages/app/src/actions/index.ts` SHALL remain the only mutation surface invoked from Astro SSR pages and islands, and SHALL preserve the `safe` / `data` / `error` envelope. The canonical HTTP shape of every Astro Action SHALL additionally be exposed by `@unveiled/api` under `packages/api/src/routes/actions/**` so non-Astro callers (cron jobs, webhooks, third-party SDKs) can hit the same validators without going through Astro. Requests to `/api/actions/*` are forwarded from the Astro app Worker to the API Worker via the Cloudflare service binding declared in `wrangler.app.toml` (`binding = "API"`).

#### Scenario: Action input is parsed by the generated schema

- **WHEN** an Astro Action is invoked
- **THEN** its input is parsed through the Zod schema exported by `@unveiled/api` for that action
- **AND** validation failures produce the same error envelope as the existing hand-written Zod schemas.

#### Scenario: Action result type is imported from the generated types

- **WHEN** a form or page consumes an Astro Action's result
- **THEN** the consumer's TypeScript types import from `@unveiled/api`
- **AND** the `safe` / `data` / `error` envelope is preserved.

#### Scenario: Non-Astro caller hits the action over HTTP

- **WHEN** a cron job or third-party SDK issues `POST /api/actions/<name>` with the action's input JSON to the Astro app Worker
- **THEN** the middleware short-circuit forwards the request to `env.API.fetch(request)`
- **AND** the Hono route under `packages/api/src/routes/actions/**` validates the input against the generated Zod schema
- **AND** invokes the action handler
- **AND** returns the action's typed result envelope.

#### Scenario: Action handler logic is unchanged

- **WHEN** the action handler moves from `src/actions/index.ts` to `packages/api/src/routes/actions/**` (in change 03) and the Astro side moves from `src/actions/index.ts` to `packages/app/src/actions/index.ts` (in this change)
- **THEN** the handler logic (validation, authorization, mutation, invalidation hints) is byte-equivalent to the prior Astro Action implementation
- **AND** only the HTTP binding changes (service-binding forwarding replaces the Astro catch-all shim).

### Requirement: Astro Actions Have A Canonical HTTP Shape In @unveiled/api

Every Astro Action under `packages/app/src/actions/index.ts` SHALL have a matching Hono route under `packages/api/src/routes/actions/**`. The Hono route SHALL accept the action's input, invoke the action handler, and return the action's typed result envelope. Requests to `/api/actions/*` are reached via the service binding declared in `wrangler.app.toml`.

#### Scenario: Action HTTP shape is registered in the OpenAPI document

- **WHEN** `bun --filter @unveiled/api run openapi:gen` is run
- **THEN** every action under `packages/api/src/routes/actions/**` is registered with `@hono/zod-openapi` and appears in `packages/api/openapi.generated.yaml`.

#### Scenario: Action HTTP shape diffs against TypeSpec

- **WHEN** `bun --filter @unveiled/api run openapi:check` is run
- **THEN** the registered action HTTP shapes match the AstroAction namespace declared in `typespec/main.tsp` modulo server URL.

#### Scenario: /api/actions/* is reached via the service binding

- **WHEN** a request arrives at `/api/actions/<name>` at the Astro app Worker
- **THEN** the middleware short-circuit forwards the request to `env.API.fetch(request)` before any Astro guard runs
- **AND** the action handler inside the API Worker returns the action's typed result envelope
- **AND** no Astro catch-all shim under `packages/app/src/pages/api/**` is involved.
