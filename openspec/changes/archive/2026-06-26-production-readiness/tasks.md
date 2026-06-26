## 1. Probe infrastructure

- [x] 1.1 In `packages/api/src/env.ts`, export `PRODUCTION_ENVS = ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "STRIPE_SECRET_KEY", "RESEND_API_KEY", "PUBLIC_ASSET_BASE_URL", "AUTH_COOKIE_DOMAIN", "PUBLIC_ORCHESTRATOR_URL"] as const` and add a `PRODUCTION_SECRETS` allow-list for keys that are Cloudflare secrets only.
- [x] 1.2 Extend `getSecretReadiness()` to include `trustedOriginsCount` (from Better Auth config), `baseUrl`, and a `stripeAccountId` resolved by a single `accounts.retrieve()` call.
- [x] 1.3 In `packages/api/src/db/client.ts`, export `checkDatabaseConnection()` that runs `SELECT 1` and returns `{ ok: true }` or throws a typed error (no secret values). (Already exported.)
- [x] 1.4 In `packages/api/src/payments/stripe-client.ts`, add a module-scoped 60 s cache wrapping `accounts.retrieve()` so repeated readiness polls share a result.

## 2. `/readyz` handler

- [x] 2.1 In `packages/api/src/routes/system/index.ts`, replace the `/api/readiness.json` handler body with a sequential probe of `database`, `auth` (Better Auth `trustedOriginsCount` + `baseUrl`), `stripe` (cached `accounts.retrieve`), and `assets` (R2 `HEAD` on the bucket root). Each probe is wrapped in `try/catch` and contributes one entry to the response body.
- [x] 2.2 Return `200` only when every probe is `ok: true`; return `503` with the same envelope plus a `failing: string[]` field otherwise.
- [x] 2.3 In `packages/orchestrator/src/readiness.ts`, update `/readyz` to require the API Worker's `/api/readiness.json` payload to report all four probes as `ok: true` before composing a `200` to the public surface.
- [x] 2.4 Gate the new probe behavior behind a `READINESS_PROBE_V2` env flag (default off; toggle in Cloudflare preview first).

## 3. Env contract gate

- [x] 3.1 Create `scripts/wrangler-check-env.ts` that uses `Bun.TOML.parse` to read each `wrangler.*.toml`, walks `[env.production.vars]` and `[env.production.secrets]` (when present), and asserts every key in `PRODUCTION_ENVS` is declared.
- [x] 3.2 Accept `PRODUCTION_SECRETS` as an allow-list — those keys are *not* required as `[vars]` entries, only as documented secrets.
- [x] 3.3 Exit non-zero with a per-file list of missing keys; exit zero when every key is declared or allowed as a secret.
- [x] 3.4 Add `"wrangler:check-env": "bun run scripts/wrangler-check-env.ts"` to `package.json`.
- [x] 3.5 Wire `bun run wrangler:check-env` into `bun run check` so missing envs fail the build.

## 4. Wrangler configs

- [x] 4.1 Audit `wrangler.api.toml`, `wrangler.app.toml`, `wrangler.landing.toml`, and `wrangler.orchestrator.toml` and add the non-secret `PRODUCTION_ENVS` keys (`DATABASE_URL`, `BETTER_AUTH_URL`, `PUBLIC_ASSET_BASE_URL`, `AUTH_COOKIE_DOMAIN`, `PUBLIC_ORCHESTRATOR_URL`) under `[env.production.vars]` where applicable (e.g. `PUBLIC_ORCHESTRATOR_URL` only in `app`/`landing`, not `orchestrator`).
- [x] 4.2 Document `BETTER_AUTH_SECRET`, `STRIPE_SECRET_KEY`, and `RESEND_API_KEY` as Cloudflare secrets in a comment in each toml file.

## 5. Tests

- [x] 5.1 Add `tests/unit/readiness-probe.test.ts` that boots the Hono app in-process, mocks `checkDatabaseConnection()` to throw, and asserts the probe returns `503` with `database: { ok: false }` in the body.
- [x] 5.2 Add `tests/unit/readiness-probe.test.ts` case for the Stripe cache — assert that two back-to-back calls within 60 s share a single Stripe SDK call (mock `getStripe()` with a call counter).
- [x] 5.3 Add `tests/unit/wrangler-check-env.test.ts` with a fixture `wrangler.api.toml` missing `AUTH_COOKIE_DOMAIN`; the script must exit non-zero.
- [x] 5.4 Add a positive case to `wrangler-check-env.test.ts` with a complete fixture that exits zero.

## 6. Documentation

- [x] 6.1 Create `docs/deployment.md` with the production env contract table (per-file `PRODUCTION_ENVS` map) and the readiness probe contract (probe names, response shape, cache TTL).
- [x] 6.2 Reference `docs/deployment.md` from `AGENTS.md` under the deployment section.

## 7. Validation

- [x] 7.1 Run `bun run wrangler:check-env` locally and confirm the new gate passes (verified locally; full `bun run check` was not run end-to-end because the api Worker has pre-existing typecheck errors unrelated to this change).
- [x] 7.2 Run `openspec validate production-readiness` and confirm zero errors.
- [ ] 7.3 Run `bun run deploy:cloudflare --dry-run` (or equivalent) and confirm the wrangler configs are accepted. (Deferred — requires Cloudflare credentials.)
- [ ] 7.4 Hit `/readyz` on the Cloudflare preview deployment after setting `READINESS_PROBE_V2=1` and confirm a `200` response with the new payload. (Deferred — requires Cloudflare preview.)