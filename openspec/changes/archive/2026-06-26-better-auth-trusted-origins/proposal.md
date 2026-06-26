## Why

Better Auth logs `If it's a valid URL, please add <origin> to trustedOrigins`
whenever the Astro middleware proxy invokes `/api/auth/*` from a host that the
API Worker's Better Auth instance has not whitelisted. The login flow hangs as
a result: dev proxies request `http://localhost:4320`, while
`packages/api/src/middleware/auth.ts` only configures `baseURL` and `secret`.
There is also no `PUBLIC_ORCHESTRATOR_URL` for production, so the resolved
`BETTER_AUTH_URL` cannot match the orchestrator's public hostname. Both issues
are production-blocking.

## What Changes

- Add a typed `trustedOrigins` resolver to `createAuth(env)` that, in order,
  accepts a comma-separated `BETTER_AUTH_TRUSTED_ORIGINS` env var and falls
  back to `[PUBLIC_APP_URL, PUBLIC_ORCHESTRATOR_URL, http://localhost:4320,
  http://127.0.0.1:4320, http://localhost:8787]`.
- Add a `BETTER_AUTH_URL` invariant that resolves to the orchestrator's public
  hostname in production and to `http://localhost:4320` in dev, with the
  resolved value logged once on startup so misconfiguration is visible in
  `wrangler tail`.
- Surface the resolved config on `/readyz` (proposal 09): include
  `trustedOriginsCount`, `baseUrl`, and the existing `authSecret` boolean so
  operators can confirm at runtime.
- Document the env contract in `docs/auth.md` and declare the new vars in
  `wrangler.app.toml` / `wrangler.api.toml` with empty defaults so Cloudflare
  can override them via the dashboard without redeploys.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `auth`: extend the **Better Auth Email Password Flow** requirement so Better
  Auth is configured with an explicit `trustedOrigins` list resolved at request
  time from env vars plus a dev fallback set, and a `baseURL` that defaults to
  the orchestrator's public hostname in production.
- `production-observability`: extend the **Secret Readiness Probe** requirement
  so the readiness payload reports `trustedOriginsCount`, `baseUrl`, and the
  existing `authSecret` boolean (already present via `getSecretReadiness`).

## Impact

- **Touched files:**
  - `packages/api/src/middleware/auth.ts` — add `resolveTrustedOrigins` and
    `resolveBaseURL`; wire both into `createAuth`; emit a startup log line.
  - `packages/api/src/env.ts` — extend `ApiEnv` with
    `BETTER_AUTH_TRUSTED_ORIGINS?` and `PUBLIC_ORCHESTRATOR_URL?`; extend
    `getSecretReadiness` with `trustedOriginsCount` and `baseUrl`.
  - `packages/app/src/lib/env.ts` — keep `getSecretReadiness` consistent if it
    re-exports or duplicates the API version.
  - `wrangler.app.toml`, `wrangler.api.toml` — declare the new env vars under
    `[env.production.vars]` with empty defaults.
  - `.env.example` — document the new vars with dev defaults.
  - `docs/auth.md` (new) — env contract + rotation playbook.
- **Tests:**
  - `tests/unit/auth-trusted-origins.test.ts` — resolver + baseURL behavior.
  - `tests/features/auth/trusted-origins/feature.feature` — gherkin parity
    scenario that logs in from `http://localhost:4320` and asserts no
    `trustedOrigins` console warning.
- **TypeSpec:** no contract changes; `/readyz` schema gains two optional
  fields. Update `typespec/` if the change script requires it.