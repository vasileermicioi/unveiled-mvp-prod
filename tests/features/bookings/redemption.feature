Feature: Redemption
  Redemption covers the voucher, secret code, and URL-based ticket
  redemption flows for a member or partner.

  Background:
    Given the user is logged in as Member

  Scenario: Member redeems a voucher code from the booking page
    When the user navigates to /app/en/bookings
    And the user submits voucher with Code=ABC123
    Then the user asserts the section shows "Redeemed"

  Scenario: Member redeems a secret code from the booking page
    When the user navigates to /app/en/bookings
    And the user submits secret with Code=open-sesame
    Then the user asserts the section shows "Redeemed"
