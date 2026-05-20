## ADDED Requirements

### Requirement: Admin Asset Upload Runtime Configuration
Deployment configuration SHALL support authorized admin asset uploads in environments where upload controls are enabled.

#### Scenario: Local upload configuration is documented
- **WHEN** a developer runs the app locally or under parity smoke tests
- **THEN** the required asset storage binding or documented upload-unavailable fallback is available without exposing storage secrets to the browser

#### Scenario: Preview upload configuration is available
- **WHEN** a Cloudflare preview deployment enables admin upload controls
- **THEN** the asset bucket binding and public asset base URL are configured so uploaded event images and partner logos can be displayed

#### Scenario: Production upload configuration is available
- **WHEN** a production deployment enables admin upload controls
- **THEN** the asset bucket binding and public asset base URL are configured as required deployment secrets or bindings

#### Scenario: Missing upload configuration fails safely
- **WHEN** asset storage configuration is missing or invalid
- **THEN** admin upload attempts fail with safe visible errors
- **AND** manual remote URL fields remain usable when valid HTTPS URLs are provided

#### Scenario: Storage secrets are not exposed
- **WHEN** client bundles, logs, health responses, or action errors are inspected
- **THEN** storage credentials, private binding details, and provider authorization values are not exposed
