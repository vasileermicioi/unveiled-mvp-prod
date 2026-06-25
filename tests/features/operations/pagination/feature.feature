Feature: Admin pagination over the pagination dataset
  Admin operations tabs paginate at pageSize=20. The seeded
  pagination dataset supplies ≥3 pages of events, ≥3 pages of
  partners, and ≥3 pages of members so every Next/Previous control
  is exercisable.

  Background:
    Given the pagination dataset is seeded with "bun run seed:pagination"

  @seed(profile=pagination,reset=true)
  @ladle(component=AdminPaginationControls, story=Events)
  Scenario: Admin walks the events list across pages
    Given the user is logged in as Admin
    When the user navigates to /app/en/admin/events
    And the user clicks the "Next page" button
    Then the user asserts the section shows "Events"
    And the user asserts the table shows "pagination-event-021"
    And the user clicks the "Previous page" button
    And the user asserts the table shows "pagination-event-001"

  @seed(profile=pagination,reset=true)
  @ladle(component=AdminPaginationControls, story=Partners)
  Scenario: Admin walks the partners list across pages
    Given the user is logged in as Admin
    When the user navigates to /app/en/admin/partners
    And the user clicks the "Next page" button
    Then the user asserts the section shows "Partners"
    And the user asserts the table shows "Pagination Venue 021"

  @seed(profile=pagination,reset=true)
  @ladle(component=AdminPaginationControls, story=Members)
  Scenario: Admin walks the members list across pages
    Given the user is logged in as Admin
    When the user navigates to /app/en/admin/members
    And the user clicks the "Next page" button
    Then the user asserts the section shows "Members"
    And the user asserts the table shows "smoke-member-004"
