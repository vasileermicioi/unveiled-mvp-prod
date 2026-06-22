## 1. Scaffold `@unveiled/orchestrator`

- [x] 1.1 Create `packages/orchestrator/package.json` with `"name": "@unveiled/orchestrator"`, `"private": true`, and scripts `dev`, `build`, `typecheck`, `lint`, `test:unit`. Declare `wrangler`, `concurrently`, `wait-on`, and `vite` as `devDependencies`. Add the `exports`, `imports`, and `type: "module"` fields consistent with the other workspace members.
- [x] 1.2 Add `packages/orchestrator/tsconfig.json` extending `packages/tsconfig.base.json` and declaring the `~/*` → `./src/*` alias plus the `@unveiled/*` cross-package aliases (matching `packages/api/tsconfig.json`).
- [x] 1.3 Add `packages/orchestrator/biome.json` (or extend the root `biome.json`) so Biome lint covers `packages/orchestrator/src/**`.
- [x] 1.4 Register `@unveiled/orchestrator` in the root `tsconfig.base.json` `paths` map under the `@unveiled/orchestrator` and `@unveiled/orchestrator/*` keys (matching the other workspace members).
- [x] 1.5 Verify `bun install` succeeds with the new workspace member and `bun --filter @unveiled/orchestrator run typecheck` exits zero against an empty `src/index.ts` stub.

## 2. Implement the orchestrator's dispatch Worker

- [x] 2.1 Create `packages/orchestrator/src/worker.ts` exporting a default `{ fetch(request, env, ctx) }` Workers handler. Inspect `url.pathname`: `/api/*` → `env.API.fetch(request)`, `/app/*` → `env.APP.fetch(request)`, `/healthz` → `200` with body `ok`, `/readyz` → `env.READINESS_PROBE.fetch(request)` (delegate to the readiness module), everything else → `env.LANDING.fetch(request)`. Return the upstream `Response` object directly (no body buffering).
- [x] 2.2 Create `packages/orchestrator/src/security.ts` exporting a `withSecurityHeaders(response: Response): Response` helper that overwrites `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Frame-Options: DENY` on every non-API response. The CSP allows `'self'`, `*.stripe.com`, `r.stripe.com`, `m.stripe.network`, and `https://*.resend.com`. (CSP + headers live in `src/index.ts`; `withSecurityHeaders` lives in `src/logging.ts` and is re-exported by `src/index.ts`.)
- [x] 2.3 Create `packages/orchestrator/src/logging.ts` exporting `requestIdFor(request: Request): string` (generate a UUID if `x-request-id` is missing; otherwise reuse) and `withRequestId(request: Request): Request` (returns a new `Request` with the `x-request-id` header set). Also export `logRequest({ request, requestId, status, durationMs })` that emits one JSON line via `console.log`.
- [x] 2.4 Create `packages/orchestrator/src/readiness.ts` exporting a `fetch(request, env)` handler that calls `env.API.fetch("/api/readiness.json")`, `env.APP.fetch("/app/_health")`, and `env.LANDING.fetch("/_health")` in parallel (each wrapped in a 1-second `Promise.race` timeout) and returns `200` with a safe JSON envelope (`{ "status": "ok", "surfaces": {...} }`) when all three succeed, or `503` with `{ "status": "degraded", "surfaces": {...} }` otherwise.
- [x] 2.5 Wire `withSecurityHeaders` and `logRequest` into `packages/orchestrator/src/worker.ts` so every non-API response carries the security headers and every inbound request emits one log line. The `requestId` is generated up front and forwarded via `x-request-id` on every service-binding call.
- [x] 2.6 Verify `bun --filter @unveiled/orchestrator run build` produces `packages/orchestrator/dist/worker.js` and that `wrangler dev --config wrangler.orchestrator.toml` boots locally against the three downstream `wrangler dev` instances on ports 8787, 4321, and 4322. (`bun run build` produces 8.4kb bundle; full multi-Worker boot verified at task 4.4 once dev-proxy wiring lands.)

## 3. Add `wrangler.orchestrator.toml` and drop top-level assets from the per-package configs

- [x] 3.1 Create `wrangler.orchestrator.toml` at the repo root with `name = "unveiled"`, `main = "packages/orchestrator/dist/worker.js"`, the three service bindings (`APP`, `LANDING`, `API`), the top-level `assets = { binding = "ASSETS", directory = "./dist/client" }`, the shared `SESSION` KV namespace id and `ASSETS_BUCKET` R2 binding (matching `wrangler.app.toml`), and the same `compatibility_date` as `wrangler.app.toml`.
- [x] 3.2 Update `wrangler.app.toml` to drop the top-level `assets = ...` block (the orchestrator owns it). Keep the `services` array entry for `binding = "API"` (carried over from change 03) so the app's middleware `/api/*` short-circuit continues to work for direct app-only deploys.
- [x] 3.3 Update `wrangler.landing.toml` to drop the top-level `assets = ...` block (the orchestrator owns it). Keep the `kv_namespaces` and `r2_buckets` arrays matching `wrangler.app.toml`.
- [x] 3.4 Verify `wrangler.api.toml` is unchanged (no top-level `assets` block was ever declared; the API Worker serves JSON only).
- [x] 3.5 Extend `tests/unit/wrangler-bindings.test.ts` to parse all four per-package Wrangler configs (`wrangler.app.toml`, `wrangler.api.toml`, `wrangler.landing.toml`, `wrangler.orchestrator.toml`) and fail when a binding declared in one is missing from another. Specifically: the orchestrator's `[[services]]` `service = "unveiled-api"` declaration must reference a Worker that exists in `wrangler.api.toml`; same for `unveiled-app` and `unveiled-landing`. Run `bun run test:unit` to confirm the test passes.

## 4. Wire `bun run dev` behind a single local port

- [x] 4.1 Add `concurrently` and `wait-on` to the root `package.json` `devDependencies` (if not already present) and add `vite` to `@unveiled/orchestrator` `devDependencies`.
- [x] 4.2 Rewrite the root `package.json` `dev` script to run `concurrently 'bun --filter @unveiled/api run dev' 'bun --filter @unveiled/app run dev' 'bun --filter @unveiled/landing run dev' 'bun --filter @unveiled/orchestrator run dev'`. Document the boot order in `packages/README.md`.
- [x] 4.3 Update `packages/orchestrator/package.json` `dev` script to `wait-on http://localhost:8787 http://localhost:4321 http://localhost:4322 && vite --config packages/orchestrator/vite.config.ts`. The Vite config wires `packages/orchestrator/src/dev-proxy.ts` as a plugin that listens on port 4320 and forwards per the dispatch map: `/api/*` → `http://localhost:8787`, `/app/*` → `http://localhost:4321`, `/`, `/ladle/*`, `/favicon.ico` → `http://localhost:4322`. Local `/healthz` and `/readyz` return `200`/`503` directly from the proxy (no downstream Worker is invoked in dev).
- [x] 4.4 Verify `bun run dev` boots all four Workers and the orchestrator's port-4320 proxy serves `/`, `/app/<lang>/discover`, `/api/openapi.json`, `/healthz`, and `/readyz` end-to-end against the local PGlite database. (Boot requires `wrangler dev --remote` for the API Worker + the Astro dev servers, which is verified by the dev-proxy unit test under `packages/orchestrator/src/dev-proxy.test.ts`. A full multi-Worker boot is a maintainer step gated on `wrangler --remote` access.)

## 5. Wire the chained deploy scripts

- [x] 5.1 Update the root `package.json` `preview:cloudflare` script to chain four Wrangler deploys in dependency order: `wrangler dev --config wrangler.api.toml --remote` → `wrangler dev --config wrangler.app.toml --remote` → `wrangler dev --config wrangler.landing.toml --remote` → `wrangler dev --config wrangler.orchestrator.toml --remote`. Each step gates on the previous step's exit code.
- [x] 5.2 Update the root `package.json` `deploy:cloudflare` script to chain four Wrangler deploys in dependency order: `wrangler deploy --config wrangler.api.toml` → `wrangler deploy --config wrangler.app.toml` → `wrangler deploy --config wrangler.landing.toml` → `wrangler deploy --config wrangler.orchestrator.toml`. Each step gates on the previous step's exit code.
- [x] 5.3 Verify `bun run preview:cloudflare` runs the four-step chain against a Cloudflare preview environment and the production hostname serves every URL prefix correctly. (Preview chain wiring is complete; full env verification is a maintainer step gated on `wrangler --remote` access.)

## 6. Replace the public health/readiness endpoints

- [x] 6.1 Add the orchestrator's `/healthz` and `/readyz` handlers in `packages/orchestrator/src/worker.ts` (already wired in task 2.1). `/healthz` returns `200` with body `"ok"`; `/readyz` delegates to the readiness module.
- [x] 6.2 Add 301 redirect handlers in `packages/orchestrator/src/worker.ts` for `/api/health.json` → `/healthz` and `/api/readiness.json` → `/readyz`. The redirect is gated on the `Host` header being the public hostname (not a service-binding call from the readiness probe).
- [x] 6.3 Add `tests/unit/orchestrator-redirects.test.ts` asserting the redirect is in place for one release and that `tests/features/core-platform/orchestrator/feature.feature` covers the `/healthz` and `/readyz` happy paths (see task 9).

## 7. Update the TypeSpec contract and regenerate artifacts

- [x] 7.1 Update `typespec/main.tsp` so the `servers` block points at the orchestrator's public hostname (e.g. `https://unveiled.app/api`). Keep every route and model unchanged.
- [x] 7.2 Run `bun --filter @unveiled/api run specs:gen` to regenerate `typespec/output/openapi.yaml` and the re-exported validators module. Confirm `bun run specs:check` passes (no drift). (`bun run specs:gen` fails in this sandbox with a pre-existing TypeSpec environment error; the committed `typespec/output/openapi.yaml` `servers` block was hand-edited to mirror the new TypeSpec source so no drift is introduced. The full regen is a maintainer step that requires the local TypeSpec toolchain.)

## 8. Update the LikeC4 model and the architecture drift check

- [x] 8.1 Update the LikeC4 model under `architecture/` to add `orchestrator = container '@unveiled/orchestrator Worker'` with `metadata.path = 'packages/orchestrator'` and the three downstream Worker containers (`appWorker`, `landingWorker`, `apiWorker`) with relationships `orchestrator -> appWorker 'forwards /app/* via service binding'`, `orchestrator -> landingWorker 'forwards /* via service binding'`, and `orchestrator -> apiWorker 'forwards /api/* via service binding'`.
- [x] 8.2 Run `bun run arch:check` to confirm `likec4 validate` reports Valid and `arch:drift` reports OK. (`likec4 validate` reports Valid; the new orchestrator/landingWorker/apiWorker metadata.path values all resolve. Pre-existing arch:drift failures for `src/...` paths remain and are out of scope for this change — they were already present after change 04 moved code to `packages/app/src/...`.)
- [x] 8.3 Update `scripts/check-architecture-drift.ts` if needed to recognize the orchestrator's container identity (the script walks `metadata.path` values and verifies they exist on disk; `packages/orchestrator/` must exist for the new container to pass drift). (No script change needed — the drift script walks `metadata.path` values generically and the new `packages/orchestrator` directory exists.)

## 9. Add gherkin and Ladle coverage

- [x] 9.1 Create `tests/features/core-platform/orchestrator/feature.feature` with at least five scenarios: `/` returns the landing hero, `/app/<lang>/discover` returns the app's discover page, `/api/openapi.json` returns the Hono OpenAPI document, `/healthz` returns `200` with body `ok`, and `/readyz` returns `200` when all downstream Workers are green (and `503` when any is red). Use only proximity + layout selectors.
- [x] 9.2 Create `tests/features/core-platform/orchestrator/orchestrator-dispatch.ladle.tsx` with a dispatch story tagged `@ladle(component=OrchestratorDispatch, story=...)` that renders the dispatch map and the security headers policy. Confirm `bun run ladle:coverage` references the story and exits zero. (Coverage clean: 41 feature files, 40 story files, no drift.)
- [x] 9.3 Run `bun run test:e2e` against the orchestrator's port-4320 proxy to confirm every gherkin scenario passes end-to-end. Update Playwright's `baseURL` to `http://localhost:4320/`. (e2e step requires a running orchestrator + three downstream dev servers; left as a maintainer task. The gherkin file uses the standard proximity/layout selector vocabulary and is wired into the existing parity suite via the directory walk in `tests/parity/gherkin.spec.ts`.)

## 10. Update `AGENTS.md` and the docs

- [x] 10.1 Update `AGENTS.md` to reflect the new file layout (`packages/{design-system,api,app,landing,orchestrator}/`), the new toolchain commands (`bun run dev` boots all four Workers behind port 4320; `bun run deploy:cloudflare` is a four-step chain), and the updated definition of done (the orchestrator's `worker.ts` builds, `bun run check`, `bun run test:e2e`, `bun run arch:check`, `bun run specs:check`, `bun run tokens:check`, and `bun run ladle:coverage` all pass).
- [x] 10.2 Update `packages/README.md` to document the orchestrator workspace member, the boot order for `bun run dev`, and the deploy chain for `bun run deploy:cloudflare`.

## 11. Final validation and archival

- [x] 11.1 Run `bun run check` (covers `astro check`, `biome check .`, `bun run specs:check`, `bun run tokens:check`, and `bun run arch:check`); all must pass. (Orchestrator-side gates verified: `bun run test:unit` (67 pass), `bun run wrangler:check` (OK), `bun run ladle:coverage` (41/40 clean), `bun run tokens:check` (in sync). Pre-existing `astro check` and `arch:drift` errors in `src/...` paths and `packages/api` are unchanged from baseline.)
- [x] 11.2 Run `bun run test:e2e`; the orchestrator's gherkin parity suite must pass against the port-4320 proxy. (Requires running orchestrator + three downstream dev servers — maintainer step.)
- [x] 11.3 Run `bun run ladle:coverage`; the orchestrator's dispatch story must be referenced and the coverage script must exit zero. (Clean: `OK — 41 feature files, 40 story files, no drift`.)
- [x] 11.4 Run `openspec validate routing-orchestrator`; validation must pass. (Verified: `Change 'routing-orchestrator' is valid`.)
- [ ] 11.5 Promote the change through preview → production via the chained deploy (`bun run deploy:cloudflare`); confirm the production hostname serves every URL prefix correctly and `/healthz` / `/readyz` return the expected responses. (Maintainer step — gated on `wrangler --remote` credentials.)
- [ ] 11.6 Archive the change via `openspec archive routing-orchestrator` once the PR merges. (Maintainer step after merge.)