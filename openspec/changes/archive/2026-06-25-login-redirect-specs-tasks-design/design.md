## Context

The Astro login page posts JSON to `/api/account/login`. Better Auth creates a session inside the API Worker and returns headers; the Hono handler must forward those headers to the browser, or the cookie is never set. Currently the handler returns a fresh `Response` from `c.json(...)` that throws the `Set-Cookie` headers away.

Once the cookie is restored, the auth landing form (`visual-system-app.tsx`) needs a deterministic terminal state. Today it parks the submit `Button` in a `loading` state and calls `window.location.assign(nextPath)` with no fallback, so any browser that blocks programmatic navigation (or any race where the cookie is not yet visible to the middleware) leaves the user staring at a frozen spinner.

## Goals / Non-Goals

**Goals:**

- Restore the session cookie to the browser on every account-action route (`login`, `signup`, `logout`).
- Surface a deterministic terminal state on the client so the user never sees a frozen spinner after a successful login.
- Provide a gherkin + Ladle regression net so the redirect cannot silently regress.

**Non-Goals:**

- Email verification, password recovery emails (separate proposals).
- Refactoring the auth landing form out of `visual-system-app.tsx` (tracked by iteration 13 proposal 07's migration backlog).
- Changing the Better Auth cookie name or domain (governed by `AUTH_COOKIE_DOMAIN` from proposal 06).

## Decisions

- **Merge headers via `new Headers(result.headers)` then set `content-type`,** rather than overwriting or splicing `Headers.prototype`. Hono's `c.json(body, status, headers)` accepts a `Headers` instance as the third argument, so this keeps the existing `Set-Cookie` array intact and only normalizes the content-type.
- **Centralize the merge in `headersToResponseInit(headers)`** in `packages/api/src/auth-account-actions.ts`, returning `{ headers, status }` so route handlers can spread it. This keeps the merge logic in one place and makes the in-process Hono test in `index.test.ts` straightforward.
- **Render a `StatePanel` for the redirecting state, not a `Button`,** because the user must not be able to click "submit" again mid-redirect. The `StatePanel` uses `state="loading"` with title "Redirecting…" so the visual language matches the rest of the design system.
- **Add a 1.5 s `setTimeout` fallback** that, if `window.location.assign` hasn't fired, renders a manual `<a href={nextPath}>Continue</a>` inside the `StatePanel`. The fallback is cheap insurance against browsers that block cross-origin programmatic navigation. The production cookie domain (proposal 06) will make this rare, but the fallback must exist.
- **Cover the round-trip with both a Hono in-process unit test and a Playwright gherkin parity test.** The Hono test pins the API contract (`better-auth.session_token` cookie present); the Playwright test pins the end-to-end user-visible behavior (login → redirect → member shell renders).

## Risks / Trade-offs

- **Duplicate `Set-Cookie` headers if Better Auth emits more than one** (e.g. `better-auth.session_token` + `__Secure-…`) → The merging strategy keeps all entries because `Headers.append` is a set-coalescing primitive that preserves multiple values; the in-process test asserts "at least one" `set-cookie` containing `better-auth.session_token` rather than exactly one.
- **Race between `window.location.assign` and the cookie write** → The form reads the cookie as soon as the response body arrives; the middleware looks at the request `Cookie` header on the next navigation. Cloudflare Workers run in the same region as the browser origin, so the cookie write is effectively synchronous from the middleware's point of view. The 1.5 s fallback covers the worst case.
- **`/api/account/*` Hono handlers may diverge from `/api/auth/*` Better Auth handlers** → Both paths now share `headersToResponseInit`, so any future route under either prefix can adopt the same merge pattern with one import.
- **Test flakes from blocked-cookie scenarios** → The Ladle harness will use a `BlockedCookieStory` that mocks `window.location.assign` to a no-op and asserts the manual "Continue" link appears within the 1.5 s window, avoiding any timing flake.