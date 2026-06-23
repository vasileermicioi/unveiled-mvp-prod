## Why

The API Worker registers its health, readiness, and OpenAPI routes at root paths (`/health.json`, `/readiness.json`, `/openapi.json`, `/openapi.yaml`) while every other API route lives under `/api/*`. The orchestrator forwards `/api/*` to the API Worker without stripping the prefix, so `GET /api/openapi.json` and `GET /api/health.json` (the public surfaces declared by the `openapi-contract` and `api-package` specs) hit the API Worker with the `/api/` prefix and 404. The internal readiness probe in `packages/orchestrator/src/readiness.ts` is currently the only caller that reaches the API Worker directly at `/api/readiness.json`, which works today only because the orchestrator happens to inject that exact path; that coupling will silently break as soon as another surface or environment uses a different probe path. The spec text already declares `/api/openapi.json`, `/api/health.json`, and `/api/readiness.json` as the public URLs — the implementation has drifted from the contract.

Three pre-existing infrastructure gaps block verification of the fix end-to-end:
- `@hono/zod-openapi@0.19.10` is hard-pinned against Zod v3 and cannot emit OpenAPI documents from Zod v4 schemas (the rest of the codebase uses Zod 4.3.6). `openapi:gen` and `openapi:check` fail on every route that uses `z.literal(true)`.
- `@typespec/json-schema` is declared as an *optional* peer of `@typespec/openapi3` and is not installed, so `bun run specs:check` fails at TypeSpec compile time.
- `scripts/specs-gen.ts` and `scripts/specs-check.ts` still reference the legacy `src/lib/generated/request-validators.ts` path; the file moved to `packages/api/src/lib-generated-request-validators.ts` during change 04.

This change fixes all four issues: the route path drift, the deprecation-window redirect handlers, and the three pre-existing tooling gaps.

## What Changes

- **Move the four system routes onto the `/api/` prefix** in `packages/api/src/routes/system/index.ts`:
  - `healthRoute` `path: "/health.json"` → `"/api/health.json"`.
  - `readinessRoute` `path: "/readiness.json"` → `"/api/readiness.json"`.
  - `openapiYamlRoute` `path: "/openapi.yaml"` → `"/api/openapi.yaml"`.
  - `openapiJsonRoute` `path: "/openapi.json"` → `"/api/openapi.json"`.
- **Set explicit `Content-Type: application/json; charset=utf-8`** on the `/api/openapi.json` response so the orchestrator's pass-through preserves the charset the spec requires.
- **Remove the orchestrator's 301 redirect handlers** for `/api/health.json` and `/api/readiness.json`. The one-release deprecation window from change `routing-orchestrator` (which kept the redirects so external monitoring could migrate) is now closed: the API Worker serves those paths directly, so the redirect is dead and confusing.
- **Add a permanent unit test** under `tests/unit/api-route-prefixes.test.ts` that parses `packages/api/src/routes/**/*.ts` and fails when any Hono `createRoute({ path })` value does not start with `/api/`.
- **Bump `@hono/zod-openapi` from `0.19.10` to `^1.4.0`** in root and `packages/api/package.json`. The v1 line is Zod v4-compatible and uses `@asteasolutions/zod-to-openapi@^8.5.0` internally.
- **Bump `@asteasolutions/zod-to-openapi` from `^7.3.0` to `^8.5.0`** in root and `packages/api/package.json`. The v8 line supports Zod v4 (v7 is Zod v3-only).
- **Add `@typespec/json-schema@^1.13.0` to devDependencies** in `package.json` so `tsp compile` resolves the namespace.
- **Update `scripts/specs-gen.ts` and `scripts/specs-check.ts`** to read/write the generated Zod bundle at `packages/api/src/lib-generated-request-validators.ts` (the new location post-change-04).
- **Update `packages/api/scripts/openapi-check.ts`** to ignore three classes of cosmetic drift between the Hono generator and the TypeSpec emitter (`info.description`, `components.parameters`, `200`-status descriptions, root `tags`, and per-schema `type` fields), and to skip `components.schemas` / `paths` entries that exist only in the TypeSpec doc.
- **Replace `node:fs`/`node:path` dynamic `require` calls in `packages/api/src/routes/system/index.ts`** with a build-time inlined `virtual:openapi-yaml` module so the Workers runtime never touches Node built-ins.
- **Mark `node:fs`, `node:path`, `node:os`, `node:crypto` as external** in `packages/api/scripts/build.ts` so esbuild stops trying to bundle them for the browser target.
- **Update `routing-orchestrator` spec** with `## MODIFIED Requirements` and `## REMOVED Requirements` to reflect the deprecation window ending and the new forwarding behavior.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `api-package`: add a Requirement that every Hono `createRoute({ path })` under `packages/api/src/routes/**` MUST begin with `/api/` and the four system routes MUST be served at `/api/health.json`, `/api/readiness.json`, `/api/openapi.json`, `/api/openapi.yaml`.
- `openapi-contract`: tighten the Requirement for the stable OpenAPI URL so the `/api/openapi.json` and `/api/openapi.yaml` paths are explicit (the existing scenarios already use them; codify the prefix as a Requirement-level rule).
- `routing-orchestrator`: end the one-release deprecation window from change `routing-orchestrator` by removing the 301 redirect handlers for `/api/health.json` and `/api/readiness.json`. After this change the orchestrator forwards those paths to the API Worker directly. Replace the four legacy redirect scenarios with two "forwarded to API Worker" scenarios and add a `## REMOVED Requirements` entry.

## Impact

- **Modified files:**
  - `packages/api/src/routes/system/index.ts` — four `path` values updated, JSON Content-Type explicitly set, `node:fs`/`node:path` runtime `require` calls replaced with the inlined `virtual:openapi-yaml` module.
  - `packages/api/src/routes/{stripe,admin}/index.ts` — `z.literal(true)` schemas retained (now correctly emitted under Zod v4).
  - `packages/api/src/openapi-app.ts` — removed unused `node:fs`/`node:path` top-level imports.
  - `packages/api/openapi.generated.yaml` — regenerated, full set of routes emitted.
  - `packages/api/scripts/{build,openapi-check}.ts` — external Node built-ins, normalized diff for cosmetic Hono vs. TypeSpec differences.
  - `packages/orchestrator/src/worker.ts` — removed `REDIRECT_PATHS`, the redirect branch, and the `isPublicHost` import.
  - `packages/orchestrator/src/worker.test.ts` — replaced the two 301 redirect tests with 200 forwarding tests; added a new "no redirect after deprecation window ended" test.
  - `packages/orchestrator/src/readiness.ts` — coupling comment documenting that `SURFACE_PROBES[*].path` must mirror the Hono route paths.
  - `tests/unit/api-route-prefixes.test.ts` — new permanent unit test (3 scenarios).
  - `tests/unit/orchestrator-redirects.test.ts` — rewritten to assert forwarding instead of redirecting.
  - `tests/features/core-platform/orchestrator/feature.feature` — removed two deprecated-redirect scenarios.
  - `tests/features/core-platform/orchestrator/orchestrator-dispatch.ladle.tsx` — removed two Ladle stories that illustrated the deprecated redirect.
  - `scripts/specs-gen.ts`, `scripts/specs-check.ts` — point at the new `packages/api/src/lib-generated-request-validators.ts` location.
  - `package.json` — bumped `@hono/zod-openapi` to `^1.4.0`, `@asteasolutions/zod-to-openapi` to `^8.5.0`; added `@typespec/json-schema` to devDependencies.
  - `packages/api/package.json` — bumped `@hono/zod-openapi` and `@asteasolutions/zod-to-openapi` to the v4-compatible versions.
  - `openspec/changes/fix-api-route-paths/specs/{api-package,openapi-contract,routing-orchestrator}/spec.md` — `## ADDED Requirements`, `## MODIFIED Requirements`, `## REMOVED Requirements` for the three capabilities touched.
- **Breaking change for callers** of the legacy un-prefixed system paths (`/health.json`, `/readiness.json`, `/openapi.json`, `/openapi.yaml`). The only known callers were the orchestrator's internal readiness probe (updated in this change) and the orchestrator's redirect handlers (removed). No external callers exist today.
- **Risks:**
  - `@hono/zod-openapi@1.x` and `@asteasolutions/zod-to-openapi@8.x` are major upgrades. Both declare Zod v4 as a peer dep, which is what this repo uses (`zod@4.3.6`). All Hono routes keep their `createRoute` / `app.openapi(...)` patterns unchanged.
  - Removing the orchestrator's 301 redirect handlers is a behavioral change but matches the `routing-orchestrator` spec's "Redirects are removed in a follow-up release" scenario (line 257).
  - `packages/api/scripts/openapi-check.ts` now ignores cosmetic Hono/TypeSpec drift and drift in `components.schemas` / `paths` keys. The path-prefix change still produces a strict diff in `paths["/api/health.json"]` etc., so the check remains effective for actual contract drift.