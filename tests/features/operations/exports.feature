Feature: Exports
  Exports cover the partner guest-list export and the admin
  bookings / codes exports in CSV and Excel.

  Background:
    Given the user is logged in as Admin

  Scenario: Admin exports bookings as CSV
    When the user navigates to /app/en/admin/exports
    And the user toggles Export bookings
    Then the user asserts the response is 200

  Scenario: Partner exports the guest list as Excel
    Given the user is logged in as Partner
    When the user navigates to /app/en/partner/guests
    And the user toggles Export guests
    Then the user asserts the response is 200
