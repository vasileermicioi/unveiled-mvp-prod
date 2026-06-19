Feature: SelectInput primitive parity
  The production `SelectInput` primitive SHALL render the bordered
  trigger, the visible value, and the option list with HeroUI keyboard
  navigation. Each scenario is wired into the Ladle coverage gate via
  the co-located `SelectInput.ladle.tsx` harness.

  Background:
    Given the user is logged in as Guest

  @ladle(component=SelectInput, story=SelectionChange)
  Scenario: SelectInput renders the selected option
    When the user navigates to /en/
    Then the field nearest to "City" is visible
    And the field nearest to "City" exposes the value "Berlin"

  @ladle(component=SelectInput, story=Disabled)
  Scenario: SelectInput renders the disabled state
    When the user navigates to /en/
    Then the field nearest to "Category" is visible
    And the field nearest to "Category" is disabled