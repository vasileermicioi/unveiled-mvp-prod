Feature: Discovery
  The discovery surface covers filters, the geo map, the card grid, the
  empty state, and pagination for guest and member visitors.

  Background:
    Given the user is logged in as Guest

  Scenario: Guest sees the default filter set
    When the user navigates to /en/discover
    Then the user asserts the nav shows "Filters"
    And the user asserts the section shows "Upcoming"

  Scenario: Empty state renders when no events match the filters
    When the user navigates to /en/discover
    And the user submits filter with Category=NoSuchCategory
    Then the user asserts the section shows "No events"

  Scenario: Pagination advances to the next page
    When the user navigates to /en/discover
    And the user toggles Next page
    Then the user asserts the section shows "Page 2"
