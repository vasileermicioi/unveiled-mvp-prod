## Context

The `@unveiled/api` package (change 02) now owns every HTTP route under `/api/*` plus the canonical HTTP shape of every Astro Action, and ships as a Hono app deployed to its own Cloudflare Worker (`name = "unveiled-api"`, `main = "packages/api/dist/worker.js"`). During the change-02 shim window, the Astro app forwards every `/api/*` request through `src/pages/api/[...path].ts` so behavior is preserved byte-for-byte. This change retires that shim and replaces it with an in-runtime delegation: the Astro app Worker calls the API Worker directly via a Cloudflare service binding.

The current `src/middleware.ts` runs the full guard chain (`language resolution → viewer hydration → route-table match → permission check → redirect-or-render`) on every request, including `/api/*` requests. After this change, `/api/*` requests short-circuit the guard chain and are forwarded to `env.API.fetch(request)` before any Astro routing runs. The Astro app keeps its SSR pages, React islands, Astro Actions, and session-cookie verification; the API Worker keeps its Hono routes, Better Auth mounting, Stripe webhook handler, and OpenAPI document.

Two deployment shapes are possible (per `.development-plan/12-iteration/03-mount-api-at-api-prefix.md`):

1. **Co-located via service binding** (chosen here): the API Worker is a service binding on the Astro app's Worker; no second public origin.
2. **Standalone at `api.unveiled.app`** (deferred to change 06 — routing orchestrator): the Astro app reverse-proxies `/api/*` to a separate hostname.

The co-located shape is chosen because it preserves the existing single-origin behavior (session cookies, CORS, CSP unchanged), avoids a new public hostname (cheaper, fewer DDoS surface, no extra cert), and matches the existing `assets = { binding = "ASSETS", directory = "./dist/client" }` Cloudflare pattern. The standalone shape is captured as a non-goal here and revisited after change 06 lands.

## Goals / Non-Goals

**Goals:**

- Replace the change-02 catch-all shim (`src/pages/api/[...path].ts` and friends) with a service-binding delegation that runs before any Astro routing or middleware guard.
- Make the Astro app Worker a thin host for SSR pages, React islands, Astro Actions, and session-cookie verification; the API Worker owns `/api/*` end-to-end.
- Keep byte-identical responses for every existing `/api/*` endpoint (status, headers, body) — verified by `tests/api/parity.spec.ts`.
- Keep cookie behavior intact across the service binding (`Cookie` inbound, `Set-Cookie` outbound) — verified by `tests/api/cookie-forwarding.test.ts`.
- Keep streaming behavior intact (Stripe webhook raw body, any future SSE endpoints) — verified by a streaming integration test.
- Keep the Astro app's session-cookie verification working (Better Auth `Domain` = `AUTH_COOKIE_DOMAIN`); both runtimes read the same cookie.
- Make `wrangler deploy` chainable: API Worker first, Astro app second; both succeed in preview and production.

**Non-Goals:**

- **Standalone `api.unveiled.app` deployment shape** — deferred to change 06 (routing orchestrator). The standalone reverse-proxy path is captured here only as a future exit from the co-located shape.
- **Reorganizing the middleware guard chain for non-`/api/*` traffic.** The existing guard chain is unchanged; this change only adds a short-circuit above it.
- **Reworking Astro Action handler logic.** Action wrappers in `src/actions/index.ts` already call into `@unveiled/api`'s exported handlers (per change 02); this change does not touch that wiring.
- **Touching the TypeSpec contract.** The route surface does not change; `bun run specs:gen` is not expected to produce diffs from this change alone.
- **Cross-region replication, custom domains, or rate-limiting policies.** Out of scope; the binding is an in-region, in-account Cloudflare primitive.
- **Migrating `src/lib/data-access/**` out of the Astro app.** The shim stays until change 04 (extract app package).

## Decisions

### Service binding over reverse proxy

The co-located service binding (`env.API.fetch(request)`) is preferred over an `api.unveiled.app` reverse proxy because it preserves the single-origin behavior (session cookie scope, CORS, CSP) and adds no public hostname. Alternative: a public reverse proxy at `api.unveiled.app` is captured as a non-goal and deferred to change 06 (routing orchestrator). Trade-off: the service binding pins the two Workers to the same Cloudflare account and region; that matches the current deploy target.

### Short-circuit order in `src/middleware.ts`

The `/api/*` short-circuit runs **before** the language resolution / viewer hydration / permission guards. Rationale: the API Worker does its own auth via Better Auth and its own validation via the generated Zod schemas, so the Astro middleware's guard chain has no useful work for `/api/*`. Alternative considered: keep the guard chain running and only swap the response source. Rejected because it forces an unnecessary Better Auth session read on every API call from the Astro app, doubles the cookie IO, and risks guard-driven redirects on requests that should reach the API (e.g. `/api/auth/sign-in` would be subject to the language guard).

The short-circuit reads the binding from `import { env } from "cloudflare:workers"` (Astro v6 typed env). `context.locals.runtime.env` throws at runtime in Astro v6 (see `node_modules/@astrojs/cloudflare/dist/utils/handler.js:72`), so the middleware must import the binding from `cloudflare:workers` rather than from `context.locals`. The binding itself is typed in `src/env.d.ts` so `astro check` accepts `env.API.fetch(request)`.

### Service binding declaration in `wrangler.toml`

The binding is added as:

```toml
[[services]]
binding = "API"
service = "unveiled-api"
entrypoint = "fetch"
```

`entrypoint = "fetch"` matches the exported fetch handler from `packages/api/src/worker.ts`. The binding name `API` is uppercase to match Cloudflare convention and matches the existing `ASSETS` / `SESSION` / `ASSETS_BUCKET` binding naming.

### Shared bindings between `wrangler.toml` and `wrangler.api.toml`

Both Wrangler configs declare the same `SESSION` KV namespace id and `ASSETS_BUCKET` R2 binding so service-bound calls succeed in dev, preview, and production. The API Worker's `wrangler.api.toml` (from change 02) is updated to declare these bindings explicitly; `wrangler deploy --config wrangler.api.toml` and `wrangler deploy --config dist/server/wrangler.json` are then guaranteed to use the same physical KV namespace and R2 bucket in each environment.

### Deploy chain

`bun run preview:cloudflare` and `bun run deploy:cloudflare` chain `wrangler deploy --config wrangler.api.toml` first, then `wrangler deploy --config dist/server/wrangler.json`. The Astro app's deploy depends on the API Worker already being live (otherwise `env.API.fetch` returns a not-found / 503 in production). The Astro app build (`bun run build`) runs before either deploy so `dist/server/wrangler.json` exists.

Alternative considered: parallel deploys. Rejected because the Astro app Worker would briefly serve `/api/*` requests with a missing service binding, producing 5xx noise during the deploy window.

### Streaming and raw-body handling

The middleware short-circuit returns the upstream `Response` object directly — Cloudflare service bindings transparently forward `ReadableStream` bodies, so Stripe's `stripe.webhooks.constructEventAsync` (which reads `await c.req.raw.text()` in `packages/api/src/routes/stripe/webhook.ts`) continues to work unchanged. The streaming integration test asserts chunked transfer behavior across the binding.

### Delete `src/pages/api/**` only after parity passes

The catch-all shim from change 02 stays in `src/pages/api/**` until `tests/api/parity.spec.ts` proves that the service-binding path returns byte-identical responses for every previously-existing endpoint. Deletion happens as the final task; until then the shim is dead code but provides a fallback if a regression is found.

### `scripts/check-architecture-drift.ts` update

The drift script's API container was modeled as an Astro endpoint container (the `src/pages/api/**` directory). This change updates the LikeC4 model and the drift script so the API container is recognized as a Cloudflare Worker service binding on the Astro app's Worker. The change is mechanical (rename container, point at the binding) and preserves the LikeC4 element id used by `bun run arch:check`.

## Risks / Trade-offs

- **Service binding latency.** → Mitigation: the hop is in-region / in-account; p95 latency is measured before/after via `wrangler tail` and asserted by a regression test. If a regression appears, the co-located shape can be swapped for the standalone shape deferred to change 06.
- **Cookie forwarding regression.** → Mitigation: `tests/api/cookie-forwarding.test.ts` asserts `Cookie` inbound and `Set-Cookie` outbound for sign-in, sign-out, and a request that mutates session state. `AUTH_COOKIE_DOMAIN` is set per change 02 and verified here.
- **Streaming response regression.** → Mitigation: a streaming integration test asserts chunked transfer behavior across the binding for the Stripe webhook and any future SSE endpoint. The middleware short-circuit returns the upstream `Response` object directly; no body buffering is introduced.
- **Better Auth session domain mismatch.** → Mitigation: `AUTH_COOKIE_DOMAIN` is set per change 02; the cookie domain is asserted in `tests/api/cookie-forwarding.test.ts` and in the existing `tests/features/identity/cookie-domain.test.ts` parity coverage.
- **Drift between `wrangler.toml` and `wrangler.api.toml` bindings.** → Mitigation: a unit test under `tests/unit/wrangler-bindings.test.ts` diffs the two configs' binding declarations and fails CI when they diverge.
- **Astro app briefly serving `/api/*` during deploys.** → Mitigation: deploys are chained (API Worker first, Astro app second); `bun run preview:cloudflare` and `bun run deploy:cloudflare` document the order.
- **LikeC4 drift.** → Mitigation: the container rename is part of this change; `bun run arch:check` is in the definition of done and fails the change if the model and code disagree.

## Migration Plan

1. Add the service binding declaration to `wrangler.toml`. Confirm `wrangler deploy --config wrangler.api.toml` succeeds and the API Worker is reachable in the preview environment.
2. Add the `/api/*` short-circuit to `src/middleware.ts`. Deploy the Astro app Worker to preview; confirm `curl https://preview.example/api/health.json` returns the same body the Astro endpoint returned before the change.
3. Run the parity suite (`tests/api/parity.spec.ts`) end-to-end against the preview deployment. Every prior endpoint under `/api/*` must return byte-identical responses.
4. Run the cookie-forwarding and streaming integration tests against the preview deployment. Cookie and chunked-transfer parity must hold.
5. Once parity passes, delete `src/pages/api/**` and the corresponding catch-all shim. Re-run the parity suite end-to-end to confirm nothing regressed.
6. Update `scripts/check-architecture-drift.ts` and the LikeC4 model; `bun run arch:check` must pass.
7. Promote the change through preview → production via the chained deploy. Roll back by re-deploying the previous Astro app Worker (the previous Worker still has the catch-all shim); the API Worker stays put because its contract surface is unchanged.

Rollback strategy: the previous Astro app Worker (with `src/pages/api/[...path].ts` and friends) remains deployable as long as the API Worker is alive; a `wrangler rollback` (or `wrangler deploy --config dist/server/wrangler.json` of the previous SHA) restores the prior behavior without touching the API Worker.
