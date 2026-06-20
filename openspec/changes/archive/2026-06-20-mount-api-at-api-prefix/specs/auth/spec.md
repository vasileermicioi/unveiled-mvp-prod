## MODIFIED Requirements

### Requirement: Better Auth Email Password Flow

The app SHALL use Better Auth for email/password identity, session creation, session clearing, and account recovery entry points through typed server-side form actions, and SHALL expose the signup, login, logout, and password-recovery forms as selector-disciplinable, accessible, and bilingual surfaces that route every user-facing string through the typed `AuthFormCopy` dictionary. The Better Auth HTTP handlers (`/api/auth/*`) SHALL be mounted inside `@unveiled/api` and SHALL be reached from the Astro app via the Cloudflare service binding declared in `wrangler.toml` (`binding = "API"`).

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

### Requirement: Better Auth Is Mounted Inside The Hono App

The Better Auth HTTP handlers SHALL be mounted inside the Hono app at `/api/auth/*`. The Astro app SHALL keep its session-cookie verification for SSR pages and SHALL defer sign-in, sign-up, sign-out, password-recovery, and account endpoints to the API package. After this change, the Astro app no longer forwards these requests through a catch-all shim; it forwards them via the service binding.

#### Scenario: Better Auth handler is the source of truth

- **WHEN** a sign-in, sign-up, sign-out, password-recovery, or account request arrives at `/api/auth/*` at the Astro app Worker
- **THEN** the middleware short-circuit forwards it to `env.API.fetch(request)`
- **AND** the Better Auth handler inside `@unveiled/api` handles the request
- **AND** the Astro app's `src/lib/auth.ts` continues to expose Better Auth for SSR page handlers

#### Scenario: Astro app reads the same session cookie

- **WHEN** an SSR page in the Astro app resolves the authenticated viewer
- **THEN** Better Auth reads the session cookie from `AUTH_COOKIE_DOMAIN`
- **AND** the API Worker reads the same cookie for subsequent `/api/*` requests

#### Scenario: No Astro Better Auth endpoint exists

- **WHEN** the repository is inspected after the change is applied
- **THEN** no Astro page or endpoint exists under `src/pages/api/auth/**`
- **AND** `rg "/api/auth/" src/pages/api` returns no matches
