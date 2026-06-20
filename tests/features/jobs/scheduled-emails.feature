Feature: Scheduled emails
  Scheduled emails cover the partner reminder and the member
  confirmation jobs.

  Background:
    Given the user is logged in as Admin

  Scenario: Partner reminder job is scheduled
    When the user navigates to /app/en/admin
    Then the user asserts the section shows "Partner reminder"
