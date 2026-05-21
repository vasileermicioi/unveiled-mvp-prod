## ADDED Requirements

### Requirement: Behavior Tracking Actions
The system SHALL provide server actions or endpoints to record member behavior events without blocking the member's main flow.

#### Scenario: Member opens an event detail
- **WHEN** an authenticated member opens an event, the UI triggers a non-blocking tracking call
- **THEN** the server increments the eventOpenCount, updates the viewCounts map for that event, sets the lastOpenedEventId, prepends it to recentEventIds (keeping only unique IDs, capped at a maximum of 5), and updates lastSeenAt and lastView.

#### Scenario: Member applies discovery filters
- **WHEN** an authenticated member performs a search or changes discovery filters, the UI triggers a non-blocking tracking call
- **THEN** the server increments the filterApplyCount, records the lastFilter search parameters, and updates lastSeenAt and lastView.

#### Scenario: Safe no-op tracking for guest and unauthorized users
- **WHEN** a guest or unauthenticated user triggers a behavior tracking event
- **THEN** the system ignores the tracking call without throwing an error or committing any database changes.
