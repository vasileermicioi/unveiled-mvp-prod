## 1. Resolver

- [x] 1.1 In `packages/api/src/middleware/auth.ts`, implement
      `resolveTrustedOrigins(runtimeEnv): string[]` that:
      - parses `BETTER_AUTH_TRUSTED_ORIGINS` (comma-separated) and splits +
        trims;
      - appends `PUBLIC_APP_URL` and `PUBLIC_ORCHESTRATOR_URL` when set;
      - appends the dev fallback list (`http://localhost:4320`,
        `http://127.0.0.1:4320`, `http://localhost:8787`);
      - dedupes the result with a `Set` and returns an array.
- [x] 1.2 In the same file, implement `resolveBaseURL(runtimeEnv): string`
      that returns
      `BETTER_AUTH_URL ?? PUBLIC_BETTER_AUTH_URL ?? PUBLIC_ORCHESTRATOR_URL
      ?? "http://localhost:4320"`.
- [x] 1.3 Wire both into `createAuth(env)` so the `betterAuth(...)` options
      object carries `trustedOrigins` and `baseURL` on every instance
      created through `authMiddleware()`.
- [x] 1.4 Emit a single structured `info` log line on the first
      `createAuth()` call per request carrying the resolved `baseURL` (use
      the existing `packages/api/src/logger.ts`).

## 2. Env contract

- [x] 2.1 In `packages/api/src/env.ts`, extend `ApiEnv` with
      `BETTER_AUTH_TRUSTED_ORIGINS?` and `PUBLIC_ORCHESTRATOR_URL?`.
- [x] 2.2 In `wrangler.app.toml` and `wrangler.api.toml`, declare the two
      new env vars under `[env.production.vars]` with empty defaults
      (Cloudflare sets the real values via the dashboard).
- [x] 2.3 Update `.env.example` (create if absent) with the two new vars and
      a `PUBLIC_ORCHESTRATOR_URL=http://localhost:4320` dev default.

## 3. Readiness probe

- [x] 3.1 In `packages/api/src/env.ts`, extend `getSecretReadiness` to also
      return `trustedOrigins: number` and `baseUrl: string` using the new
      resolvers.
- [x] 3.2 If `packages/app/src/lib/env.ts` re-exports or duplicates
      `getSecretReadiness`, mirror the new fields so app-side readiness
      payloads stay consistent.
- [x] 3.3 Confirm `/readyz` (orchestrator) returns the new fields by
      reading `packages/orchestrator/src/readiness.ts`; no orchestrator
      change needed if it forwards `getSecretReadiness` verbatim. The
      `/api/readiness.json` payload now includes `trustedOrigins`,
      `baseUrl`, and `authSecret`.

## 4. Tests

- [x] 4.1 Add `tests/unit/auth-trusted-origins.test.ts` with the four
      scenarios from the auth spec (dev fallback, env override, production
      baseURL, dev baseURL).
- [x] 4.2 Add `tests/features/auth/trusted-origins/feature.feature` that
      drives a Playwright login from `http://localhost:4320` and asserts
      no `please add to trustedOrigins` console warning is emitted.
- [x] 4.3 Add a unit test for `getSecretReadiness` that asserts
      `trustedOrigins >= 1` in every fixture and `baseUrl` is the resolved
      orchestrator URL when one is set.

## 5. Documentation

- [x] 5.1 Create `docs/auth.md` with the env contract, the resolver logic,
      and a "rotation playbook" section explaining what to change when the
      production hostname rotates.
- [x] 5.2 If `AGENTS.md` needs an entry for the new env vars (it does not
      currently), add a one-line note under the auth bullet.