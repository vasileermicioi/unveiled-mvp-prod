## Why

After a successful login the API Worker creates a Better Auth session, but the Hono
route handler returns a fresh `Response` from `c.json(...)` that discards the
`Set-Cookie` headers Better Auth issued. The Astro login form then navigates to
`/app` with no session cookie, the middleware resolves the request as a guest,
and the user lands on the login page again — or stares at a frozen loading
spinner while the browser silently fails to redirect.

## What Changes

- Forward Better Auth's `Set-Cookie` headers from every `/api/account/*` Hono
  handler so the browser actually receives the session cookie on login,
  signup, and logout.
- Replace the pending `Button` state on the auth landing form with a dedicated
  redirecting terminal state that renders a manual "Continue" link if the
  browser blocks programmatic navigation.
- Cover the success / invalid-credentials / blocked-cookie paths with a
  gherkin feature + Ladle harness under `tests/features/auth/login-redirect/`
  so the redirect can never silently regress.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `auth`: the existing `Better Auth Email Password Flow` requirement gains
  scenarios that pin the `Set-Cookie` round-trip on login, signup, and
  logout; a new `Redirect After Login Reaches A Real Session` requirement
  pins the client terminal state and the fallback "Continue" link.

## Impact

- `packages/api/src/routes/account/index.ts` — merge Better Auth headers into
  the JSON response instead of throwing them away.
- `packages/api/src/auth-account-actions.ts` — small
  `headersToResponseInit(headers)` helper so route handlers can spread the
  headers/status literal.
- `packages/app/src/components/unveiled/visual-system-app.tsx` — replace the
  pending button state with a `StatePanel` redirecting terminal state and a
  1.5 s fallback "Continue" link.
- `packages/api/src/routes/account/index.test.ts` — new in-process Hono test
  asserting the login response carries `better-auth.session_token`.
- `tests/features/auth/login-redirect/{feature.feature,login-form.ladle.tsx}` —
  new gherkin parity coverage.
- `openspec/specs/auth/spec.md` — append three new scenarios under
  `Better Auth Email Password Flow` and add one new requirement.
- `docs/auth.md` — one-paragraph note explaining the `Set-Cookie` round-trip
  and the `AUTH_COOKIE_DOMAIN` invariant from proposal 06.