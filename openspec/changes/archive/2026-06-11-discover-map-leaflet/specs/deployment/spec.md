## MODIFIED Requirements

### Requirement: Public Map Provider Configuration
The app SHALL expose only browser-safe map provider configuration values and keep map secrets out of server-only output. The discover page map SHALL run on an open tile provider and SHALL NOT require a `PUBLIC_` proprietary map API key.

#### Scenario: Client reads public configuration
- **WHEN** discovery renders an interactive map in the browser
- **THEN** the client reads only `PUBLIC_` map provider values or another explicitly browser-safe configuration surface
- **AND** no proprietary map provider API key is required to render the map

#### Scenario: Open tile provider is used
- **WHEN** the map mounts
- **THEN** it loads tiles from an open tile provider (such as CartoDB Voyager or OpenStreetMap) selected through a non-secret, browser-safe configuration value

#### Scenario: Missing provider config fails safely
- **WHEN** map provider configuration is missing or invalid
- **THEN** startup, route rendering, or health reporting returns a safe configuration failure or visible fallback without exposing secret values

#### Scenario: Secret values remain hidden
- **WHEN** logs, build output, client bundles, or health responses are inspected
- **THEN** map provider secrets and authorization headers are absent
