Feature: Admin CRUD
  Admin CRUD covers the events, partners, members, and metrics tabs of
  the operational dashboard.

  Background:
    Given the user is logged in as Admin

  Scenario: Admin views the events tab
    When the user navigates to /app/en/admin/events
    Then the user asserts the section shows "Events"

  Scenario: Admin creates a new event
    When the user navigates to /app/en/admin/events
    And the user submits event with Title=Test, Capacity=10
    Then the user asserts the section shows "Saved"

  Scenario: Admin creates a new partner
    When the user navigates to /app/en/admin/partners
    And the user submits partner with Name=Acme, ContactEmail=ops@acme.test
    Then the user asserts the section shows "Saved"

  Scenario: Admin views the metrics dashboard
    When the user navigates to /app/en/admin
    Then the user asserts the section shows "Metrics"
