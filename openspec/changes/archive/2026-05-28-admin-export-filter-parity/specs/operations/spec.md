## ADDED Requirements

### Requirement: Admin Operations UI Partner Export Filter
The admin panel SHALL provide an interactive "Export partner" dropdown menu to filter the CSV booking export by partner.

#### Scenario: Admin configures export partner and downloads CSV
- **WHEN** an admin selects a partner in the "Export partner" dropdown and clicks the download CSV button
- **THEN** the UI passes the selected `partnerId` to the export action and downloads a CSV containing only that partner's bookings.
