Feature: Credits
  Credits cover the refill on successful subscription, the debit on a
  booking, the admin freeze/unfreeze control, and the ledger view.

  Background:
    Given the user is logged in as Member

  Scenario: Member sees the current credit count in the header
    When the user navigates to /app/en/app
    Then the user asserts the header shows "Credits"

  Scenario: Admin freezes a member's credits
    Given the user is logged in as Admin
    When the user navigates to /app/en/admin/members
    And the user opens the 1st item in main
    And the user toggles Freeze credits
    And the user confirms the modal
    Then the user asserts the section shows "Frozen"

  Scenario: Admin views the credit ledger
    Given the user is logged in as Admin
    When the user navigates to /app/en/admin/members
    And the user opens the 1st item in main
    Then the user asserts the section shows "Ledger"

  @story(component=CreditLedgerViewTableSemantics, story=PopulatedTableIsARegion)
  Scenario: Member views a populated credit ledger and the table region is reachable
    When the user navigates to /app/en/app
    Then the user asserts a region named "Credit ledger" is reachable
    And the user asserts a table named "Credit ledger" inside the region is reachable
    And the user asserts the table has column headers "Reason", "Date", "Actor", "Credits"

  @story(component=CreditLedgerViewTableSemantics, story=EmptyLedgerKeepsRegion)
  Scenario: Empty credit ledger still exposes the region landmark with the empty-state copy
    Given the credit ledger has no entries
    When the user navigates to /app/en/app
    Then the user asserts a region named "Credit ledger" is reachable
    And the user asserts the region exposes the empty-state copy "The credit ledger is empty."

  @story(component=AdminFreezeUnfreezeForm, story=FreezeFormIsLabeledLandmark)
  Scenario: Admin opens a member row and the freeze form landmark is reachable
    Given the user is logged in as Admin
    When the user navigates to /app/en/admin/members
    And the user opens the 1st item in main
    Then the user asserts a form named "Freeze or unfreeze a member" is reachable
    And the user asserts a textbox named "Reason" inside the form is reachable
    And the user asserts a button named "Freeze member" inside the form is reachable
    And the user asserts a button named "Unfreeze member" inside the form is reachable

  @story(component=AdminFreezeUnfreezeForm, story=MissingReasonIsAnnounced)
  Scenario: Admin submits the freeze form without a reason and the error is announced
    Given the user is logged in as Admin
    When the user navigates to /app/en/admin/members
    And the user opens the 1st item in main
    And the user clicks the button named "Freeze member" inside the form named "Freeze or unfreeze a member"
    Then the user asserts a status named "Admin action result" exposes the message "A reason is required."

  @story(component=AdminFreezeUnfreezeForm, story=FreezeFormLocalizes)
  Scenario: Admin freeze form landmark and copy localize to German
    Given the user is logged in as Admin
    When the user navigates to /app/de/admin/members
    And the user opens the 1st item in main
    Then the user asserts a form named "Mitglied einfrieren oder freigeben" is reachable
    And the user asserts a textbox named "Begründung" inside the form is reachable
