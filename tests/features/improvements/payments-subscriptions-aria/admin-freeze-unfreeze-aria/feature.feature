Feature: Admin freeze / unfreeze form is selector-disciplinable and accessible
  The admin freeze / unfreeze affordance on a member row renders
  inside a labeled form landmark with a labeled reason field, two
  unique submit buttons, and an `aria-live` result region so
  gherkin can target the affordance through proximity+layout
  selectors and screen readers announce server errors.

  @story(component=AdminFreezeUnfreezeForm, story=FreezeFormIsLabeledLandmark)
  Scenario: Admin opens a member row and the freeze form landmark is reachable
    Given the user is logged in as Admin
    When the user navigates to /en/admin/members
    And the user opens the 1st item in main
    Then the user asserts a form named "Freeze or unfreeze a member" is reachable
    And the user asserts a textbox named "Reason" inside the form is reachable
    And the user asserts a button named "Freeze member" inside the form is reachable
    And the user asserts a button named "Unfreeze member" inside the form is reachable

  @story(component=AdminFreezeUnfreezeForm, story=MissingReasonIsAnnounced)
  Scenario: Admin submits the freeze form without a reason and the error is announced
    Given the user is logged in as Admin
    When the user navigates to /en/admin/members
    And the user opens the 1st item in main
    And the user clicks the button named "Freeze member" inside the form named "Freeze or unfreeze a member"
    Then the user asserts a status named "Admin action result" exposes the message "A reason is required."

  @story(component=AdminFreezeUnfreezeForm, story=FreezeFormLocalizes)
  Scenario: Admin freeze form landmark and copy localize to German
    Given the user is logged in as Admin
    When the user navigates to /de/admin/members
    And the user opens the 1st item in main
    Then the user asserts a form named "Mitglied einfrieren oder freigeben" is reachable
    And the user asserts a textbox named "Begründung" inside the form is reachable
