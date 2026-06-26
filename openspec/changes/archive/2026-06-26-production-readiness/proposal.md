## Why

`GET /healthz` only confirms the Worker is alive; it does not confirm that the database, Better Auth, Stripe, or the asset bucket are reachable. Cloudflare's health checks accept that, but rolling deploys need a stronger gate so a Worker with a cold database connection is never promoted to traffic. `getSecretReadiness()` in `packages/api/src/env.ts` currently only checks that env vars are *set*, not that the downstreams they point to actually answer. Separately, `wrangler.app.toml` and `wrangler.api.toml` declare some production vars but do not pin a contract — `AUTH_COOKIE_DOMAIN` is one example of a var whose absence in production silently drifts the session cookie domain.

## What Changes

- Extend `GET /readyz` (orchestrator) to call the API Worker's `/api/readiness.json` (via service binding) and gate on a sequential probe of database connection (`SELECT 1`), Better Auth configuration, Stripe account lookup, and asset bucket reachability. The probe returns `200` only when every downstream is green and `503` with a safe envelope listing the failing probe otherwise.
- Add a `PRODUCTION_ENVS` `readonly string[]` constant in `packages/api/src/env.ts` listing every var that MUST be present in production: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `PUBLIC_ASSET_BASE_URL`, `AUTH_COOKIE_DOMAIN`, `PUBLIC_ORCHESTRATOR_URL`. Extend `getSecretReadiness()` to also surface `trustedOriginsCount`, `baseUrl`, and the resolved `stripeAccountId`.
- Add a `wrangler:check-env` Bun script that parses every `wrangler.*.toml` and asserts every key in `PRODUCTION_ENVS` is declared under `[env.production.vars]` (or documented as a Cloudflare secret). Wire it into `bun run check` so a missing production env fails the build.
- Document the production env contract and the readiness probe contract in `docs/deployment.md` (create if absent).
- Cache the Stripe probe result for 60 s in a module-scoped `Map` so repeated readiness polls do not blow the Stripe rate budget.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `production-observability`: extend the **Secret Readiness Probe** requirement so the readiness payload exposes per-probe entries (`database`, `auth`, `stripe`, `assets`) with `{ ok, … }` shape, and the orchestrator's `/readyz` returns `503` when any probe fails.
- `deployment`: extend the **Health and Observability** requirement so the readiness probe covers database, Better Auth, Stripe, and asset bucket reachability (not just secret presence). Add a new requirement **Env Contract Is Enforced** that wires the `wrangler:check-env` script into `bun run check` and fails the build when any `PRODUCTION_ENVS` key is missing from `wrangler.*.toml`.

## Impact

- **Touched files:**
  - `packages/orchestrator/src/worker.ts` — replace `/readyz` body with sequential probes + cache layer.
  - `packages/api/src/routes/system/index.ts` — extend `/api/readiness.json` (or its composing module) to run the probes.
  - `packages/api/src/env.ts` — add `PRODUCTION_ENVS`, extend `getSecretReadiness()`.
  - `packages/api/src/db/client.ts` — export `checkDatabaseConnection()` if not already exported.
  - `packages/api/src/lib/stripe.ts` — add cached `accounts.retrieve()` helper.
  - `scripts/wrangler-check-env.ts` (new) — gate script using Bun's TOML parser.
  - `package.json` — wire `wrangler:check-env` into `bun run check`.
  - `wrangler.app.toml`, `wrangler.api.toml`, `wrangler.landing.toml`, `wrangler.orchestrator.toml` — declare the `PRODUCTION_ENVS` keys under `[env.production.vars]` (or document them as secrets).
  - `docs/deployment.md` (create) — production env contract + readiness probe contract.

- **No new dependencies.** Uses Bun's TOML parser and the existing Stripe SDK.

- **Runtime cost:** `/readyz` adds ~50 ms (database) + ~150 ms (Stripe, cached) per probe; cached for 60 s.