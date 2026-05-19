## ADDED Requirements

### Requirement: Discovery Pages Coordinate Map And Filters
The app SHALL coordinate discovery and member discovery map surfaces so opening the map closes filters and preserves a usable event list.

#### Scenario: Discovery map opens
- **WHEN** a user opens the map panel from discovery or member discovery
- **THEN** the filter panel closes
- **AND** the map panel renders a loading, configured, or safe fallback state without hiding the event list

#### Scenario: Map selection opens event context
- **WHEN** a user selects a visible event marker
- **THEN** the page surfaces the selected event context and exposes the action to open the event details view or booking modal

#### Scenario: Map provider is unavailable
- **WHEN** map provider configuration is missing or map loading fails
- **THEN** the page renders a safe visible fallback and keeps the event list usable
