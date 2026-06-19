Feature: Panel, Card, and Badge primitive parity
  The production `Panel`, `Card`, and `Badge` primitives in
  `src/components/ui/unveiled-primitives.tsx` SHALL preserve the
  bordered, high-contrast Unveiled visual treatment across their
  variant, tone, and shadow matrices. Each scenario is wired into the
  Ladle coverage gate through the co-located
  `Panel.ladle.tsx`, `Card.ladle.tsx`, and `Badge.ladle.tsx`
  harnesses so the visible parity, hover behaviour, and count-adjacent
  labels are locked.

  Background:
    Given the user is logged in as Guest

  @ladle(component=Panel, story=ToneMatrix)
  Scenario: Panel renders every tone entry
    When the user navigates to /en/
    Then the region named "Panel tone matrix" is reachable
    And the region named "Panel tone matrix" exposes the "white" tone
    And the region named "Panel tone matrix" exposes the "yellow" tone
    And the region named "Panel tone matrix" exposes the "cream" tone
    And the region named "Panel tone matrix" exposes the "dark" tone
    And the region named "Panel tone matrix" exposes the "grey" tone

  @ladle(component=Panel, story=ShadowToggle)
  Scenario: Panel renders without the offset shadow when shadow is disabled
    When the user navigates to /en/
    Then the region named "Panel shadow off" is reachable
    And the region named "Panel shadow off" does not expose the offset shadow

  @ladle(component=Card, story=DefaultCard)
  Scenario: Card renders with the bordered treatment and a body slot
    When the user navigates to /en/
    Then the region named "Card body" is reachable
    And the region named "Card body" is wrapped in a bordered card

  @ladle(component=Card, story=InteractiveCard)
  Scenario: Card hover state stays within the bordered treatment
    When the user navigates to /en/
    Then the region named "Interactive card" is reachable
    And the region named "Interactive card" exposes the hover treatment

  @ladle(component=Badge, story=ToneMatrix)
  Scenario: Badge renders every tone entry
    When the user navigates to /en/
    Then the region named "Badge tone matrix" is reachable
    And the region named "Badge tone matrix" exposes the "dark" tone
    And the region named "Badge tone matrix" exposes the "yellow" tone
    And the region named "Badge tone matrix" exposes the "white" tone
    And the region named "Badge tone matrix" exposes the "success" tone
    And the region named "Badge tone matrix" exposes the "error" tone

  @ladle(component=Badge, story=CountAdjacentLabel)
  Scenario: Badge with aria-label announces a count
    When the user navigates to /en/
    Then the region named "Badge count label" is reachable
    And the region named "Badge count label" exposes aria-label "Saved: 3"