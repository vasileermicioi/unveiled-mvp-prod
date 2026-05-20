## ADDED Requirements

### Requirement: Admin Asset Upload Display Data
Admin event and partner display models SHALL expose the asset state needed to render upload controls, previews, and manual URL fallbacks.

#### Scenario: Event form displays current image state
- **WHEN** the admin event form renders for a new or existing event
- **THEN** display data includes the current image URL value, preview availability, upload control state, and manual URL fallback value

#### Scenario: Partner form displays current logo state
- **WHEN** the admin partner form renders for a new or existing partner
- **THEN** display data includes the current logo URL value, preview availability, upload control state, and manual URL fallback value

#### Scenario: Upload unavailable state is visible
- **WHEN** asset upload configuration or runtime support is unavailable
- **THEN** display data allows the UI to show a safe upload-unavailable state while keeping manual URL input available

#### Scenario: Uploaded preview updates without stale rows
- **WHEN** an upload succeeds and returns a display URL
- **THEN** the form preview and URL value update to the new uploaded asset without changing unrelated admin row data before save

#### Scenario: Failed upload displays safe error
- **WHEN** an upload fails validation, authorization, configuration, or storage
- **THEN** display data includes safe visible error text without exposing provider secrets, storage keys beyond returned public URLs, or stack traces
