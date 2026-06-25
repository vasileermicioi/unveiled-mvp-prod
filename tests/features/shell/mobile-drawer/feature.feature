Feature: Mobile drawer toggle visibility is gated by the lg breakpoint
  The hamburger toggle rendered by the design-system
  `ShellIconButtonPresentational` MUST carry the Tailwind `lg:hidden`
  utility so that at viewports ≥ 1024 px wide the toggle is hidden and
  the full nav row is the only visible navigation surface. At viewports
  < 1024 px the toggle MUST remain visible and open the mobile drawer
  on activation. The gate lives on the primitive, not on the consumer
  (auth, landing, member, partner, admin shells all share the
  primitive).

  @ladle(component=app-shell, story=LgViewport)
  Scenario: Hamburger toggle carries the lg:hidden utility
    When the user navigates to /app/en/
    Then the user asserts nav exposes button[aria-controls="shell-mobile-drawer"] with class containing "lg:hidden"

  @ladle(component=app-shell, story=SmViewport)
  Scenario: Hamburger toggle is visible at viewports below the lg breakpoint
    When the user navigates to /app/en/
    Then the user asserts nav exposes button[aria-controls="shell-mobile-drawer"] with class containing "lg:hidden"
    And the user asserts the nav shows "Open navigation menu"
