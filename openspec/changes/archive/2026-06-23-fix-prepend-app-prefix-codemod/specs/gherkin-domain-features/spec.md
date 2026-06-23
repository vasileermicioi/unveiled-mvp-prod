## ADDED Requirements

### Requirement: App-Route URL Prefix Codemod Gate

Every `.feature` file under `tests/features/**/*.feature` SHALL have its app-route URLs prefixed with `/app` so the gherkin parity suite hits the orchestrator's `/app/*` dispatch. The `scripts/codemod-prepend-app-prefix.ts` script SHALL walk the feature tree in `--apply` mode (rewrite un-prefixed app routes to `/app...`) and `--verify` mode (exit non-zero if any un-prefixed app route remains). The codemod SHALL distinguish true app routes from full URLs (`http://...`, `https://...`), content-type strings (e.g. `application/json; charset=utf-8`), and orchestrator-owned endpoints (`/healthz`, `/readyz`, `/api/...`, `/ladle/...`, `/favicon.ico`, `/favicon.svg`) so the gate does not produce false positives. The URL-detection regex SHALL use a negative lookbehind that rejects `/` preceded by a word character, `:`, or `/`, so the match only fires on path-shaped tokens that begin a fresh segment (after whitespace, start-of-line, or punctuation). The codemod SHALL also skip URL rewrites inside any scenario whose `Scenario:` title matches `/normalizes/i` or `/does not normalize/i`, so normalization-test scenarios that intentionally use bare paths as test inputs are preserved. The gate SHALL be wired into `bun run check` as `bun run scripts/codemod-prepend-app-prefix.ts --verify`.

#### Scenario: Bare app routes get prefixed in --apply mode

- **WHEN** a feature file contains `When the visitor opens /discover`
- **THEN** `bun run scripts/codemod-prepend-app-prefix.ts --apply` rewrites it to `When the visitor opens /app/discover`
- **AND** the rewrite is reported by the script's summary line.

#### Scenario: Localized app routes get prefixed in --apply mode

- **WHEN** a feature file contains `When the visitor opens /en/admin`
- **THEN** `bun run scripts/codemod-prepend-app-prefix.ts --apply` rewrites it to `When the visitor opens /app/en/admin`.

#### Scenario: App routes with query strings get prefixed in --apply mode

- **WHEN** a feature file contains `When the visitor opens /discover?tab=metrics`
- **THEN** `bun run scripts/codemod-prepend-app-prefix.ts --apply` rewrites it to `When the visitor opens /app/discover?tab=metrics`.

#### Scenario: Full URLs are not touched

- **WHEN** a feature file contains `Given the orchestrator is running on http://localhost:4320`
- **THEN** the line is left unchanged
- **AND** `--verify` does not flag it.

#### Scenario: Content-type strings are not touched

- **WHEN** a feature file contains `And the Content-Type is application/json; charset=utf-8`
- **THEN** the line is left unchanged
- **AND** `--verify` does not flag it.

#### Scenario: Orchestrator-owned endpoints are not touched

- **WHEN** a feature file contains `When the visitor opens /healthz` or `When the visitor opens /readyz`
- **THEN** the line is left unchanged
- **AND** `--verify` does not flag it.

#### Scenario: API-owned endpoints are not touched

- **WHEN** a feature file contains `When the visitor opens /api/openapi.json`
- **THEN** the line is left unchanged
- **AND** `--verify` does not flag it.

#### Scenario: Ladle and favicon endpoints are not touched

- **WHEN** a feature file contains a URL under `/ladle/`, `/favicon.ico`, or `/favicon.svg`
- **THEN** the line is left unchanged
- **AND** `--verify` does not flag it.

#### Scenario: Normalization-test scenarios are skipped

- **WHEN** a scenario's `Scenario:` title contains `normalizes` or `does not normalize` (e.g. `Scenario: GET /en/admin normalizes to /app/en/admin`)
- **THEN** the codemod skips URL rewrites for every `Given`/`When`/`Then`/`And`/`But` step inside that scenario
- **AND** the next `Scenario:` or `Background:` header resets the skip flag.

#### Scenario: --verify fails when an un-prefixed app route is left in a feature

- **WHEN** a feature file under `tests/features/**/*.feature` still contains an un-prefixed app-route URL after the `--apply` pass
- **THEN** `bun run scripts/codemod-prepend-app-prefix.ts --verify` exits non-zero
- **AND** the offending file path is printed to stderr
- **AND** `bun run check` fails.

#### Scenario: Gate is wired into bun run check

- **WHEN** `bun run check` runs
- **THEN** `bun run scripts/codemod-prepend-app-prefix.ts --verify` is part of the script chain
- **AND** the gate is enforced on every commit.

#### Scenario: Unit tests pin the regex, exclusion list, and per-scenario skip

- **WHEN** `bun test scripts/codemod-prepend-app-prefix.test.ts` runs
- **THEN** the suite asserts that bare app routes get prefixed
- **AND** the suite asserts that full URLs, content-type strings, and orchestrator-owned endpoints are left alone
- **AND** the suite asserts that normalization-test scenarios are skipped
- **AND** the suite pins the exclusion list (`/healthz`, `/readyz`, `/api/...`, `/ladle/...`, `/favicon.ico`, `/favicon.svg`).