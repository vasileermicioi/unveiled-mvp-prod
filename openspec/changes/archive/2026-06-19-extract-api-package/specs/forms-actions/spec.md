## ADDED Requirements

### Requirement: Astro Actions Are The Mutation Surface From The Astro App

Astro Actions under `src/actions/index.ts` SHALL remain the only mutation surface invoked from Astro SSR pages and islands, and SHALL preserve the `safe` / `data` / `error` envelope. The canonical HTTP shape of every Astro Action SHALL additionally be exposed by `@unveiled/api` under `packages/api/src/routes/actions/**` so non-Astro callers (cron jobs, webhooks, third-party SDKs) can hit the same validators without going through Astro.

#### Scenario: Action input is parsed by the generated schema

- **WHEN** an Astro Action is invoked
- **THEN** its input is parsed through the Zod schema emitted by the TypeSpec build for that action
- **AND** validation failures produce the same error envelope as the existing hand-written Zod schemas

#### Scenario: Action result type is imported from the generated types

- **WHEN** a form or page consumes an Astro Action's result
- **THEN** the consumer's TypeScript types import from `src/lib/generated/openapi-types.ts`
- **AND** the `safe` / `data` / `error` envelope is preserved

#### Scenario: Non-Astro caller hits the action over HTTP

- **WHEN** a cron job or third-party SDK issues `POST /api/actions/<name>` with the action's input JSON
- **THEN** the Hono route under `packages/api/src/routes/actions/**` validates the input against the generated Zod schema
- **AND** invokes the action handler
- **AND** returns the action's typed result envelope

#### Scenario: Action handler logic is unchanged

- **WHEN** the action handler moves from `src/actions/index.ts` to `packages/api/src/routes/actions/**`
- **THEN** the handler logic (validation, authorization, mutation, invalidation hints) is byte-equivalent to the prior Astro Action implementation
- **AND** only the HTTP binding changes

### Requirement: Astro Actions Have A Canonical HTTP Shape In @unveiled/api

Every Astro Action under `src/actions/index.ts` SHALL have a matching Hono route under `packages/api/src/routes/actions/**`. The Hono route SHALL accept the action's input, invoke the action handler, and return the action's typed result envelope.

#### Scenario: Action HTTP shape is registered in the OpenAPI document

- **WHEN** `bun run openapi:gen` is run
- **THEN** every action under `packages/api/src/routes/actions/**` is registered with `@hono/zod-openapi` and appears in `packages/api/openapi.generated.yaml`

#### Scenario: Action HTTP shape diffs against TypeSpec

- **WHEN** `bun run openapi:check` is run
- **THEN** the registered action HTTP shapes match the AstroAction namespace declared in `typespec/main.tsp` modulo server URL