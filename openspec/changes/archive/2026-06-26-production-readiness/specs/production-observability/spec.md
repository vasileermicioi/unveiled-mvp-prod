## MODIFIED Requirements

### Requirement: Secret Readiness Probe

The readiness endpoint SHALL report the resolved Better Auth configuration alongside the existing secret readiness flags so operators can confirm at runtime that trusted origins and the `baseURL` are wired correctly for the active environment. After this change, `getSecretReadiness` MUST include `trustedOrigins` (number) and `baseUrl` (string) in addition to the existing boolean flags; the readiness payload returned from `GET /readyz` MUST reflect those fields AND SHALL expose a per-probe breakdown of downstream reachability (`database`, `auth`, `stripe`, `assets`) so that a single failing dependency surfaces in the response body without leaking secret values.

#### Scenario: Readiness reports trustedOrigins count and baseURL

- **WHEN** a GET request hits `/readyz`
- **THEN** the response body includes `trustedOrigins: number`, `baseUrl: string`, and the existing boolean `authSecret`
- **AND** `trustedOrigins` is at least 1 in every environment

#### Scenario: Database is reachable

- **WHEN** the readiness probe runs and `SELECT 1` returns a row
- **THEN** the `database` entry in the response body is `{ ok: true }`

#### Scenario: Database is unreachable

- **WHEN** the readiness probe runs and `SELECT 1` throws
- **THEN** the probe returns `503`
- **AND** the response body lists `database: { ok: false, error: "…" }` with no secret values

#### Scenario: Stripe account is reachable

- **WHEN** the readiness probe runs and `getStripe().accounts.retrieve()` returns a non-error response
- **THEN** the `stripe` entry in the response body is `{ ok: true, accountId }`

#### Scenario: Stripe account lookup is cached

- **WHEN** the readiness probe is hit a second time within 60 seconds
- **THEN** the Stripe API is not called again and the cached `accountId` is returned

#### Scenario: Asset bucket is reachable

- **WHEN** the readiness probe runs and a `HEAD` request on the configured R2 bucket succeeds
- **THEN** the `assets` entry in the response body is `{ ok: true }`

#### Scenario: Any probe fails

- **WHEN** any of `database`, `auth`, `stripe`, or `assets` returns `{ ok: false }`
- **THEN** the probe returns `503`
- **AND** the response body lists every failing probe with its error message