## MODIFIED Requirements

### Requirement: Better Auth Email Password Flow

The app SHALL use Better Auth for email/password identity, session creation, session clearing, and account recovery entry points through typed server-side form actions, and SHALL expose the signup, login, logout, and password-recovery forms as selector-disciplinable, accessible, and bilingual surfaces that route every user-facing string through the typed `AuthFormCopy` dictionary. The Better Auth HTTP handlers (`/api/auth/*`) SHALL be mounted inside `@unveiled/api` and SHALL be reached from the Astro app via the Cloudflare service binding declared in `wrangler.toml` (`binding = "API"`).

Every account-action HTTP response under `/api/account/*` SHALL forward the `Set-Cookie` headers that Better Auth's `signInEmail`, `signUpEmail`, and `signOut` handlers return, so the browser actually receives the session cookie (or its expiration) on login, signup, and logout.

#### Scenario: Visitor signs up

- **WHEN** a visitor submits valid signup data with email, password, first name, and last name through the signup action
- **THEN** Better Auth creates the identity (via the `@unveiled/api` HTTP handler, reached through the service binding in the Astro middleware short-circuit)
- **AND** the app creates a linked domain profile for that identity
- **AND** the action returns a success result with any viewer or query invalidation hints needed by the landing form.

#### Scenario: Auth handlers are reachable through the service binding

- **WHEN** a request arrives at `/api/auth/*` at the Astro app Worker
- **THEN** the middleware short-circuit invokes `env.API.fetch(request)` before any Astro guard runs
- **AND** the Better Auth handler inside the Hono app handles the request
- **AND** the response is returned to the caller unchanged
- **AND** no Astro catch-all shim under `src/pages/api/**` is involved

#### Scenario: Session cookie domain is shared across runtimes

- **WHEN** Better Auth issues a session cookie
- **THEN** the cookie's `Domain` attribute is set to `AUTH_COOKIE_DOMAIN`
- **AND** both the Astro app (SSR pages) and the API Worker (Hono handlers) read the same session cookie

#### Scenario: Account login response sets the Better Auth session cookie

- **WHEN** a member submits valid credentials to `/api/account/login`
- **THEN** the API response carries the `Set-Cookie` header(s) returned by Better Auth's `signInEmail` handler
- **AND** the cookie name matches Better Auth's session cookie (`better-auth.session_token` or the `AUTH_COOKIE_DOMAIN`-scoped equivalent)
- **AND** the response body remains valid JSON with `{ ok: true, state, nextPath }`

#### Scenario: Account signup response sets the Better Auth session cookie

- **WHEN** a visitor submits valid signup data to `/api/account/signup`
- **THEN** the API response carries the `Set-Cookie` header(s) returned by Better Auth's `signUpEmail` handler
- **AND** a domain profile is created for the new identity
- **AND** the response body remains valid JSON with `{ ok: true, state, nextPath }`

#### Scenario: Account logout response clears the session cookie

- **WHEN** an authenticated visitor submits a logout request to `/api/account/logout`
- **THEN** the API response carries `Set-Cookie` headers that expire Better Auth's session cookie
- **AND** the response body remains valid JSON with `{ ok: true, state, nextPath }`

## ADDED Requirements

### Requirement: Redirect After Login Reaches A Real Session

The auth landing form SHALL complete the post-login redirect using a session that the Astro middleware can resolve as `authenticated` on the very next navigation.

#### Scenario: Redirect to /app after login establishes a session

- **WHEN** a successful login response sets the session cookie
- **AND** the form navigates to the response-supplied `nextPath`
- **THEN** the Astro middleware resolves the request as `authenticated`
- **AND** the destination page renders the member shell

#### Scenario: Pending state never persists past a successful redirect

- **WHEN** the form receives a successful login response
- **THEN** the form renders a brief "redirecting…" terminal state for at most one render tick before navigation
- **AND** if `window.location.assign` is blocked by the browser, the form exposes a manual "Continue" link that navigates to `nextPath`