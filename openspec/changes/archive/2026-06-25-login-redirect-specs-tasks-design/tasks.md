## 1. API route header propagation

- [x] 1.1 In `packages/api/src/routes/account/index.ts`, change each `c.json(responseBody, status)` call to clone `result.headers` into a new `Headers` object, set the `content-type: application/json` header, and use that Headers object when calling `c.json(...)`.
- [x] 1.2 In `packages/api/src/auth-account-actions.ts`, add a small helper `headersToResponseInit(headers)` that returns a `{ headers, status }` literal so the route handlers can spread it.
- [x] 1.3 Add `packages/api/src/routes/account/index.test.ts` that boots the Hono app in-process, posts to `/api/account/login` with a seeded Better Auth user, and asserts the response has at least one `set-cookie` header containing `better-auth.session_token`.

## 2. Form terminal state

- [x] 2.1 In `packages/app/src/components/unveiled/visual-system-app.tsx`, add a new local state `redirecting: boolean` that flips to `true` immediately after a successful action result that contains a `nextPath`.
- [x] 2.2 Replace the pending `Button` `loading` state with a `redirecting` `StatePanel` (`state="loading"`, title "Redirecting…") so the UI no longer appears frozen.
- [x] 2.3 Add a 1.5 s `setTimeout` fallback that, if `window.location` hasn't fired, renders a manual "Continue" link (`<a href={nextPath}>`) inside the `StatePanel`.

## 3. Middleware check

- [x] 3.1 Add `tests/features/auth/login-redirect/feature.feature` with three `Scenario:` blocks: success, invalid credentials, blocked cookie. The blocked-cookie scenario asserts the form falls back to the manual "Continue" link instead of hanging.
- [x] 3.2 Add the matching `tests/features/auth/login-redirect/login-form.ladle.tsx` Ladle harness with three stories referenced by `@ladle(component="login-form", story="success" | "invalid" | "blocked-cookie")`.
- [x] 3.3 Wire `bun run test:e2e` to find the new directory and run it under Playwright against the orchestrator's port-4320 proxy.

## 4. Documentation

- [x] 4.1 Update `openspec/specs/auth/spec.md` with the three new scenarios from §"Scenario: …" above.
- [x] 4.2 Add a one-paragraph note to `docs/auth.md` (create if absent) explaining the `Set-Cookie` round-trip and the `AUTH_COOKIE_DOMAIN` invariant from proposal 06.