## Why

With `@unveiled/api` mounted at `/api/*` via service binding (change 03), `@unveiled/app` running under `/app/*` (change 04), and `@unveiled/landing` mounted at `/*` (change 05), the production URL space is now owned by three separate Workers. Today no single entry point dispatches the public URL surface; the Astro app and the landing app each assume they own the hostname, and `/api/*` is only reached by accident because the Astro app's middleware short-circuits before it can claim the route. A Cloudflare Worker orchestrator is the cleanest way to own the public URL surface: one entry Worker inspects `url.pathname`, picks the right service binding (API Worker, app Astro Worker, landing Astro Worker), and forwards the request. The orchestrator also owns health/readiness probes (replacing the API Worker's publicly-exposed `/api/health.json` and `/api/readiness.json`), uniform security headers (CSP, HSTS, X-Content-Type-Options), and structured request logging emitted to the Cloudflare Workers Tail.

## What Changes

- Add `packages/orchestrator/` — a new Bun workspace member `@unveiled/orchestrator` that ships a Cloudflare Worker entry:
  - `packages/orchestrator/package.json` (`name: "@unveiled/orchestrator"`, `private: true`, scripts `dev`, `build`, `typecheck`, `lint`, `test:unit`).
  - `packages/orchestrator/src/worker.ts` — the dispatch Worker. Inspects `url.pathname`, returns `env.API.fetch(request)` for `/api/*`, `env.APP.fetch(request)` for `/app/*`, `env.LANDING.fetch(request)` for everything else, and answers `/healthz` / `/readyz` directly.
  - `packages/orchestrator/src/security.ts` — CSP / HSTS / X-Content-Type-Options middleware applied to every non-API response (composed to allow `'self'`, Stripe `*.stripe.com` and Stripe Network endpoints, Resend, and any required font CDN).
  - `packages/orchestrator/src/logging.ts` — structured JSON log middleware that emits a single line per request and stamps a `requestId` used to correlate downstream Workers' logs.
  - `packages/orchestrator/src/readiness.ts` — readiness probe that pings each downstream Worker (`/healthz`) and returns 200 only when all three respond; 503 with a safe error envelope otherwise.
  - `packages/orchestrator/src/dev-proxy.ts` — Vite-based dev proxy (port 4320) that forwards `/api/*` → `http://localhost:8787`, `/app/*` → `http://localhost:4321`, `/ladle/*`, `/favicon.ico`, `/` → `http://localhost:4322`.
- Add `wrangler.orchestrator.toml` — the per-package Wrangler config kept at the repo root:
  - `name = "unveiled"`, `main = "packages/orchestrator/dist/worker.js"`.
  - `[[services]] binding = "APP" service = "unveiled-app" entrypoint = "fetch"`.
  - `[[services]] binding = "LANDING" service = "unveiled-landing" entrypoint = "fetch"`.
  - `[[services]] binding = "API" service = "unveiled-api" entrypoint = "fetch"` (carried over from change 03).
  - `assets = { binding = "ASSETS", directory = "./dist/client" }` — orchestrator owns the top-level static asset binding (Ladle build, favicon, future top-level public files).
- Update the per-package Wrangler configs so the app / landing / api no longer reference `assets = ...`; the orchestrator is the sole owner:
  - `wrangler.app.toml` — drop the `assets` block (the app no longer needs it; static asset requests are dispatched by the orchestrator or owned by the Astro build's per-page static folder under `/app/*`).
  - `wrangler.landing.toml` — drop the `assets` block (landing assets are served from `/` via the orchestrator's static binding).
  - `wrangler.api.toml` — unchanged (the API Worker has no static assets; it serves JSON only).
- Update the root `package.json`:
  - `bun run dev` becomes a single command that boots all four Workers behind the orchestrator. Concretely: `concurrently 'bun --filter @unveiled/api run dev' 'bun --filter @unveiled/app run dev' 'bun --filter @unveiled/landing run dev' 'bun --filter @unveiled/orchestrator run dev'` with `wait-on` to gate the orchestrator on the others' ports, then the orchestrator's `dev` script listens on port 4320 and forwards per the proxy map.
  - `bun run preview:cloudflare` chains four Wrangler deploys: API → app → landing → orchestrator. Each step's `wrangler dev --remote` listens on its declared port; the orchestrator proxies them.
  - `bun run deploy:cloudflare` does the same with `--remote` semantics: `wrangler deploy --config wrangler.api.toml` → `wrangler deploy --config wrangler.app.toml` → `wrangler deploy --config wrangler.landing.toml` → `wrangler deploy --config wrangler.orchestrator.toml`.
- Replace `/api/health.json` and `/api/readiness.json` with orchestrator-owned `/healthz` (liveness) and `/readyz` (readiness) endpoints. The API Worker's internal health endpoints are reachable via the service binding only and are no longer publicly exposed. The deprecated public JSON endpoints return a `301` redirect to the orchestrator paths for one release so existing monitoring can be migrated; the redirect is added by the orchestrator (no Astro endpoint involved).
- Update `scripts/check-architecture-drift.ts` and the LikeC4 model under `architecture/` so the orchestrator is the entry container with three downstream service bindings (`APP`, `LANDING`, `API`) and a top-level static asset binding.
- Update `AGENTS.md` to reflect the new file layout (`packages/{design-system,api,app,landing,orchestrator}/`), the new toolchain commands (`bun run dev` boots all four, `bun run deploy:cloudflare` is a four-step chain), and the updated definition of done.
- Add BDD coverage under `tests/features/core-platform/orchestrator/` (`feature.feature` + `dispatch.ladle.tsx`) asserting the public URL surface (`/`, `/app/<lang>/discover`, `/api/openapi.json`, `/healthz`, `/readyz`) returns the expected response for each prefix.

## Capabilities

### New Capabilities

- `routing-orchestrator`: a Cloudflare Worker that owns the public URL surface and dispatches requests to the API Worker, the app Astro Worker, the landing Astro Worker, or serves health/readiness/static assets directly. Enforces uniform security headers (CSP, HSTS, X-Content-Type-Options), structured JSON request logging with a `requestId` correlation id, and a single dispatch contract (`/api/*` → API, `/app/*` → app, `/` → landing, `/healthz` and `/readyz` → orchestrator). Replaces the previous Astro-owned health/readiness JSON endpoints with `/healthz` and `/readyz`.

### Modified Capabilities

- `routing`: the URL space is now fully owned by the orchestrator. `/api/*`, `/app/*`, and `/*` are dispatched by the orchestrator before any Astro or Hono middleware runs; the Astro app's `/api/*` short-circuit (change 03) is preserved as a defense-in-depth fallback for direct app-only deploys but is no longer the canonical entry path.
- `api-package`: the API Worker is reachable via the orchestrator's `API` service binding for all `/api/*` traffic. The API Worker's `wrangler.api.toml` is the upstream of `wrangler.orchestrator.toml`'s `[[services]] binding = "API"` declaration. The `/api/health.json` and `/api/readiness.json` endpoints (still served by the API Worker for direct health checks) are no longer the public-facing health surface; the orchestrator owns that.
- `app-package`: the Astro app is mounted at `/app/*` in production via the orchestrator's `APP` service binding; the `base: "/app"` config from change 04 is unchanged. The app's middleware `/api/*` short-circuit remains for direct app-only deploys but is not the canonical entry path.
- `landing-package`: the landing Astro app is mounted at `/*` in production via the orchestrator's `LANDING` service binding; the `base: "/"` config from change 05 is unchanged.
- `openapi-contract`: the OpenAPI document served at `GET /api/openapi.json` is reached via the orchestrator → API Worker service binding path; the base URL in the served document is the orchestrator's public hostname. `typespec/output/openapi.yaml` `servers` block is regenerated to point at the orchestrator's hostname.
- `production-observability`: structured JSON logs are now emitted by the orchestrator with a `requestId` correlation id; the orchestrator stamps the id on every inbound request and forwards it via a `x-request-id` header so downstream Workers' logs can be correlated. The downstream Workers (app, landing, api) keep their own structured log lines and add the inherited `requestId` to their `context` object.
- `deployment`: deployment is now a four-step Wrangler chain (`api` → `app` → `landing` → `orchestrator`) in both preview and production; the orchestrator deploys last because it depends on the downstream Workers' service bindings being live.

### Removed Capabilities

- The public `GET /api/health.json` and `GET /api/readiness.json` endpoints are removed from the public surface and replaced by orchestrator-owned `/healthz` (liveness) and `/readyz` (readiness). The endpoints inside the API Worker are kept for internal health checks and the deprecation-window 301 redirect is served by the orchestrator.

## Impact

- **New files:**
  - `packages/orchestrator/` — the new Bun workspace member.
  - `wrangler.orchestrator.toml` — the orchestrator's Wrangler config (kept at the repo root for CLI ergonomics).
  - `tests/features/core-platform/orchestrator/` — gherkin coverage for the public URL surface.
- **Modified files:**
  - `wrangler.app.toml`, `wrangler.landing.toml` — drop the top-level `assets` binding; the orchestrator owns it.
  - `wrangler.api.toml` — unchanged.
  - `package.json` (root) — script rewrites for `dev`, `build`, `preview:cloudflare`, `deploy:cloudflare`.
  - `scripts/check-architecture-drift.ts` — orchestrator container model.
  - `architecture/*.dsl` — orchestrator container with three downstream service bindings.
  - `typespec/main.tsp` — `servers` block points at the orchestrator's public hostname; regenerate via `bun --filter @unveiled/api run specs:gen`.
  - `AGENTS.md` — new file layout (`packages/{design-system,api,app,landing,orchestrator}/`), updated toolchain commands, updated definition of done.
- **Removed files:** _none net-new_ — the API Worker's internal `/api/health.json` and `/api/readiness.json` endpoints stay (they back the readiness probe via service binding); only the public redirect shims are removed (none were committed after change 03, so this is a no-op).
- **Dependencies changed:**
  - Add `wrangler`, `concurrently`, `wait-on` to `@unveiled/orchestrator` (most are already root dev-deps).
  - Add `wrangler` (Cloudflare Workers runtime types) to the orchestrator's `devDependencies`.
- **Risks:**
  - **Service-binding cold starts.** Adding a third service binding can introduce latency on cold paths. Mitigation: deploy the orchestrator last (after its dependencies are warm); keep a tiny warm-up ping in `worker.ts` that touches each binding on `scheduled` so the cold path is rare.
  - **Cookie domain.** The session cookie's `Domain` must cover both `app.unveiled.app` and the orchestrator's hostname (e.g. `unveiled.app`). Mitigation: `AUTH_COOKIE_DOMAIN` is set to the orchestrator's hostname in `packages/api/src/auth.ts`; verified by an existing parity test.
  - **CSP composition.** The orchestrator must compose a CSP that works for both the landing and the app surfaces. Mitigation: a single CSP policy that allows `'self'`, the Stripe endpoints (`*.stripe.com` for the JS SDK, `r.stripe.com` for telemetry), Resend mailto links, and the design-system font CDN if applicable; documented in `design.md`.
  - **Local dev parity.** `bun run dev` now requires four concurrent processes. Mitigation: a single root script that orchestrates them with `concurrently` + `wait-on`; documented in `AGENTS.md` and `packages/README.md`.
  - **Redirect-after-login cross-origin.** The deep-link redirect (`/app/<lang>/login?redirect=...`) flows through the orchestrator, then the app's middleware issues the redirect. Mitigation: the redirect path is always same-origin (orchestrator → app via service binding is not a redirect to the client); verified by the existing `parseSafeRedirectTarget` unit test and gherkin coverage.
  - **LikeC4 drift.** New container identities (`orchestrator`, `appWorker`, `landingWorker`, `apiWorker`) must be modeled in the LikeC4 model. Mitigation: `bun run arch:check` is in the definition of done and fails the change if the model and code disagree.