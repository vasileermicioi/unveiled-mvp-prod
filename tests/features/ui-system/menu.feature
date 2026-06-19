Feature: Menu primitive parity
  The production `Menu` primitive in `src/components/ui/menu.tsx`
  SHALL expose `aria-expanded` state on the trigger, keyboard
  navigation through the items, and the bordered, high-contrast
  Unveiled visual treatment. Each scenario is wired into the Ladle
  coverage gate via the co-located `Menu.ladle.tsx` harness.

  Background:
    Given the user is logged in as Member

  @ladle(component=Menu, story=TriggerAriaExpanded)
  Scenario: Menu trigger exposes aria-expanded state
    When the user navigates to /en/app
    Then the button named "Account menu" exposes aria-expanded "false"

  @ladle(component=Menu, story=ItemKeyboardNavigation)
  Scenario: Menu items are reachable via keyboard navigation
    When the user navigates to /en/app
    And the user opens the menu named "Account menu"
    Then the menu item named "Profile" is reachable
    And the menu item named "Logout" is reachable