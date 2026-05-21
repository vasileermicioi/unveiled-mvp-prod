## ADDED Requirements

### Requirement: Member Behavior Schema Columns
The database schema SHALL define and preserve fields on user profiles to track member analytics and interactions.

#### Scenario: Behavior tracking columns are defined on profiles
- **WHEN** user profile schemas are loaded
- **THEN** columns exist to track session counts, event-open counts, booking counts, waitlist counts, saved/unsaved counts, filter apply counts, view counts by event, recent event IDs, last seen timestamp, last view name, last opened/booked/waitlisted/saved event IDs, and last filter search parameters.
