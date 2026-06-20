Feature: Search and filter
  Search and filter cover the query string round-trip, the multi-select
  controls, and the URL ↔ filter synchronisation.

  Background:
    Given the user is logged in as Member

  Scenario: Filter selections round-trip through the URL
    When the user navigates to /app/en/discover
    And the user submits filter with Category=Theater, Neighborhood=Kreuzberg
    Then the user asserts the section shows "Theater"

  Scenario: Clearing filters resets the URL
    When the user navigates to /app/en/discover?category=Theater
    And the user toggles Clear filters
    Then the user asserts the section shows "Upcoming"
