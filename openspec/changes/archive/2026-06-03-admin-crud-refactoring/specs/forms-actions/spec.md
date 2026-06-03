## ADDED Requirements

### Requirement: Admin CRUD Form Validation and Localized Errors
The Admin event and partner forms SHALL validate inputs (such as emails, dates, capacities, and required fields) and return localized error feedback based on the current UI language.

#### Scenario: Admin submits invalid event details
- **WHEN** an admin submits the event form with invalid inputs (e.g. negative capacity, empty title)
- **THEN** the system SHALL display localized inline validation errors matching the selected language (DE or EN)

#### Scenario: Admin submits invalid partner details
- **WHEN** an admin submits the partner form with invalid inputs (e.g. invalid contact email format)
- **THEN** the system SHALL display localized inline validation errors matching the selected language (DE or EN)

### Requirement: Admin CRUD Form Submission Query Invalidation
The Admin event and partner forms SHALL submit update payloads with unique database IDs and trigger automatic query invalidations upon success.

#### Scenario: Admin saves event edit successfully
- **WHEN** an admin submits the event form with modified properties for an existing event ID
- **THEN** the system SHALL call the save event server action, display a success notice, and invalidate all associated queries (such as events list and public discovery data)

#### Scenario: Admin saves partner edit successfully
- **WHEN** an admin submits the partner form with modified properties for an existing partner ID
- **THEN** the system SHALL call the save partner server action, display a success notice, and invalidate all associated queries (such as partners list and partner-specific detail queries)
