Feature: Field, TextInput, SelectInput, and TextArea primitive parity
  The production form primitives (`Field`, `TextInput`, `SelectInput`,
  `TextArea`) in `src/components/ui/unveiled-primitives.tsx` SHALL
  preserve the visible field structure, the `label`, `hint`, `error`,
  `value`, `onChange`, and `disabled` props, and the proximity-selector
  contract used by the gherkin suite. Each scenario is wired into the
  Ladle coverage gate via a co-located `<Primitive>.ladle.tsx` harness.

  Background:
    Given the user is logged in as Guest

  @ladle(component=Field, story=LabelWithHint)
  Scenario: Field renders its label and helper text
    When the user navigates to /en/
    Then the field nearest to "Display name" is visible
    And the field nearest to "Display name" exposes the helper "Visible on your tickets"

  @ladle(component=Field, story=LabelWithError)
  Scenario: Field renders an error message when one is provided
    When the user navigates to /en/
    Then the field nearest to "Email address" is visible
    And the field nearest to "Email address" exposes the error "Enter a valid email"

  @ladle(component=TextInput, story=Disabled)
  Scenario: TextInput renders the disabled state
    When the user navigates to /en/
    Then the input nearest to "Display name" is visible
    And the input nearest to "Display name" is disabled

  @ladle(component=SelectInput, story=SelectionChange)
  Scenario: SelectInput renders the selected option
    When the user navigates to /en/
    Then the field nearest to "City" is visible
    And the field nearest to "City" exposes the value "Berlin"

  @ladle(component=TextArea, story=MultiLine)
  Scenario: TextArea renders multi-line content
    When the user navigates to /en/
    Then the field nearest to "Notes" is visible
    And the field nearest to "Notes" is a textarea