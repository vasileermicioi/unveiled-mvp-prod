Feature: Booking
  Booking covers the book, waitlist, cancel, and redeem flows for an
  authenticated member.

  Background:
    Given the user is logged in as Member

  Scenario: Member books an event with capacity
    When the user navigates to /en/app
    And the user opens the 1st item in main
    And the user toggles Book now
    And the user confirms the modal
    Then the user asserts the section shows "Confirmed"

  Scenario: Member joins the waitlist for a sold-out event
    When the user navigates to /en/app
    And the user opens the 1st item in main
    And the user toggles Join waitlist
    Then the user asserts the section shows "Waitlist"

  Scenario: Member cancels a confirmed booking
    When the user navigates to /en/bookings
    And the user toggles Cancel booking
    And the user confirms the modal
    Then the user asserts the section shows "Cancelled"
