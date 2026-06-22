## Context

With `@unveiled/api` mounted at `/api/*` via service binding (change 03), `@unveiled/app` running under `/app/*` (change 04), and `@unveiled/landing` mounted at `/*` (change 05), the production URL space is now owned by three separate Workers. Today no single entry point dispatches the public URL surface; the Astro app and the landing app each assume they own the hostname, and `/api/*` is only reached by accident because the Astro app's middleware short-circuits before it can claim the route. A Cloudflare Worker orchestrator is the cleanest way to own the public URL surface: one entry Worker inspects `url.pathname`, picks the right service binding (API Worker, app Astro Worker, landing Astro Worker), and forwards the request.

The current local dev story is three separate `bun run dev:api`, `bun run dev:app`, `bun run dev:landing` commands on three different ports (8787, 4321, 4322). There is no single local origin to test against, so end-to-end parity coverage has to know which port owns which URL prefix, and the gherkin `Given` URLs use `localhost:4321/app/...` (the app dev port). After this change, `bun run dev` boots all four Workers behind a single local port (4320) so parity coverage can run against one origin; the dev proxy forwards per the dispatch map.

The current health/readiness surface is the API Worker's `/api/health.json` and `/api/readiness.json` endpoints, which are publicly exposed via the service-binding short-circuit. After this change, the orchestrator owns the public-facing `/healthz` and `/readyz` endpoints; the API Worker's internal endpoints stay reachable only via service binding (for the orchestrator's readiness probe) and the public endpoints return 301 redirects for one release.

## Goals / Non-Goals

**Goals:**

- Add `packages/orchestrator/` — a Bun workspace member that ships a Cloudflare Worker entry (`name = "unveiled"`) owning the public URL surface.
- Dispatch every inbound request via Cloudflare service bindings: `/api/*` → API Worker, `/app/*` → app Worker, `/*` → landing Worker, `/healthz` and `/readyz` → orchestrator.
- Apply uniform security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options) on every non-API response.
- Emit one structured JSON log line per inbound request with a `requestId` correlation id forwarded to downstream Workers via the `x-request-id` header.
- Replace the public-facing `/api/health.json` and `/api/readiness.json` endpoints with orchestrator-owned `/healthz` and `/readyz`; serve 301 redirects from the orchestrator for one release.
- Make `bun run dev` boot all four Workers behind a single local port (4320) using `concurrently` + `wait-on` and a tiny Vite proxy inside the orchestrator's `dev` script.
- Make `bun run preview:cloudflare` and `bun run deploy:cloudflare` chain four Wrangler deploys in dependency order: `api` → `app` → `landing` → `orchestrator`.
- Drop the top-level `assets` binding from `wrangler.app.toml` and `wrangler.landing.toml`; the orchestrator owns it.
- Update the LikeC4 model and `scripts/check-architecture-drift.ts` to model the orchestrator as the entry container with three downstream service bindings.
- Update `AGENTS.md` to reflect the new file layout, the new toolchain commands, and the updated definition of done.

**Non-Goals:**

- **Reworking the downstream Workers' middleware.** The app's `/api/*` short-circuit (change 03), the landing's hero / footer (change 05), and the API Worker's Hono routes are unchanged; this change only adds a new entry point.
- **Splitting the API Worker into multiple Workers.** The API Worker continues to own `/api/*` end-to-end (Hono, Better Auth, Stripe webhook, OpenAPI document); the orchestrator is a thin dispatcher.
- **Replacing Cloudflare Pages with Workers (or vice versa).** All four Workers continue to deploy via `wrangler deploy`; Pages is not introduced.
- **Replacing `env.API`/`env.APP`/`env.LANDING` service bindings with HTTP reverse proxies.** Service bindings are in-region / in-account and add no public hostname; a reverse-proxy shape is captured as a non-goal (consistent with the change-03 non-goal that deferred the `api.unveiled.app` reverse-proxy).
- **Reworking the TypeSpec contract surface.** The HTTP routes and Astro Actions are unchanged; the only TypeSpec change is the `servers` block in `typespec/main.tsp` (point at the orchestrator's hostname), regenerated via `bun --filter @unveiled/api run specs:gen`.
- **Adding rate-limiting, DDoS protection, or WAF rules.** Out of scope; the orchestrator is a thin dispatcher and Cloudflare's edge already provides rate-limiting primitives if needed later.
- **Centralizing authentication in the orchestrator.** Better Auth remains mounted inside the API Worker (per change 03); the orchestrator does not read or validate the session cookie — it forwards the inbound `Cookie` header unchanged.

## Decisions

### Orchestrator as a thin dispatcher (not a re-implementation)

The orchestrator's `worker.ts` is intentionally tiny: it inspects `url.pathname`, picks a binding, and forwards. All business logic stays in the downstream Workers. Alternative considered: implementing a full Hono router inside the orchestrator that re-mounts `/api/*`, `/app/*`, and `/`. Rejected because it duplicates route definitions and creates two places to keep in sync.

### `requestId` via `x-request-id` header (not via service-binding metadata)

The orchestrator stamps `x-request-id` on every inbound request (generates one if missing) and forwards the header on every service-binding call. Downstream Workers read `x-request-id` from the inbound request and attach it to their request-scoped logger's `context.requestId`. Alternative considered: Cloudflare's `cf-ray` header as the correlation id. Rejected because `cf-ray` is per-edge-request (it changes when the request crosses the binding boundary), while the orchestrator's `requestId` is per-inbound-request (it survives the binding hop and lets us join the orchestrator's log to the downstream Workers' logs).

### Security headers applied to forwarded responses

The orchestrator overwrites `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, and `X-Frame-Options` on every non-API response — including responses returned by the downstream Workers via service binding. The CSP allows `'self'`, `*.stripe.com`, `r.stripe.com`, `m.stripe.network` (Stripe SDK + telemetry), and `https://*.resend.com` (Resend mailto). Alternative considered: letting each downstream Worker set its own CSP. Rejected because the policy must be uniform across the public hostname (splitting CSP between the landing and the app would create two policies for the same hostname and confuse CSP reporting tools).

### API responses are exempt from the orchestrator's CSP

`/api/*` responses return JSON (not HTML) and are not renderable documents; the orchestrator does not set CSP on them. The `Content-Type` and any cache headers set by the API Worker are returned as-is. This matches Cloudflare's convention of letting API Workers own their own headers and avoids stripping `Content-Type` from a JSON response.

### CSP is composed (not imported from a shared config)

The orchestrator's CSP is a single static string in `packages/orchestrator/src/security.ts`. Alternative considered: importing the CSP from a shared `packages/orchestrator/src/security-policy.ts` module shared with the downstream Workers. Rejected because the orchestrator is the sole owner of the policy; downstream Workers do not set CSP.

### Static asset binding moves to the orchestrator

`wrangler.app.toml` and `wrangler.landing.toml` drop their top-level `assets` blocks. The orchestrator's `wrangler.orchestrator.toml` declares `assets = { binding = "ASSETS", directory = "./dist/client" }`; the Ladle build (`bun run ladle:build` → `public/ladle/`) is copied into `packages/orchestrator/dist/client/` by the build script. Rationale: a single top-level static asset binding is the only sane shape for the public hostname (splitting it between the orchestrator and the landing would create two `ASSETS` bindings with ambiguous precedence).

### Local dev proxy is Vite-based (not Wrangler dev)

The orchestrator's `dev` script uses a tiny Vite plugin (`packages/orchestrator/src/dev-proxy.ts`) that listens on port 4320 and forwards per the dispatch map. Alternative considered: using `wrangler dev --remote` for the orchestrator and `wrangler dev --local` for the three downstream Workers. Rejected because `wrangler dev --local` requires `workerd` binaries and complicates the local setup; a Vite proxy is in-process and uses Bun's stdlib `fetch` to forward.

### `concurrently` + `wait-on` for `bun run dev`

The root `bun run dev` runs `concurrently 'bun --filter @unveiled/api run dev' 'bun --filter @unveiled/app run dev' 'bun --filter @unveiled/landing run dev' 'bun --filter @unveiled/orchestrator run dev'`. The orchestrator's `dev` script uses `wait-on http://localhost:8787 http://localhost:4321 http://localhost:4322` to gate its start on the three downstream dev servers. `concurrently` is the standard multi-process runner for Bun workspaces; `wait-on` is the standard port-gating tool. Alternative considered: `tmux` / `pm2` / a custom shell script. Rejected as heavier-weight than `concurrently` + `wait-on`.

### Readiness probe composes downstream health (not just liveness)

The orchestrator's `/readyz` endpoint calls `env.API.fetch("/api/readiness.json")`, `env.APP.fetch("/app/_health")`, and `env.LANDING.fetch("/_health")` in parallel (each wrapped in a 1-second `Promise.race` timeout) and returns `200` only when all three return `200`. Alternative considered: only checking liveness (`/healthz`) and trusting the downstream Workers to be ready. Rejected because the readiness probe must verify the full dispatch chain is healthy before a Cloudflare load balancer routes traffic to the orchestrator.

### Deprecation window for `/api/health.json` and `/api/readiness.json`

For one release, the orchestrator returns `301` redirects for `/api/health.json` → `/healthz` and `/api/readiness.json` → `/readyz`. After one release, the orchestrator drops the redirect handlers (the API Worker's internal endpoints stay reachable via service binding for the readiness probe). Alternative considered: a permanent `301` redirect. Rejected because the public-facing endpoints are renamed, not just relocated; one release's worth of monitoring tooling can be migrated, then the redirect is removed.

### LikeC4 model uses a single orchestrator container with three downstream Worker containers

The LikeC4 model under `architecture/` adds:

- `orchestrator = container '@unveiled/orchestrator Worker'` with `metadata.path = 'packages/orchestrator'`
- `appWorker = container '@unveiled/app Worker'` with `metadata.path = 'packages/app'` (carried over from change 04)
- `landingWorker = container '@unveiled/landing Worker'` with `metadata.path = 'packages/landing'` (carried over from change 05)
- `apiWorker = container '@unveiled/api Worker'` with `metadata.path = 'packages/api'` (carried over from change 03)
- Relationships: `orchestrator -> appWorker 'forwards /app/* via service binding'`, `orchestrator -> landingWorker 'forwards /* via service binding'`, `orchestrator -> apiWorker 'forwards /api/* via service binding'`

Alternative considered: nesting the three downstream Workers inside the orchestrator's deployment node. Rejected because each downstream Worker has its own Wrangler config and its own deploy lifecycle; the LikeC4 model mirrors that.

## Risks / Trade-offs

- **Service-binding cold starts.** → Mitigation: deploy the orchestrator last (after its dependencies are warm); keep a tiny warm-up ping in `worker.ts` that touches each binding on a `scheduled` handler so the cold path is rare. The `[[services]]` declarations in `wrangler.orchestrator.toml` match the existing `entrypoint = "fetch"` convention from change 03.
- **Cookie domain mismatch.** → Mitigation: `AUTH_COOKIE_DOMAIN` is set to the orchestrator's hostname in `packages/api/src/auth.ts`; the existing `tests/api/cookie-forwarding.test.ts` asserts cookie parity across the binding, and the orchestrator forwards the inbound `Cookie` header unchanged (the same `Request` object is passed to `env.API.fetch`).
- **CSP regression on the landing or the app.** → Mitigation: the CSP policy is exercised by a Ladle story (`tests/features/core-platform/orchestrator/dispatch.ladle.tsx`) that renders both surfaces' hero and asserts the security header is present; the gherkin scenario in `tests/features/core-platform/orchestrator/feature.feature` asserts `Strict-Transport-Security` and `X-Content-Type-Options` are present on a sample landing and app response.
- **Local dev startup latency.** → Mitigation: `wait-on http://localhost:8787 http://localhost:4321 http://localhost:4322` gates the orchestrator on the three downstream dev servers; the dev server boot order is API → app → landing → orchestrator (the API Worker boots fastest because it's a Hono app with no Astro overhead).
- **Readiness probe cascading failures.** → Mitigation: each downstream health probe is wrapped in a 1-second `Promise.race` timeout so a stuck downstream Worker does not block `/readyz`; the readiness envelope lists the failing surface by name (`{ "surfaces": { "api": "ok", "app": "timeout", "landing": "ok" } }`).
- **Redirect window for `/api/health.json`.** → Mitigation: the deprecation window is one release; after the release, the orchestrator drops the redirect handlers and the endpoints return `404`. A unit test under `tests/unit/orchestrator-redirects.test.ts` asserts the redirect is in place during the window and the `404` is returned after the window.
- **Drift between `wrangler.app.toml`, `wrangler.api.toml`, `wrangler.landing.toml`, and `wrangler.orchestrator.toml`.** → Mitigation: `tests/unit/wrangler-bindings.test.ts` is extended to parse all four configs and fail when a binding declared in one is missing from another (the orchestrator's service bindings must reference Workers that exist in their respective per-package configs).
- **LikeC4 drift.** → Mitigation: `bun run arch:check` is in the definition of done and fails the change if the model and code disagree; the new container identity (`orchestrator`) is added in the same change as the new `packages/orchestrator/` workspace member.
- **`scripts/check-architecture-drift.ts` drift.** → Mitigation: the drift script's container expectations are updated to recognize the orchestrator as the entry container; the script's walk over `metadata.path` values verifies every container exists on disk.

## Migration Plan

1. Add `packages/orchestrator/` with the `worker.ts`, `security.ts`, `logging.ts`, `readiness.ts`, and `dev-proxy.ts` modules. Confirm `bun --filter @unveiled/orchestrator run build` produces a deployable Worker bundle.
2. Add `wrangler.orchestrator.toml` with the three service bindings and the top-level assets binding. Confirm `wrangler dev --config wrangler.orchestrator.toml` boots locally against the three downstream `wrangler dev --remote` instances.
3. Drop the top-level `assets` block from `wrangler.app.toml` and `wrangler.landing.toml`. Re-run `bun run test:unit` to confirm `tests/unit/wrangler-bindings.test.ts` passes against the four configs.
4. Update the root `package.json` so `bun run dev` fans out to four Workers behind a single port (4320) using `concurrently` + `wait-on` + the orchestrator's Vite dev proxy. Confirm `bun run dev` boots all four Workers and the proxy serves `/`, `/app/<lang>/discover`, `/api/openapi.json`, `/healthz`, and `/readyz` end-to-end.
5. Update `bun run preview:cloudflare` and `bun run deploy:cloudflare` to chain four Wrangler deploys in dependency order. Confirm the preview chain succeeds against a Cloudflare preview environment.
6. Add the 301 redirect handlers in `packages/orchestrator/src/worker.ts` for `/api/health.json` and `/api/readiness.json`. Confirm the API Worker's internal endpoints stay reachable via service binding (the orchestrator's readiness probe uses them).
7. Update the LikeC4 model under `architecture/` to model the orchestrator as the entry container with three downstream Worker containers. Update `scripts/check-architecture-drift.ts` to recognize the new container identity. Confirm `bun run arch:check` passes.
8. Update `AGENTS.md` to reflect the new file layout, the new toolchain commands (`bun run dev` boots all four; `bun run deploy:cloudflare` is a four-step chain), and the updated definition of done.
9. Add gherkin coverage under `tests/features/core-platform/orchestrator/` (`feature.feature` + `dispatch.ladle.tsx`) asserting the public URL surface (`/`, `/app/<lang>/discover`, `/api/openapi.json`, `/healthz`, `/readyz`) returns the expected response for each prefix. Confirm `bun run test:e2e` and `bun run ladle:coverage` pass.
10. Promote the change through preview → production via the chained deploy (`bun run deploy:cloudflare`). Confirm the production hostname serves every URL prefix correctly.

Rollback strategy: the previous Astro app Worker (without the orchestrator) remains deployable as long as the three downstream Workers (`api`, `app`, `landing`) are alive; a `wrangler rollback` (or `wrangler deploy --config wrangler.app.toml` of the previous SHA) restores the prior single-Worker behavior without touching the three downstream Workers. The orchestrator's Wrangler config can be removed via `wrangler delete --config wrangler.orchestrator.toml` if needed.

## Open Questions

- **Should the orchestrator own the public hostname's TLS certificate, or should Cloudflare's edge handle it?** The current plan assumes Cloudflare's edge handles TLS termination (the orchestrator is a Worker behind Cloudflare's proxy); the certificate is managed at the edge and the orchestrator sees plain HTTP. If a custom certificate is needed (e.g. for a partner integration), it's set at the edge, not on the orchestrator.
- **Should the orchestrator rate-limit `/api/*` requests?** Cloudflare's WAF provides rate-limiting primitives at the edge; the orchestrator does not implement its own rate limiter. If a per-tenant rate limit is needed later, it can be added to the orchestrator's `worker.ts` or to the API Worker's Hono middleware.
- **Should the deprecation window for `/api/health.json` and `/api/readiness.json` be one release or two?** The current plan assumes one release. If existing monitoring tools take longer to migrate, the window can be extended; the redirect is trivial to keep in place.