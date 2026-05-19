## ADDED Requirements

### Requirement: Discovery Map Display Data
The app SHALL provide discovery map display data for event markers, selection state, and map fallback states.

#### Scenario: Marker display data is available
- **WHEN** discovery renders events with map coordinates
- **THEN** display data includes event id, title, date label, venue label, address or derived location label, latitude, longitude, and marker label text

#### Scenario: Marker selection display data is available
- **WHEN** a marker is selected
- **THEN** display data includes selected marker state, selected event title, date, venue, and the action target to open event details or booking modal

#### Scenario: Missing coordinates degrade safely
- **WHEN** an event lacks usable coordinates
- **THEN** display data omits the marker and preserves the event list card and label text without breaking the map surface

#### Scenario: Map fallback display data is available
- **WHEN** map provider configuration is missing or loading fails
- **THEN** display data includes loading, error, or fallback state text and a safe retry or dismiss action where applicable
