Feature: Session
  Session covers signup, login, logout, password recovery, and the
  redirect-after-login behaviour for every role.

  Background:
    Given the user is logged in as Guest

  Scenario: Member signs up and lands on the member surface
    When the user navigates to /app/en/signup
    And the user submits signup with Email=member@example.com, Password=correct-horse-battery
    Then the user asserts the page renders the brand-yellow border
    And the user asserts the active language is en

  Scenario: Member logs in and lands on /en/app
    When the user navigates to /app/en/login
    And the user submits login with Email=member@example.com, Password=correct-horse-battery
    Then the user asserts the nav shows "Discover"

  Scenario: Member recovers password
    When the user navigates to /app/en/login
    And the user submits recovery with Email=member@example.com
    Then the user asserts the section shows "Recovery email sent"

  Scenario: Member logs out
    Given the user is logged in as Member
    When the user toggles Account
    And the user logs out
    Then the user asserts the header shows "Log in"
