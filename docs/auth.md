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