## Context

`/healthz` is a liveness probe (Worker is up and able to respond). `/readyz` should gate traffic on the actual downstream readiness, not just on the Worker being able to respond — Cloudflare's default health checks accept `/healthz` but rolling deploys need a stronger gate so a Worker with a cold DB or a Stripe outage is not promoted to traffic.

`getSecretReadiness()` in `packages/api/src/env.ts` currently reports whether `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`, `RESEND_API_KEY`, and `PUBLIC_ASSET_BASE_URL` are present in `env`. It does not probe the database connection (a `SELECT 1`), the Stripe account lookup, or the asset bucket reachability. It also does not surface `trustedOriginsCount` or `baseUrl` from Better Auth.

The wrangler configs declare some vars but do not pin a contract. `AUTH_COOKIE_DOMAIN` is a particularly subtle case — without it in production, the session cookie's domain attribute silently drifts to the Worker's default host, breaking SSO across subdomains.

## Goals / Non-Goals

**Goals:**

- `/readyz` returns `503` when the database, Better Auth, Stripe, or assets are not reachable (not just when an env var is missing).
- The readiness payload exposes a per-probe breakdown so operators can see *which* downstream is failing without leaking secret values.
- `bun run check` fails if any production env var is missing from `wrangler.*.toml`.
- The production env contract is documented so reviewers can audit a deploy without reading code.

**Non-Goals:**

- Live-tail dashboards.
- Stripe webhook replay tooling.
- Per-tenant isolation of the readiness probe (one shared probe is sufficient).
- Replacing the Cloudflare health-check configuration (still uses `/healthz`).

## Decisions

- **Sequential probes, not parallel.** The database probe is the cheapest and most likely to fail. Running it first lets the probe short-circuit when the DB is cold. Parallel execution via `Promise.all` would have made the worst-case latency worse (sum of all probes vs. max of all probes when slow, but our slow probe — Stripe — is cached so the marginal cost is small).
- **Cache the Stripe probe for 60 s** in a module-scoped `Map<string, { at: number; result: unknown }>`. Without caching, every `/readyz` poll from Cloudflare (default 5 s interval) would consume ~12 Stripe API calls per minute per Worker, exceeding rate limits.
- **Asset probe = R2 `HEAD` on the bucket root.** Cheap, no body, returns headers (e.g. `content-length`) that confirm we have list/scan permission, not just connectivity.
- **TOML parsing via Bun.** Bun ships a TOML parser (`Bun.TOML.parse`) — no `toml` dependency. The script reads each `wrangler.*.toml`, walks the `[env.production.vars]` map, and asserts every key in `PRODUCTION_ENVS` is present (or documented as a Cloudflare secret).
- **Secret vs. vars distinction.** The `wrangler:check-env` script accepts a `--secrets` allow-list (`BETTER_AUTH_SECRET`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`) — these are *always* Cloudflare secrets in production, never `[vars]`, so the gate does not require them as `[env.production.vars]` entries.
- **`PRODUCTION_ENVS` lives in `packages/api/src/env.ts`** (the API Worker is the source of truth for env contracts; the orchestrator and Astro surfaces consume via service binding to `/api/readiness.json`).

### Alternatives considered

- **Run the probe in the orchestrator directly** via the Stripe SDK inlined into the orchestrator bundle. Rejected — couples the orchestrator to a Stripe dependency it shouldn't need, and duplicates the env contract.
- **Use Cloudflare Workers Analytics Engine** for readiness events. Rejected — adds a binding for a feature that does not need telemetry.
- **Make `/healthz` itself probe.** Rejected — `/healthz` is a liveness check; coupling it to downstreams causes the orchestrator to be killed by Cloudflare when a downstream is briefly cold, which is the opposite of what we want.

## Risks / Trade-offs

- **Stripe probe adds ~150 ms cold, ~5 ms warm (cache hit)** to `/readyz`. → Mitigated by 60 s module-scoped cache.
- **Database probe adds ~50 ms** to `/readyz`. → Mitigated by short-circuit: if the probe throws on connect, we never hit `SELECT 1`. Considered caching the DB probe result too; rejected because a cold DB connection is the failure mode we want to detect.
- **`wrangler:check-env` runs on every `bun run check`** — even locally — which could be annoying if a developer is iterating on a feature. → Mitigated by reading the *committed* `wrangler.*.toml`, not the developer's `.dev.vars`. A developer can still `bun run dev` without updating production vars.
- **`PRODUCTION_ENVS` is in `packages/api/src/env.ts`** but consumed by `packages/orchestrator/src/worker.ts` indirectly via the API Worker's `/api/readiness.json`. If the orchestrator needs the constant for its own checks, it must duplicate it (or import it from `@unveiled/api/src/env`). → Documented in `docs/deployment.md`.

## Migration Plan

1. Land `PRODUCTION_ENVS` and the extended `getSecretReadiness()` (no behavior change yet — additive).
2. Land the readiness probe extension behind a feature flag (`READINESS_PROBE_V2=1`). Default off in production until verified.
3. Land the `wrangler:check-env` script and wire it into `bun run check`. Fail the build locally if a developer removes a var from `wrangler.*.toml`.
4. Enable `READINESS_PROBE_V2=1` in Cloudflare preview; verify `/readyz` returns 200 with the new payload via `curl` from CI.
5. Roll to production. Monitor `/readyz` status codes for 24 h. Roll back by setting `READINESS_PROBE_V2=0`.

## Open Questions

- Should `PUBLIC_ORCHESTRATOR_URL` be a `[vars]` or a Cloudflare secret? Currently proposed as `[vars]` (it's public), but the orchestrator's own `wrangler.orchestrator.toml` cannot reference itself by URL — the var would be set in the app/landing/api configs only. Need to confirm before declaring the contract.
- The asset probe's exact path: do we `HEAD /` on the bucket, or `HEAD /__probe` (write a sentinel object at deploy time)? Going with `HEAD /` for now; can revisit.