## ADDED Requirements

### Requirement: Cloudflare Auth Runtime
The app SHALL run Better Auth session creation, session clearing, cookie handling, and viewer hydration correctly in Cloudflare preview and production environments.

#### Scenario: Preview login establishes session
- **WHEN** a user logs in through a Cloudflare preview deployment with valid credentials
- **THEN** Better Auth creates a session cookie scoped to the preview origin
- **AND** subsequent server-rendered requests resolve the authenticated viewer.

#### Scenario: Production login establishes session
- **WHEN** a user logs in through the production Cloudflare deployment with valid credentials
- **THEN** Better Auth creates a session cookie scoped to the production origin
- **AND** subsequent server-rendered requests resolve the authenticated viewer.

#### Scenario: Logout clears Cloudflare session
- **WHEN** an authenticated user logs out from preview or production
- **THEN** Better Auth clears the session cookie for the active origin
- **AND** subsequent server-rendered requests resolve a guest viewer.

### Requirement: Auth Environment Configuration
The app SHALL configure Better Auth URL, public auth URL, app URL, and auth secret per local, preview, and production environment.

#### Scenario: Required auth secret is missing
- **WHEN** a Cloudflare runtime handles an auth request without `BETTER_AUTH_SECRET`
- **THEN** the request fails safely and health/readiness reports a configuration failure without exposing secret values.

#### Scenario: Auth URL matches deployment origin
- **WHEN** Better Auth creates redirects, callbacks, or cookies in preview or production
- **THEN** it uses the configured URL for that environment rather than a localhost or Firebase origin.

#### Scenario: Public auth URL is exposed to client code
- **WHEN** client code needs an auth endpoint origin
- **THEN** it reads only the public auth URL value and never receives `BETTER_AUTH_SECRET`.
