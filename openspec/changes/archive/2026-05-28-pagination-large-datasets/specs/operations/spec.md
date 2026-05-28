## ADDED Requirements

### Requirement: Admin Dashboard Lists Pagination Controls
The admin operations interface SHALL render pagination controls for events, partners, and members, enabling navigation across multiple data pages and changing page size filters.

#### Scenario: Admin navigates to the next page of members
- **WHEN** an admin clicks the "Next page" button in the member registry
- **THEN** the active view refetches and renders the next subset of member rows.
