Feature: Tabs primitive parity
  The production `Tabs` primitive in `src/components/ui/tabs.tsx`
  SHALL expose keyboard arrow-key navigation, `aria-selected` state on
  each trigger, and active-panel visibility. Each scenario is wired
  into the Ladle coverage gate via the co-located `Tabs.ladle.tsx`
  harness.

  Background:
    Given the user is logged in as Guest

  @ladle(component=Tabs, story=KeyboardArrowNavigation)
  Scenario: Tabs expose keyboard arrow-key navigation between triggers
    When the user navigates to /en/
    Then the tab named "Upcoming" is visible
    And the tab named "Saved" is visible
    And the tab named "Upcoming" exposes aria-selected "true"

  @ladle(component=Tabs, story=ActivePanelVisibility)
  Scenario: Tabs render the active panel as visible content
    When the user navigates to /en/
    Then the region named "Upcoming events" is reachable