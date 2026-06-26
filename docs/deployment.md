# Deployment

## Production env contract

Every key in `PRODUCTION_ENVS` (defined in `packages/api/src/env.ts`) MUST be declared under `[env.production.vars]` in the matching `wrangler.*.toml`, or documented as a Cloudflare secret. The `wrangler:check-env` script enforces this on every CI run.

| Key | Type | Where it's required |
| --- | --- | --- |
| `DATABASE_URL` | vars | `wrangler.api.toml` |
| `BETTER_AUTH_SECRET` | Cloudflare secret | `wrangler.api.toml` |
| `BETTER_AUTH_URL` | vars | `wrangler.api.toml` |
| `STRIPE_SECRET_KEY` | Cloudflare secret | `wrangler.api.toml` |
| `RESEND_API_KEY` | Cloudflare secret | `wrangler.api.toml` |
| `PUBLIC_ASSET_BASE_URL` | vars | `wrangler.api.toml`, `wrangler.app.toml`, `wrangler.landing.toml` |
| `AUTH_COOKIE_DOMAIN` | vars | `wrangler.api.toml`, `wrangler.app.toml` |
| `PUBLIC_ORCHESTRATOR_URL` | vars | `wrangler.app.toml`, `wrangler.landing.toml` |

The per-file map lives in `PRODUCTION_ENVS_BY_FILE` (same source file). To add a new production env:

1. Append the key to `PRODUCTION_ENVS` in `packages/api/src/env.ts`.
2. Add the key to `PRODUCTION_ENVS_BY_FILE` for each `wrangler.*.toml` that needs it.
3. If the value is a secret (not safe to log), append it to `PRODUCTION_SECRETS`.
4. Add the `[env.production.vars]` entry (or Cloudflare secret) to the corresponding `wrangler.*.toml`.
5. Run `bun run wrangler:check-env` to verify.

## Readiness probe contract

The orchestrator Worker (`packages/orchestrator/src/worker.ts`) owns the public `/healthz` and `/readyz` surfaces.

- `GET /healthz` returns `200` with body `"ok"` whenever the Worker can respond. No downstream is probed.
- `GET /readyz` calls the API Worker's `/api/readiness.json` via service binding, plus `/app/_health` and `/_health`. It returns `200` only when every surface is reachable AND (when `READINESS_PROBE_V2=1`) every per-probe check is green; otherwise `503` with a `failing: string[]` array listing the failing surface or probe.

### Probe shape (V2)

When `READINESS_PROBE_V2=1` is set on the API Worker, `/api/readiness.json` returns:

```json
{
  "ok": true,
  "status": "ready",
  "probes": {
    "database": { "ok": true },
    "auth": { "ok": true, "trustedOriginsCount": 5, "baseUrl": "https://auth.example.com" },
    "stripe": { "ok": true, "accountId": "acct_xxx", "cacheTtlMs": 60000 },
    "assets": { "ok": true, "hasBucket": true }
  }
}
```

When any probe fails, the response is `503` with `failing: ["database"]` (or whichever probes failed) and `probes.<name>.error` set to a non-secret message.

### Cache

The Stripe probe (`accounts.retrieve()`) is cached for 60 s in a module-scoped `Map` so repeated `/readyz` polls do not exhaust Stripe rate limits. The database and asset probes are not cached — a cold DB connection or an empty bucket is the failure mode we want to detect.

### Rollout

`READINESS_PROBE_V2` defaults off. To enable:

1. Set `READINESS_PROBE_V2=1` on the API Worker in Cloudflare preview.
2. Verify `curl https://<preview>/api/readiness.json` returns the V2 shape with all four probes green.
3. Verify `curl https://<preview>/readyz` returns `200`.
4. Promote the same env to production. Monitor `/readyz` for 24 h before removing the flag from the default path.
5. Roll back by setting `READINESS_PROBE_V2=0`.

## Validation

- `bun run wrangler:check-env` — fails if any `PRODUCTION_ENVS` key is missing from `wrangler.*.toml`.
- `GET /healthz` — returns `200 ok` on every Worker.
- `GET /readyz` — returns `200` only when every surface and every probe is green.
- `GET /readyz` body — `failing: []` on success; lists failing surfaces and probes on `503`.