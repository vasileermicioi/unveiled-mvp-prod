## ADDED Requirements

### Requirement: Public Map Provider Configuration
The app SHALL expose only browser-safe map provider configuration values and keep map secrets out of server-only output.

#### Scenario: Client reads public configuration
- **WHEN** discovery renders an interactive map in the browser
- **THEN** the client reads only `PUBLIC_` map provider values or another explicitly browser-safe configuration surface

#### Scenario: Missing provider config fails safely
- **WHEN** map provider configuration is missing or invalid
- **THEN** startup, route rendering, or health reporting returns a safe configuration failure or visible fallback without exposing secret values

#### Scenario: Secret values remain hidden
- **WHEN** logs, build output, client bundles, or health responses are inspected
- **THEN** map provider secrets and authorization headers are absent
