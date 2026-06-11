## MODIFIED Requirements

### Requirement: Map Component
This requirement SHALL use legacy reference path: `_old_app/components/EventMap.tsx`.

Map UI SHALL render through Leaflet and an open tile provider (such as CartoDB Voyager or OpenStreetMap), preserving the visible map panel, marker, loading, error, and fallback behavior, and supporting event selection handoff with a smooth panning animation.

#### Scenario: Visible elements render
- **WHEN** map is open
- **THEN** it appears inside a fixed-height bordered panel using the existing styling tokens
- **AND** the map mounts Leaflet and centers on Berlin by default (coordinates `52.52`, `13.405`)
- **AND** map tiles are loaded from an open tile provider (such as CartoDB Voyager or OpenStreetMap)
- **AND** event markers use a custom dark squared marker shape with a brand-yellow stroke

#### Scenario: Loading and error states render
- **WHEN** map is loading
- **THEN** a bordered grey loading panel with compact animated text appears
- **AND** the panel preserves space with a fixed height to prevent layout shifts of adjacent elements
- **WHEN** map fails
- **THEN** a dark error panel with warning icon, explanatory copy, and Retry Connection action appears

#### Scenario: User interactions render
- **WHEN** a marker is selected
- **THEN** an info window shows category, neighborhood, title, formatted time, and a "Book now" or "View event" action button that opens the event details view or booking modal
- **WHEN** the provider is unavailable or a marker cannot be resolved
- **THEN** the map shows a safe visible fallback state without blocking the surrounding event list
- **WHEN** an event card is clicked in the list
- **THEN** the map initiates a smooth panning animation to the selected marker's coordinates over `400ms` using an `easeInOutCubic` easing curve
- **AND** the active panning animation frame is cancelled as soon as the user starts a manual drag or pointer interaction (`mousedown`, `touchstart`, or wheel) on the map viewport

#### Scenario: Visual parity is preserved
- **WHEN** map markers and info windows are displayed
- **THEN** they keep the legacy bordered, high-contrast treatment and remain visually consistent with the discovery surface

#### Scenario: Data requirements are met
- **WHEN** map renders
- **THEN** required display data is event latitude, longitude, category, neighborhood, title, formatted time, selected marker state, and action target
