Feature: Credits
  Credits cover the refill on successful subscription, the debit on a
  booking, the admin freeze/unfreeze control, and the ledger view.

  Background:
    Given the user is logged in as Member

  Scenario: Member sees the current credit count in the header
    When the user navigates to /en/app
    Then the user asserts the header shows "Credits"

  Scenario: Admin freezes a member's credits
    Given the user is logged in as Admin
    When the user navigates to /en/admin/members
    And the user opens the 1st item in main
    And the user toggles Freeze credits
    And the user confirms the modal
    Then the user asserts the section shows "Frozen"

  Scenario: Admin views the credit ledger
    Given the user is logged in as Admin
    When the user navigates to /en/admin/members
    And the user opens the 1st item in main
    Then the user asserts the section shows "Ledger"
