## Why

The TypeSpec source under `typespec/` imports `@typespec/json-schema` in 9 `.tsp` files (including `typespec/main.tsp`, `typespec/common.tsp`, `typespec/auth.tsp`, `typespec/admin.tsp`, `typespec/member.tsp`, `typespec/partner.tsp`, `typespec/webhooks.tsp`, and `typespec/system.tsp`) to use JSON Schema-specific decorators, but the `@typespec/json-schema` package is missing from the root `package.json` `devDependencies`. As a result `bun run specs:check` and `bun run specs:gen` fail with 29 TypeSpec compilation errors (`import-not-found`), which means the TypeSpec drift gate (`specs:check`, wired into `bun run check`) is broken and CI cannot reliably verify the OpenAPI contract.

## What Changes

- Add `"@typespec/json-schema": "^1.13.0"` to the root `package.json` `devDependencies`, aligned with the major version of the other `@typespec/*` packages already pinned (`@typespec/compiler`, `@typespec/http`, `@typespec/http-server-js`, `@typespec/openapi3`).
- Run `bun install` to update `bun.lock` and install the package.
- Re-run `bun run specs:check` and assert zero TypeSpec compilation errors.
- Re-run `bun run specs:gen` and assert the OpenAPI document is generated successfully into the committed `typespec/output/` and `src/lib/generated/` artifacts.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `openapi-contract`: the `specs:check` and `specs:gen` scripts run without `import-not-found` errors. The TypeSpec source compiles cleanly and the OpenAPI document is generated and committed.

## Impact

- **New files:** _none._
- **Modified files:**
  - `package.json` — add `"@typespec/json-schema": "^1.13.0"` to `devDependencies`.
  - `bun.lock` — updated by `bun install`.
- **Removed files:** _none._
- **Dependencies changed:** add `@typespec/json-schema` ^1.13.0 as a root devDependency.
- **Risks:**
  - **Version mismatch.** The TypeSpec source might pin behavior to a specific minor of `@typespec/json-schema`. Mitigation: pin to `^1.13.0` (same major as the other `@typespec/*` packages) and run `bun install` to resolve the transitive version. If the version doesn't match, `specs:check` will surface a peer-dependency warning but still compile.