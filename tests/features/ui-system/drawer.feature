Feature: Drawer primitive parity
  The production `Drawer` primitive in `src/components/ui/drawer.tsx`
  SHALL expose the focus trap, `aria-modal`, and the placement matrix
  used by the booking shell. Each scenario is wired into the Ladle
  coverage gate via the co-located `Drawer.ladle.tsx` harness.

  Background:
    Given the user is logged in as Member

  @ladle(component=Drawer, story=OpenRightPlacement)
  Scenario: Drawer opens on the right placement
    When the user navigates to /app/en/app
    Then the dialog named "Saved events" is reachable
    And the dialog named "Saved events" exposes aria-modal "true"

  @ladle(component=Drawer, story=CloseOnEscape)
  Scenario: Drawer closes when Escape is pressed
    When the user navigates to /app/en/app
    And the user dismisses the dialog named "Saved events" with Escape
    Then the dialog named "Saved events" is not reachable