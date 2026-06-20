Feature: Authorization
  Authorization covers role-gated routes, the redirect-after-login table,
  and deep-link preservation for guests.

  Background:
    Given the user is logged in as Guest

  Scenario: Guest hitting a member route is redirected to login
    When the user navigates to /app/en/bookings
    Then the user asserts the nav shows "Log in"

  Scenario: Deep link is preserved through login
    When the user navigates to /app/en/bookings
    And the user submits login with Email=member@example.com, Password=correct-horse-battery
    Then the user asserts the page shows the heading "Bookings"

  Scenario: Member hitting an admin route is redirected
    Given the user is logged in as Member
    When the user navigates to /app/en/admin
    Then the user asserts the nav shows "Discover"

  Scenario: Member hitting a partner route is rejected
    Given the user is logged in as Member
    When the user navigates to /app/en/partner
    Then the user asserts the nav shows "Discover"
