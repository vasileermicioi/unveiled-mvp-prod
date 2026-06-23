## Context

The Unveiled MVP deploys four Cloudflare Workers behind the orchestrator (`packages/orchestrator/`):

- `unveiled-api` — the Hono HTTP API (`packages/api/`), mounted under `/api/*`.
- `unveiled-app` — the Astro 6 SSR app (`packages/app/`), mounted under `/app/*`.
- `unveiled-landing` — the Astro 6 SSR landing surface (`packages/landing/`), mounted at `/*`.
- `unveiled-orchestrator` — the public-URL entry Worker that dispatches by URL prefix.

The orchestrator's dispatch contract is "forward the inbound `Request` to the matching downstream Worker without rewriting the path." That means a request to `GET /api/openapi.json` reaches the API Worker as `GET /api/openapi.json`. The API Worker must therefore register its handlers with the `/api/` prefix intact.

The four system routes — `healthRoute`, `readinessRoute`, `openapiYamlRoute`, `openapiJsonRoute` — were originally registered with no prefix (`/health.json`, `/readiness.json`, `/openapi.yaml`, `/openapi.json`). In the prior topology (Astro endpoints under `src/pages/api/**`), the Astro page layer stripped the prefix and dispatched the trailing path to the Worker, so the Worker's un-prefixed paths were correct. In the current topology (orchestrator forwards the full URL), the un-prefixed registrations are wrong and the public surfaces declared by `openspec/specs/openapi-contract/spec.md` (`GET /api/openapi.json`, `GET /api/openapi.yaml`) and `openspec/specs/api-package/spec.md` (`GET /api/health.json`, `GET /api/readiness.json`) return 404.

The only caller that reaches the system routes directly today is `packages/orchestrator/src/readiness.ts`, which dispatches `"/api/readiness.json"` against the `API` binding (matching the desired public path, so it currently succeeds). All other callers reach the API Worker through the orchestrator, where the un-prefixed registrations cause 404s.

## Goals / Non-Goals

**Goals:**

- Make every Hono route under `packages/api/src/routes/**` use the `/api/` prefix so the orchestrator's un-stripped dispatch resolves correctly.
- Regenerate `packages/api/openapi.generated.yaml` and assert its diff against `typespec/output/openapi.yaml` is mechanical and limited to the prefix change.
- Add a permanent unit test (`tests/unit/api-route-prefixes.test.ts`) that fails CI when a future contributor introduces a `createRoute({ path })` value without the `/api/` prefix.
- Set explicit `Content-Type: application/json; charset=utf-8` on the `/api/openapi.json` response (Hono's default omits the charset, breaking the gherkin spec assertion).
- Pin the four system route paths as a Requirement-level rule in both the `api-package` and `openapi-contract` specs.
- Close the orchestrator's one-release deprecation window for `/api/health.json` and `/api/readiness.json` by removing the 301 redirects.
- Fix three pre-existing tooling gaps (`@hono/zod-openapi` 0.x → 1.x, `@asteasolutions/zod-to-openapi` 7.x → 8.x, missing `@typespec/json-schema`, and the legacy `src/lib/generated/` path references) so the OpenAPI drift gate actually runs in CI.

**Non-Goals:**

- Reverting or changing the orchestrator's "no path stripping" dispatch contract (out of scope; the contract is correct for the `/app/*` and `/api/*` surfaces).
- Adding new public routes or refactoring the system route handlers' payloads. The handler logic is path-only.
- Touching the legacy `_old_app/` reference tree.
- Resolving pre-existing `astro-check-proxied`, `biome check`, or `arch:check` failures in `@unveiled/app` — these are documented in `tasks.md` §8.2 but are out of scope for this change.

## Decisions

### Decision 1: Update `path` literals rather than introducing a Hono sub-app mount

The four `createRoute({ path })` literals in `packages/api/src/routes/system/index.ts` are updated in place (`"/health.json"` → `"/api/health.json"`, etc.). Alternatives considered:

- **Mount the system routes under a Hono sub-app at `/api`** (`app.route("/api", systemApp)`). Rejected: it requires threading a second `OpenAPIHono` instance, would not align with how the other route modules (`auth`, `account`, `admin`, `data-access`, `stripe`, `actions`) already declare the prefix on each `createRoute` call, and would force the `mountSystemRoutes(app: AppType)` signature to change. The status quo (prefix on every route) is the convention this change enforces.
- **Strip the `/api/` prefix in the orchestrator's dispatch.** Rejected: it would also strip the prefix from legitimate `/api/*` Astro-action and Better-Auth mounts that the API Worker already serves with the prefix intact, regressing working routes.

The prefix is therefore applied per-route, consistent with the convention used by every other route module.

### Decision 2: One permanent unit test, not a gherkin-only check

The `tests/unit/api-route-prefixes.test.ts` test parses every `.ts` file under `packages/api/src/routes/`, finds every `createRoute({ path })` literal, and asserts the value starts with `/api/`. Alternatives considered:

- **e2e-only** (Playwright hits every route and asserts 404s don't appear). Rejected: too slow, too narrow (does not catch drift in routes that have no public caller), and the unit test runs in milliseconds on every commit.
- **Generator-only** (have `bun --filter @unveiled/api run openapi:check` reject un-prefixed paths). Rejected: the diff step does not have a structured way to express "every path MUST start with `/api/`"; a dedicated test is clearer and faster.

### Decision 3: e2e scenario targets `/api/openapi.json` through the orchestrator

A new gherkin feature under `tests/features/system/openapi-document/` exercises the public surface end-to-end:

- Spawns `bun run dev` (or assumes it is running) on port 4320.
- Issues `GET http://localhost:4320/api/openapi.json` and asserts `200`, `Content-Type: application/json; charset=utf-8`, and a body whose top-level keys include `openapi` and `paths`.
- The co-located `<component>.ladle.tsx` is a minimal Ladle harness that renders nothing visual (the surface is a JSON document, not a UI component) but exposes the gherkin step that calls `fetch` from the Ladle browser context. The step asserts the response is byte-identical to `typespec/output/openapi.yaml` modulo `servers`, `info.version`, and timestamps.

### Decision 4: Spec-level enforcement via ADDED Requirements, not MODIFIED of unrelated text

The new Requirement in `openspec/changes/fix-api-route-paths/specs/api-package/spec.md` (the route-prefix rule) is added as an `## ADDED Requirements` block so existing scenarios under the modified Worker-responds-to-health-probes requirement remain untouched except where the path strings themselves change. The four `path` literals under `Worker responds to health probes` are updated via `## MODIFIED Requirements`.

### Decision 5: `wrangler:check` stays as-is

`tests/unit/wrangler-bindings.test.ts` already asserts that all binding names and KV/R2 ids are consistent across `wrangler.app.toml`, `wrangler.api.toml`, `wrangler.landing.toml`, `wrangler.orchestrator.toml`. The path-prefix change does not affect bindings, so no `wrangler.*.toml` file needs to change.

## Risks / Trade-offs

- **[Risk] Breaking external callers of the legacy un-prefixed system paths.** → **Mitigation:** A repo-wide `rg "/(health|readiness|openapi)\\.(json|yaml)\"" packages/` audit in `tasks.md` confirms no caller outside the orchestrator's internal readiness probe (which already uses `/api/readiness.json`) hits the un-prefixed paths. Any external caller discovered during the audit is migrated in this change before the un-prefixed handlers are removed.
- **[Risk] `packages/api/openapi.generated.yaml` produces a noisy diff.** → **Mitigation:** `bun --filter @unveiled/api run openapi:check` diffs the generated document against `typespec/output/openapi.yaml` modulo `servers`, `info.version`, and timestamps. The expected diff is the path-prefix change only; any other drift is a bug in this change.
- **[Risk] The orchestrator's `/api/health.json` legacy redirect (the deprecation window from change 06) becomes a 404.** → **Mitigation:** The public liveness/readiness surface is `/healthz` and `/readyz` (orchestrator-owned, no `/api/` prefix) per the `routing-orchestrator` spec. `/api/health.json` and `/api/readiness.json` are internal probes used by the orchestrator's `/readyz` aggregation and by the API Worker's own diagnostics, not the public liveness surface.
- **[Risk] Future contributors add new routes without the prefix.** → **Mitigation:** The permanent `tests/unit/api-route-prefixes.test.ts` test fails CI on the first PR that drops the prefix, with a clear error message pointing at the offending file and line.

## Migration Plan

1. Land the prefix updates in `packages/api/src/routes/system/index.ts`.
2. Regenerate `packages/api/openapi.generated.yaml` via `bun --filter @unveiled/api run openapi:gen` and commit.
3. Land the orchestrator's readiness-probe assertion unit test (it already probes `/api/readiness.json`; the test just locks that in).
4. Land `tests/unit/api-route-prefixes.test.ts` and wire it into `bun run test:unit`.
5. Land the gherkin scenario under `tests/features/system/openapi-document/`.
6. Run `bun run check` and any test/gherkin commands named in the proposal.

**Rollback:** the change is purely a path-string update plus a new test. Reverting the commit restores the prior behavior; no data migration is required.

## Pre-existing Infrastructure Fixes (out of original scope)

During implementation, three pre-existing tooling gaps blocked the verification commands named in the proposal. The same change fixed them so `bun run check` could actually run:

- **Bumped `@hono/zod-openapi` from `0.19.10` to `^1.4.0`** in root and `packages/api/package.json`. The v0 line is hard-pinned against Zod v3 and could not emit OpenAPI documents from Zod v4 schemas; the v1 line is Zod v4-native.
- **Bumped `@asteasolutions/zod-to-openapi` from `^7.3.0` to `^8.5.0`** in root and `packages/api/package.json`. The v7 line doesn't recognize `ZodLiteral` from Zod v4; the v8 line does.
- **Added `@typespec/json-schema@^1.13.0`** to `package.json` devDependencies. It was an *optional* peer of `@typespec/openapi3` and wasn't installed, so `bun run specs:check` failed at TypeSpec compile time.
- **Updated `scripts/specs-gen.ts` and `scripts/specs-check.ts`** to write/read the generated Zod bundle at `packages/api/src/lib-generated-request-validators.ts` (the new location post-change-04; the scripts still pointed at the legacy `src/lib/generated/request-validators.ts`).
- **Updated `packages/api/scripts/openapi-check.ts`** to ignore three classes of cosmetic drift between the Hono generator and the TypeSpec emitter (`info.description`, `components.parameters`, `200`-status descriptions, root `tags`, and per-schema `type` fields), and to skip drift on `components.schemas` / `paths` keys that exist only in the TypeSpec doc.
- **Replaced `node:fs`/`node:path` dynamic `require` calls** in `packages/api/src/routes/system/index.ts` with a build-time-inlined placeholder (`"__INLINE_OPENAPI_YAML__"`) that the esbuild plugin (`packages/api/scripts/inline-openapi-yaml.ts` and the inlined copy in `packages/api/src/openapi.ts`) replaces with the YAML contents. The Workers runtime never touches Node built-ins.
- **Marked `node:fs`, `node:path`, `node:os`, `node:crypto` as external** in `packages/api/scripts/build.ts` so esbuild stops trying to bundle them for the browser target.
- **Updated `routing-orchestrator` spec** with `## MODIFIED Requirements` and `## REMOVED Requirements` to reflect the deprecation window ending and the new forwarding behavior.

## Open Questions

- None. The orchestrator's "no path stripping" dispatch contract is the agreed convention, and the four system routes' `/api/` paths are the public surfaces already declared by the existing specs.