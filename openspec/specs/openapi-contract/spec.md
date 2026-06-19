# openapi-contract Specification

## Purpose
TBD - created by archiving change typespec-openapi-contract. Update Purpose after archive.
## Requirements
### Requirement: TypeSpec Project Is The Contract Source Of Truth

A `typespec/` project SHALL exist at the repository root and SHALL contain the canonical contract for every HTTP route under `src/pages/api/` and a virtual `AstroActions` namespace covering every Astro Action under `src/actions/index.ts`.

#### Scenario: TypeSpec source is the only authoritative contract

- **WHEN** a developer adds, removes, or changes a route or action
- **THEN** the change is authored in `typespec/**` as the source of truth
- **AND** the generated artifacts under `typespec/output/**` and `src/lib/generated/**` are produced by running `bun run specs:gen`

#### Scenario: Astro Actions are modeled but not exposed externally

- **WHEN** an Astro Action is added under `src/actions/index.ts`
- **THEN** the action is represented in TypeSpec under the `AstroActions` virtual namespace
- **AND** the namespace is marked `@visibility("internal")` so the OpenAPI emitter omits it from the public document

### Requirement: Emitter Output Is Committed And Reviewable

The TypeSpec emitter output SHALL be committed to the repository so PR reviewers can diff contract changes without running the emitter. The single canonical artifact under `typespec/output/` SHALL be the OpenAPI document; the per-model JSON Schemas are inlined inside it and are NOT emitted as separate files.

#### Scenario: Generated OpenAPI document is committed

- **WHEN** `bun run specs:gen` is run
- **THEN** the `@typespec/openapi3` emitter writes `typespec/output/openapi.yaml`
- **AND** the file is checked into the repository
- **AND** the inlined `components.schemas` describe every TypeSpec model in the contract

#### Scenario: No intermediate per-model JSON Schema files

- **WHEN** `bun run specs:gen` is run
- **THEN** no files are written under `typespec/output/json-schema/`
- **AND** `typespec/output/json-schema/` does not exist on disk

#### Scenario: Generated request validators are committed

- **WHEN** `bun run specs:gen` is run
- **THEN** the post-processor parses `typespec/output/openapi.yaml` and emits Zod request validators to `src/lib/generated/request-validators.ts`
- **AND** the file is checked into the repository
- **AND** every entry in `request-validators.ts` corresponds to a `*Schema` named after the TypeSpec model (namespace prefix stripped)

### Requirement: Contract Drift Is Detected In CI

A `specs:check` script SHALL detect drift between the TypeSpec source and the committed emitter output, and SHALL be wired into `bun run check`. A companion `openapi:check` script SHALL detect drift between the TypeSpec source and the Hono-app-generated OpenAPI document under `packages/api/openapi.generated.yaml`, and SHALL also be wired into `bun run check`.

#### Scenario: Drift is caught locally

- **WHEN** a developer modifies a TypeSpec file under `typespec/**` without regenerating
- **THEN** `bun run check` exits non-zero
- **AND** the failure message points at the drifted file (`openapi.yaml`, `request-validators.ts`, or `packages/api/openapi.generated.yaml`)

#### Scenario: Drift is caught in CI

- **WHEN** a PR modifies a TypeSpec file under `typespec/**` without regenerating
- **THEN** the CI `check` job fails
- **AND** the PR cannot be merged until the generated artifacts are updated and re-committed

#### Scenario: Hono OpenAPI drifts from TypeSpec

- **WHEN** the Hono app's registered routes diverge from the TypeSpec contract
- **THEN** `bun run openapi:check` exits non-zero
- **AND** `bun run check` fails

### Requirement: OpenAPI Document Is Served At A Stable URL

A stable URL SHALL serve the generated OpenAPI document so auditors, partner integrators, and downstream codegen can fetch the contract. The document SHALL be assembled by the `@unveiled/api` Hono app from `@hono/zod-openapi` and SHALL be byte-identical to `typespec/output/openapi.yaml` modulo server URL.

#### Scenario: Document is served at /api/openapi.yaml

- **WHEN** a client issues `GET /api/openapi.yaml`
- **THEN** the response body is the committed `typespec/output/openapi.yaml`
- **AND** the response `Content-Type` is `application/yaml; charset=utf-8`
- **AND** the served document is byte-for-byte identical to the committed artifact
- **AND** the response is produced by the `@unveiled/api` Hono app (reached via the catch-all shim during the transition window)

#### Scenario: Document is served at /api/openapi.json

- **WHEN** a client issues `GET /api/openapi.json`
- **THEN** the response body is the Hono-app-generated OpenAPI 3.1 document
- **AND** the response `Content-Type` is `application/json; charset=utf-8`

### Requirement: HTTP Route Schemas Are Authoritative

Every HTTP route under `src/pages/api/**` SHALL be represented in the OpenAPI document, and the request validator exported by `src/lib/generated/request-validators.ts` SHALL be the parser used at the route boundary.

#### Scenario: Every route uses the generated validator

- **WHEN** a request arrives at any route under `src/pages/api/**`
- **THEN** the route parses the request body, query, or headers through a schema imported from `src/lib/generated/request-validators.ts`
- **AND** ad-hoc Zod schemas are not introduced for new routes (existing hand-written schemas are migrated iteratively)

#### Scenario: Response body matches the OpenAPI document

- **WHEN** a route returns a JSON response
- **THEN** the response body conforms to the `Response` model declared for that operation in TypeSpec
- **AND** any contract test that diffs the response body against the schema passes

### Requirement: Astro Action Inputs Are Validated Against The Generated Schema

Every Astro Action under `src/actions/index.ts` SHALL declare its input schema by importing from `src/lib/generated/actions`, and the runtime envelope SHALL remain Astro Action's `safe` / `data` / `error` shape.

#### Scenario: Action input is parsed by the generated schema

- **WHEN** an Astro Action is invoked
- **THEN** its input is parsed through the Zod schema emitted by the TypeSpec build for that action
- **AND** validation failures produce the same error envelope as the existing hand-written Zod schemas

#### Scenario: Action result type is imported from the generated types

- **WHEN** a form or page consumes an Astro Action's result
- **THEN** the consumer's TypeScript types import from `src/lib/generated/openapi-types.ts`
- **AND** the `safe` / `data` / `error` envelope is preserved

### Requirement: Stripe Webhook Validates Payload Against Generated Schema

The Stripe webhook handler SHALL verify the `Stripe-Signature` header against the configured webhook secret and SHALL validate the parsed payload against the generated Zod schema before mutating any subscription, credit, or ledger state.

#### Scenario: Signature is verified before schema validation

- **WHEN** Stripe sends a webhook to `/api/stripe/webhook`
- **THEN** the handler verifies the `Stripe-Signature` header against the configured Stripe webhook secret first
- **AND** rejects the request without mutating state on signature failure

#### Scenario: Valid signature is validated against the generated schema

- **WHEN** a webhook request passes signature verification
- **THEN** the parsed payload is validated against the Zod schema emitted for `WebhookService.stripe`
- **AND** the handler processes the event only if the schema matches
- **AND** schema failures are rejected without mutating state

### Requirement: Contract Output Is Excluded From Lint

The TypeSpec emitter output and the generated validators and types SHALL be excluded from the Biome linter so emitter runs do not introduce style-only diffs.

#### Scenario: Linter ignores generated files

- **WHEN** `bun run lint` (or `biome check`) is run
- **THEN** files under `typespec/output/**` and `src/lib/generated/**` are skipped
- **AND** a regenerated contract does not produce a noisy style diff

### Requirement: Domain Models Cover Every Wire-Facing Entity

The TypeSpec project SHALL define a model for every domain entity exposed over the wire.

#### Scenario: Wire-facing models are defined

- **WHEN** the TypeSpec project is compiled
- **THEN** the model set includes `User`, `Profile`, `Partner`, `Event`, `Booking`, `WaitlistEntry`, `CreditLedgerEntry`, `SavedEvent`, `Subscription`, `PaymentMethod`, `BillingAddress`, `JobSendLog`, and `ProviderEvent`
- **AND** the model set includes the cross-cutting enums for `Role`, `Locale`, ticket types, and booking/subscription statuses

#### Scenario: Service interfaces cover every HTTP route

- **WHEN** the TypeSpec project is compiled
- **THEN** the service interfaces include `AuthService`, `AccountService`, `DataAccessService`, `AdminService`, `WebhookService`, `SystemService`, and one `SurfaceService` template per export of `src/lib/data-access/loaders.ts`
- **AND** every route under `src/pages/api/**` has a corresponding operation in the OpenAPI document

### Requirement: Hono App OpenAPI Document Is Generated From Registered Routes

The Hono app under `packages/api/src/worker.ts` SHALL register every route with `@hono/zod-openapi` request/response pairs, and `packages/api/src/openapi.ts` SHALL assemble the resulting OpenAPI 3.1 document via `app.openAPIGenerator`. The document SHALL be written to `packages/api/openapi.generated.yaml`.

#### Scenario: Document is generated by the Hono app

- **WHEN** `bun run openapi:gen` is run from `packages/api`
- **THEN** `packages/api/openapi.generated.yaml` is written and contains every route registered in the Hono app

#### Scenario: Document matches TypeSpec modulo server URL

- **WHEN** `bun run openapi:check` is run
- **THEN** the Hono-app-generated document is diffed against `typespec/output/openapi.yaml` (modulo `servers`, `info.version`, and timestamps)
- **AND** a non-empty diff exits non-zero

