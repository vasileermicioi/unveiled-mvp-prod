Feature: TextArea primitive parity
  The production `TextArea` primitive SHALL render the bordered
  multi-line surface, the helper / error placement, and the disabled
  state. Each scenario is wired into the Ladle coverage gate via the
  co-located `TextArea.ladle.tsx` harness.

  Background:
    Given the user is logged in as Guest

  @ladle(component=TextArea, story=MultiLine)
  Scenario: TextArea renders multi-line content
    When the user navigates to /app/en/
    Then the field nearest to "Notes" is visible
    And the field nearest to "Notes" is a textarea

  @ladle(component=TextArea, story=Disabled)
  Scenario: TextArea renders the disabled state
    When the user navigates to /app/en/
    Then the field nearest to "Internal notes" is visible
    And the field nearest to "Internal notes" is disabled