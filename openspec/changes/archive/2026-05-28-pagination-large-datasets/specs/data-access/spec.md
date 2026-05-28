## ADDED Requirements

### Requirement: Paginated Operational Data Retrieval
The data-access layer SHALL provide paginated query models for user profiles, partner venues, and events, including total count and availability of subsequent pages.

#### Scenario: Admin retrieves paginated members registry
- **WHEN** an authenticated admin requests user profiles with page `2` and pageSize `20`
- **THEN** the data-access layer returns only the matching subset of 20 user profiles (offset by 20), along with the total user profile count and a flag indicating if more pages are available.
