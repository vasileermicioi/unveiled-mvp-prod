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