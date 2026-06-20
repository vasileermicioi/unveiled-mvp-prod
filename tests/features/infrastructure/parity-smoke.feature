Feature: Parity smoke
  The parity smoke is the one happy-path scenario migrated from the
  legacy `tests/features/core-platform.feature` and lives in
  09-iteration. In 08-iteration this file is the placeholder.

  Background:
    Given the user is logged in as Member

  Scenario: Member reaches the app and sees the feed
    When the user navigates to /app/en/app
    Then the user asserts the page shows the heading "Upcoming"
