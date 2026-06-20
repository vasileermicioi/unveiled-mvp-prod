Feature: Responsive layout
  Responsive behaviour covers the mobile drawer, breakpoint transitions,
  and skeleton loaders for slow queries.

  Background:
    Given the user is logged in as Guest

  Scenario: Mobile drawer replaces the desktop nav at the md breakpoint
    When the user navigates to /app/en/
    And the user toggles Menu
    Then the user asserts the nav shows "Discover"

  Scenario: Skeleton loader is visible while the discovery data is loading
    When the user navigates to /app/en/discover
    Then the user asserts the section shows "Loading"
