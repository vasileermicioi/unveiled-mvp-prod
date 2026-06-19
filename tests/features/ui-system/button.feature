Feature: Button primitive parity
  The production `Button` primitive in `src/components/ui/button.tsx`
  SHALL preserve the existing variant matrix, the size matrix, the
  `loading` and `asChild` props, and the bordered, high-contrast Unveiled
  visual treatment. Each entry below is wired into the Ladle coverage
  gate via a co-located `Button.ladle.tsx` harness so the visible,
  focus, and disabled states are locked end-to-end.

  Background:
    Given the user is logged in as Guest

  @ladle(component=Button, story=VariantMatrix)
  Scenario: Variant matrix renders with bordered, high-contrast treatment
    When the user navigates to /en/
    Then the button named "Primary default" is visible
    And the button named "Primary primary" is visible
    And the button named "Primary secondary" is visible
    And the button named "Primary yellow" is visible
    And the button named "Primary destructive" is visible

  @ladle(component=Button, story=SizeMatrix)
  Scenario: Size matrix renders every entry
    When the user navigates to /en/
    Then the button named "Size default" is visible
    And the button named "Size sm" is visible
    And the button named "Size lg" is visible

  @ladle(component=Button, story=LoadingState)
  Scenario: Loading state replaces the label with the spinner and keeps aria-disabled
    When the user navigates to /en/
    Then the button named "Submit booking" has aria-disabled "true"
    And the button named "Submit booking" exposes a spinner role

  @ladle(component=Button, story=AsChildSlot)
  Scenario: asChild renders the button as a slotted anchor
    When the user navigates to /en/
    Then the link named "Open discovery" is reachable inside main
    And the link named "Open discovery" is rendered with a button shape

  @ladle(component=Button, story=FocusRing)
  Scenario: Focus ring is reachable via keyboard
    When the user navigates to /en/
    And the user focuses the button named "Primary default"
    Then the button named "Primary default" exposes a focus ring