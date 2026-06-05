# discover-filters-pagination Specification

## Purpose
TBD - created by archiving change discover-filters-pagination. Update Purpose after archive.
## Requirements
### Requirement: Instant Filter Updates
Changing date ranges, category dropdowns, or partner selection inputs SHALL update search queries instantly.

#### Scenario: Filter inputs trigger refetch
- **WHEN** a visitor selects a category, partner, or enters a date range
- **THEN** the filter panel synchronizes inputs and propagates modifications to the global search filter state
- **AND** React Query detects the changed query key and immediately refetches results

#### Scenario: Filtering resets pagination page
- **WHEN** any search filter changes (category, partner, startDate, or endDate)
- **THEN** the pagination page parameter is reset back to page 1 (`undefined`)
- **AND** the query key caches the updated parameters under page 1

### Requirement: Pagination Controls And Limits
Curated events SHALL load in pages of 6 events maximum, with controls allowing page-by-page traversal.

#### Scenario: Event grid lists max 6 items
- **WHEN** events are loaded on a given discovery page
- **THEN** the list contains at most 6 events corresponding to the current page number
- **AND** pagination controls (Previous/Next buttons with page indicators) render at the bottom of the grid if the total matched count exceeds the page size

#### Scenario: Page controls are disabled at bounds
- **WHEN** the user is on page 1
- **THEN** the "Previous" page button is disabled
- **WHEN** `hasMore` is false (the current page contains the remaining matching events)
- **THEN** the "Next" page button is disabled

