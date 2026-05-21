## ADDED Requirements

### Requirement: Member Behavior Analytics Loader
The data-access layer SHALL load complete and aggregated member behavior metrics for the admin interface.

#### Scenario: Behavior metrics are loaded for admin member view
- **WHEN** the admin loads or expands a member's profile
- **THEN** the returned read model includes the correct values for sessionCount, eventOpenCount, bookingCount, waitlistCount, savedCount, unsavedCount, filterApplyCount, recentEventIds, and lastSeenAt.
