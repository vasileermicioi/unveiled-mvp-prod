Feature: Subscriptions
  Subscriptions cover the Stripe checkout, the webhook handler, and the
  Stripe billing portal entry for an active member.

  Background:
    Given the user is logged in as Member

  Scenario: Member starts the Stripe checkout
    When the user navigates to /en/membership
    And the user submits checkout with Plan=monthly
    Then the user asserts the response is 303

  Scenario: Member opens the billing portal
    When the user navigates to /en/profile
    And the user toggles Manage billing
    Then the user asserts the response is 303
