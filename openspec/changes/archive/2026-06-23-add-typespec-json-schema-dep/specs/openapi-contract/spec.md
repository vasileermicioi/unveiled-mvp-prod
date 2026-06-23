## MODIFIED Requirements

### Requirement: Contract Drift Is Detected In CI

A `specs:check` script SHALL detect drift between the TypeSpec source and the committed emitter output, and SHALL be wired into the umbrella `bun run check` via `bun --filter @unveiled/api run specs:check`. A companion `openapi:check` script SHALL detect drift between the TypeSpec source and the Hono-app-generated OpenAPI document under `packages/api/openapi.generated.yaml`, and SHALL also be wired into `bun run check`. The TypeSpec source SHALL compile with zero `import-not-found` errors, and every library imported by a `.tsp` file under `typespec/**` SHALL be declared in the root `package.json` `devDependencies` so the dependency manifest is the single source of truth for emitter-resolvable libraries.

#### Scenario: Drift is caught locally

- **WHEN** a developer modifies a TypeSpec file under `typespec/**` without regenerating
- **THEN** `bun run check` exits non-zero
- **AND** the failure message points at the drifted file (`openapi.yaml`, the re-exported validators module, or `packages/api/openapi.generated.yaml`).

#### Scenario: Drift is caught in CI

- **WHEN** a PR modifies a TypeSpec file under `typespec/**` without regenerating
- **THEN** the CI `check` job fails
- **AND** the PR cannot be merged until the generated artifacts are updated and re-committed.

#### Scenario: Hono OpenAPI drifts from TypeSpec

- **WHEN** the Hono app's registered routes diverge from the TypeSpec contract
- **THEN** `bun --filter @unveiled/api run openapi:check` exits non-zero
- **AND** `bun run check` fails.

#### Scenario: TypeSpec source compiles without missing-dependency errors

- **WHEN** `bun --filter @unveiled/api run specs:check` (or `bun run specs:check`) is executed
- **THEN** the TypeSpec compiler (`tsp compile`) reports zero `import-not-found` errors
- **AND** every `@typespec/*` library imported by any `.tsp` file under `typespec/**` is declared in the root `package.json` `devDependencies`
- **AND** `bun run specs:gen` produces the committed `typespec/output/openapi.yaml` and the re-exported validators module without compilation failure.