## Context

`packages/api/src/middleware/auth.ts` constructs the Better Auth instance with
only `baseURL` and `secret`. The orchestrator proxies every `/api/auth/*`
request from a single public hostname to the API Worker, but locally the dev
proxy listens on `4320` and forwards to the API Worker on `8787`. Better Auth
logs `If it's a valid URL, please add <origin> to trustedOrigins` whenever the
inbound `Origin` header is not on a configured trusted list. The current
`baseURL` fallback chain (`BETTER_AUTH_URL ?? PUBLIC_BETTER_AUTH_URL ??
PUBLIC_APP_URL`) also has no entry that resolves to the orchestrator's public
hostname, so production cookies and redirects drift off-host.

Two env vars are missing from `ApiEnv`: `BETTER_AUTH_TRUSTED_ORIGINS` (an
operator-supplied comma-separated allow-list) and `PUBLIC_ORCHESTRATOR_URL`
(the orchestrator's public hostname). `getSecretReadiness` already exposes
`authSecret` and `authUrl`; it needs two new fields so `/readyz` can confirm
the resolved config at runtime.

## Goals / Non-Goals

**Goals:**

- Trust the dev proxy host (`4320`) and the API Worker's own host (`8787`)
  out of the box so login works on a fresh checkout.
- Trust whatever production env declares via `BETTER_AUTH_TRUSTED_ORIGINS`,
  with `PUBLIC_APP_URL` and `PUBLIC_ORCHESTRATOR_URL` as secondary entries
  when set.
- Resolve `BETTER_AUTH_URL` to the orchestrator's public hostname in
  production and to `http://localhost:4320` in dev.
- Surface the resolved `trustedOrigins` count and `baseURL` on `/readyz`.

**Non-Goals:**

- Wildcard origins (`*.unveiled.com`). Better Auth matches full origins only.
- Cookie domain rewriting. `AUTH_COOKIE_DOMAIN` already covers the prod case.
- Email verification or any other auth feature beyond trusted origins +
  baseURL.

## Decisions

- **Resolve `trustedOrigins` and `baseURL` at request time, not at module
  load.** Better Auth instances are created per-request inside
  `authMiddleware()` so reading from the runtime env at that point lets the
  Cloudflare dashboard rotate secrets/origins without redeploying. An
  export-time `auth = createAuth()` still exists for non-request callers (SSR
  pages); it uses `process.env` as a degraded fallback.
- **Always append the dev fallback set** (`localhost:4320`, `127.0.0.1:4320`,
  `localhost:8787`) regardless of environment. In production the env-supplied
  list covers the real origins and the fallback set is harmless (no browser
  reaches prod with `localhost:4320`).
- **Deduplicate** the resolved list with a `Set` so multiple env paths that
  collapse to the same URL do not produce duplicates.
- **Log the resolved `baseURL` once at startup** through the structured logger
  (see `packages/api/src/logger.ts`) so misconfiguration shows up in
  `wrangler tail`.
- **Expose `trustedOriginsCount` and `baseUrl` from `getSecretReadiness`.**
  The function is the single source of truth for `/readyz`; adding the fields
  here propagates them to every readiness consumer (orchestrator, app, parity
  tests) without touching individual call sites.

## Risks / Trade-offs

- **A misconfigured production env could leave the prod Worker trusting
  `localhost:4320`** → mitigated by `/readyz` asserting
  `trustedOrigins >= 1` and by the readiness payload also reporting
  `baseUrl` so operators can spot-check.
- **Comma-separated env parsing breaks if an origin contains a comma** →
  none of our origins contain commas; documented in `docs/auth.md`.
- **Export-time `auth = createAuth()` reads `process.env` only** → in Workers
  that path resolves to `{}` and the resolver falls back to the dev set,
  which is harmless for SSR pages that only verify the cookie (no origin
  check) and would only matter if a page-level handler invoked
  `signInEmail` directly. Documented in `docs/auth.md`.

## Migration Plan

- Land the resolver behind the existing `authMiddleware()` path. No
  environment change required for dev — login from `http://localhost:4320`
  starts working immediately.
- Add the new vars to `wrangler.app.toml` / `wrangler.api.toml` with empty
  defaults. Operators populate them via the Cloudflare dashboard.
- Roll back by reverting `createAuth` to the previous two-field form; no
  schema migration required.