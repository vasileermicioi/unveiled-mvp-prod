# Authentication round-trip

Better Auth runs inside `@unveiled/api` and is the source of truth for
identity, sessions, and cookies. The Astro app routes every
`/api/auth/*` request through a Cloudflare service binding
(`env.API.fetch(request)`) and the same binding carries every
`/api/account/*` action — login, signup, logout, and password recovery.

## `Set-Cookie` round-trip

When a request hits a Hono handler under `/api/account/*`, the handler
delegates to one of the typed actions in
`packages/api/src/auth-account-actions.ts`
(`loginWithEmail`, `signUpWithEmail`, `logout`). Better Auth returns a
`Response` whose headers include the `better-auth.session_token` (or
its `AUTH_COOKIE_DOMAIN`-scoped equivalent). The handler must forward
those headers back to the browser, otherwise the session is created
inside the API Worker but never reaches the visitor. The helper
`headersToResponseInit(headers)` (also in
`auth-account-actions.ts`) clones the Better Auth headers into a
record, preserves every `set-cookie` value (including any
`__Secure-…` siblings), and ensures `content-type` is `application/json`.
The account route handlers spread the helper's return value into
Hono's `c.json(body, status, headers)` so the cookie write is
preserved end-to-end.

## `AUTH_COOKIE_DOMAIN` invariant

`AUTH_COOKIE_DOMAIN` (introduced in proposal 06) is the single
configured cookie scope. Better Auth sets it on every session cookie
it issues, and every Cloudflare Worker that reads the session — the
Astro app's SSR pages and the API Worker's Hono handlers — must read
the same cookie off the same origin. The round-trip above is only
correct when both sides agree on this domain, so changing
`AUTH_COOKIE_DOMAIN` is a coordinated change that touches the auth
profile, the Hono account routes, and the Astro middleware in lockstep.

## Unified auth landing form (proposal `unify-auth-landing`)

The public auth surface is a single form reachable from three URLs:

- `/<lang>/login` — initial mode `login`.
- `/<lang>/signup` — initial mode `signup`.
- `/<lang>/membership` — initial mode `signup`, rendered together
  with the marketing copy.

The form organism (`login-form` / `signup-form` in
`packages/design-system/src/organisms/auth/`) accepts a
`footerSlot: ReactNode` and an optional `onSwitchToLogin` callback
so the page that mounts it owns the in-form mode toggle. Clicking
"Already a member? Log in" or "Become a member" flips the active
mode without a navigation round-trip.

### Already-signed-in redirect

If a valid session cookie is present when a visitor requests
`/<lang>/login` or `/<lang>/signup`, the page server-side redirects
to the role-appropriate product surface via `getAuthRedirectPath`:

- `/<lang>/app` for `USER` (subject to onboarding enforcement).
- `/<lang>/admin` for `ADMIN`.
- `/<lang>/partner` for `PARTNER`.

The redirect happens in the Astro frontmatter before the React
island ever renders, so no client-side flicker of the auth form is
visible. The `LandingPage` React island additionally watches the
viewer context in a `useEffect` so cookies issued after the page
rendered (e.g. immediately after a sign-in redirect) still trigger
a client-side jump without a server round-trip.

### Public nav primary CTA

The public nav primary action in `createShellFromViewer`
(`packages/app/src/lib/auth-display.ts`) flips on viewer state:

- Guest → "Mitglied werden" / "Become a member" → `/<lang>/membership`.
- Authenticated → "App öffnen" / "Open app" →
  `/<lang>/<routePathFor(viewer.viewerContext)>`
  (`/app`, `/admin`, or `/partner`).

## Better Auth trusted origins + `baseURL` reliability

Better Auth refuses requests whose `Origin` header is not on a configured
trusted list, and it issues cookies/redirects against whatever `baseURL` it
was configured with. The API Worker therefore resolves both from environment
variables at request time so secret rotation via the Cloudflare dashboard
takes effect without a redeploy.

### Resolver contract

`packages/api/src/env.ts` exports `resolveTrustedOrigins(runtimeEnv)` and
`resolveBaseURL(runtimeEnv)`. Both run inside `createAuth(env)` for every
Better Auth instance built by `authMiddleware()`.

`trustedOrigins` (deduped, in order):

1. `BETTER_AUTH_TRUSTED_ORIGINS` — comma-separated full origins.
2. `PUBLIC_APP_URL` — included when set.
3. `PUBLIC_ORCHESTRATOR_URL` — included when set.
4. Dev fallback set (always appended): `http://localhost:4320`,
   `http://127.0.0.1:4320`, `http://localhost:8787`.

`baseURL` (first non-empty):

1. `BETTER_AUTH_URL`.
2. `PUBLIC_BETTER_AUTH_URL`.
3. `PUBLIC_ORCHESTRATOR_URL`.
4. `http://localhost:4320` (dev fallback).

### Local development

The `.env.example` defaults are enough to run `bun run dev`:

- `BETTER_AUTH_URL` and `PUBLIC_BETTER_AUTH_URL` point at the app surface
  (`http://localhost:4321`).
- `PUBLIC_ORCHESTRATOR_URL` points at the orchestrator dev proxy
  (`http://localhost:4320`).
- `BETTER_AUTH_TRUSTED_ORIGINS` is unset; the dev fallback set is appended
  automatically, so login from `http://localhost:4320` works without the
  "please add to trustedOrigins" warning.

### Production env contract

`wrangler.app.toml` and `wrangler.api.toml` declare
`BETTER_AUTH_TRUSTED_ORIGINS` and `PUBLIC_ORCHESTRATOR_URL` under
`[env.production.vars]` with empty defaults. Operators populate them via
the Cloudflare dashboard:

| Variable | Required | Example value |
| --- | --- | --- |
| `BETTER_AUTH_TRUSTED_ORIGINS` | yes | `https://app.unveiled.com,https://admin.unveiled.com` |
| `PUBLIC_ORCHESTRATOR_URL` | yes | `https://unveiled.com` |
| `BETTER_AUTH_URL` | optional | overrides `PUBLIC_ORCHESTRATOR_URL` for cookie/redirect origin |

The resolved config is logged once at startup
(`"better-auth resolved baseURL"`) and surfaced on `/api/readiness.json`
under `trustedOrigins`, `baseUrl`, and `authSecret`. Operators can confirm
the contract without a redeploy by `curl`-ing the readiness endpoint.

### Rotation playbook

When the production hostname rotates:

1. Update `BETTER_AUTH_TRUSTED_ORIGINS` to include the new origin
   (comma-separated; do not include wildcards — Better Auth matches full
   origins only).
2. Update `PUBLIC_ORCHESTRATOR_URL` to the new orchestrator hostname.
3. Leave `BETTER_AUTH_URL` unset unless the cookie origin must differ from
   the public hostname (rare).
4. `curl https://<orchestrator>/api/readiness.json` and confirm
   `baseUrl`, `trustedOrigins`, and `authSecret` reflect the new values.
5. Roll back by reverting the dashboard values; no redeploy is required
   because the resolver reads the env at request time.