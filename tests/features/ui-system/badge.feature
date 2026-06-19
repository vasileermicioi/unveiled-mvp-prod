Feature: Badge primitive parity
  The production `Badge` primitive SHALL expose every entry of its
  tone matrix and SHALL render an `aria-label` for count-adjacent
  badges. The scenarios below are wired into the Ladle coverage gate
  via the co-located `Badge.ladle.tsx` harness.

  Background:
    Given the user is logged in as Guest

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