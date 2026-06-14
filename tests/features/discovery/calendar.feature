Feature: Calendar download
  Calendar download covers the `.ics` affordance on a confirmed booking
  success state and the field-level completeness of the file.

  Background:
    Given the user is logged in as Member

  Scenario: Member downloads the .ics file for a confirmed booking
    When the user navigates to /en/bookings
    And the user toggles Save the date
    Then the user waits for /api/calendar/ to complete
    And the user asserts the response is 200
