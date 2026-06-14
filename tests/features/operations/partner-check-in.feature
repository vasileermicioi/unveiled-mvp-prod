Feature: Partner check-in
  Partner check-in covers the partner portal landing, the guest list
  view, and the per-booking check-in action.

  Background:
    Given the user is logged in as Partner

  Scenario: Partner sees the scheduled events
    When the user navigates to /en/partner
    Then the user asserts the section shows "Upcoming events"

  Scenario: Partner checks a guest in by code
    When the user navigates to /en/partner/check-in
    And the user submits checkin with Code=ABC123
    Then the user asserts the section shows "Checked in"
