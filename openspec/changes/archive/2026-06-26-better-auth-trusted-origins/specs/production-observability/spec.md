## ADDED Requirements

### Requirement: Secret Readiness Probe

The readiness endpoint SHALL report the resolved Better Auth configuration alongside the existing secret readiness flags so operators can confirm at runtime that trusted origins and the `baseURL` are wired correctly for the active environment. After this change, `getSecretReadiness` MUST include `trustedOrigins` (number) and `baseUrl` (string) in addition to the existing boolean flags; the readiness payload returned from `GET /readyz` MUST reflect those fields.

#### Scenario: Readiness reports trustedOrigins count and baseURL

- **WHEN** a GET request hits `/readyz`
- **THEN** the response body includes `trustedOrigins: number`, `baseUrl: string`, and the existing boolean `authSecret`
- **AND** `trustedOrigins` is at least 1 in every environment