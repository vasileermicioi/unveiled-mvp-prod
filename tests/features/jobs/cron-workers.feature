Feature: Cron workers
  Cron workers cover the Workers runtime entry points and the
  monitoring surface.

  Background:
    Given the user is logged in as Admin

  Scenario: Cron worker reports a successful run
    When the user navigates to /app/en/admin
    Then the user asserts the section shows "Cron status"
