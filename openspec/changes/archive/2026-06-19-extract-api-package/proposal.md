## Why

Every HTTP endpoint today lives as an Astro endpoint file under `src/pages/api/`. That couples the API to the Astro runtime and blocks three things we need soon: running the API independently (workers, cron, integration tests), sharing the same TypeSpec-derived Zod validators with cron jobs and any future client SDK, and moving to a thin orchestrator Worker that dispatches `/api/*` to one runtime and the rest of the site to Astro. The 12-iteration plan also needs a deployable Worker shape (`packages/api/dist/worker.js`) for `wrangler.api.toml`.

## What Changes

- Add a new Bun workspace package `@unveiled/api` built on Hono 4 (Cloudflare Workers runtime) that owns every route currently under `src/pages/api/**` plus the canonical HTTP shape of the existing Astro Actions.
- Add `wrangler.api.toml` for an `unveiled-api` Worker bound to the same secrets/KV/R2 as the root `wrangler.toml`; build emits `packages/api/dist/worker.js`.
- Add `packages/api/src/openapi.ts` that assembles the Hono app's OpenAPI 3.1 document via `@hono/zod-openapi`; `openapi:gen` / `openapi:check` keep it in sync with the TypeSpec source.
- Rewrite the existing Astro endpoints under `src/pages/api/**` as thin Hono shims (single `app.route("/api/*", api.fetch)` style adapter in `src/pages/api/[...path].ts`) so behavior is identical during the transition. The shims are removed in change 03 when the orchestrator Worker takes over.
- Move shared API helpers from `src/lib/data-access/**` (server-only Drizzle queries used by the HTTP layer) into `packages/api/src/data-access/**`; the Astro app keeps a re-export shim until change 04.
- Move the Stripe webhook handler into `packages/api/src/routes/stripe/webhook.ts` with strict raw-body verification (`stripe.webhooks.constructEventAsync`) — ported unchanged from the Astro endpoint.
- Wire `bun run specs:gen` and `bun run specs:check` to also produce / verify `packages/api/openapi.generated.yaml`; drift against TypeSpec fails the unified check.
- Mount Better Auth inside `@unveiled/api` at `/api/auth/*`; the Astro app keeps session-cookie verification but defers sign-in / sign-up / account endpoints to the API package. Cookie domain configured via shared env `AUTH_COOKIE_DOMAIN`.

This change is purely additive at the route surface: every existing endpoint preserves its response bytes. The route-binding switch from Astro endpoints to the Hono worker happens in change 03.

## Capabilities

### New Capabilities

- `api-package`: `@unveiled/api` Bun workspace package that owns every HTTP route under `/api/*` and the canonical OpenAPI document. Enforces Hono-based routing, Zod-validated request/response, Cloudflare Worker deployment shape, and TypeSpec parity via `openapi:check`.

### Modified Capabilities

- `openapi-contract`: the contract is now produced from `@unveiled/api` in addition to the Astro endpoint set; `/api/openapi.json` is owned by `@unveiled/api`. TypeSpec remains the source of truth and `bun run specs:check` covers both shapes.
- `forms-actions`: Astro Actions remain the only mutation surface from the Astro app, but their canonical HTTP shape is now also exposed by `@unveiled/api` so non-Astro callers (cron, webhooks, third-party SDK) can hit the same validators without going through Astro. Handler logic is unchanged; only the binding moves.
- `auth`: Better Auth is mounted inside `@unveiled/api` at `/api/auth/*`. The Astro app keeps its session-cookie verification but defers sign-in / sign-up / account endpoints to the API package. Cookie domain is configured via shared env (`AUTH_COOKIE_DOMAIN`).
- `data-access`: Drizzle queries used by the HTTP layer move into `packages/api/src/data-access/**`. The Astro app's data-access layer (used by SSR pages) continues to live in `src/lib/data-access/**` until change 04.

### Removed Capabilities

- _None._ Every endpoint's behavior is preserved during the shim window.

## Impact

- **New files:** `packages/api/` tree (`package.json`, `tsconfig.json`, `wrangler.api.toml`, `src/worker.ts`, `src/openapi.ts`, `src/routes/**`, `src/data-access/**`, `src/handlers/**`, `src/middleware/**`); `tests/api/` integration snapshots.
- **Modified files:**
  - `src/pages/api/**` — rewritten as thin Hono shims (one-line `app.route` adapters via `src/pages/api/[...path].ts`) during the transition; deleted in change 03.
  - `src/lib/data-access/**` — server-only queries split into the API package; Astro-only queries stay.
  - `package.json` (root) — adds `hono`, `@hono/zod-open-api`, `@hono/node-server` (dev), `@unveiled/api` to the workspace; moves `@neondatabase/serverless` and `stripe` into the package's deps; keeps the root dev-dep on `stripe` for Astro Actions until change 04.
  - `tsconfig.json` — `@unveiled/api` path alias added (already declared in `tsconfig.base.json`).
  - `openspec/specs/{openapi-contract,forms-actions,auth,data-access}/spec.md` — requirement deltas (in this change).
- **Removed files:** _none yet_ (shims live until change 03).
- **Dependencies changed:**
  - **Add:** `hono`, `@hono/zod-open-api`, `@hono/node-server` (dev).
  - **Move:** `stripe`, `@neondatabase/serverless`, `drizzle-orm` (server-only) from root into `@unveiled/api`.
- **Risks:**
  - **Hono on Cloudflare Workers + node-compat.** Already pinned via `wrangler.toml` (`nodejs_compat`); carried forward.
  - **Two HTTP surfaces during the transition.** `src/pages/api/**` and `packages/api/**` must serve byte-identical responses. Mitigation: shared handler functions in `packages/api/src/handlers/**` imported by both during the transition; integration tests under `tests/api/` snapshot responses.
  - **Better Auth session-cookie domain.** The Astro app and the API worker share the session via KV; the cookie's `Domain` attribute must be set so both runtimes read it. Mitigation: configure Better Auth's cookie domain via the shared env (`AUTH_COOKIE_DOMAIN`); documented in `design.md`.
  - **Webhook raw body.** Hono's `c.req.raw.body` works the same as Astro's `request.text()`; Stripe verification is ported unchanged.