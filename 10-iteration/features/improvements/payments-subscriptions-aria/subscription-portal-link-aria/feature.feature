Feature: Subscription portal link is selector-disciplinable and accessible
  The subscription portal link on the membership page renders
  inside a single named region as a labeled external-destination
  link whose accessible name announces the destination in both
  EN and DE, so gherkin can target it through proximity+layout
  selectors and screen readers announce the external destination.

  @story(component=SubscriptionPortalLink, story=PortalLinkIsLabeledExternal)
  Scenario: Active member views the membership page and the portal link is reachable
    Given the user is logged in as Member
    When the user navigates to /en/membership
    Then the user asserts a region named "Manage subscription" is reachable
    And the user asserts a link named "Open Stripe customer portal (external)" inside the region is reachable
    And the user asserts the link has target "_blank"

  @story(component=SubscriptionPortalLink, story=PortalLinkMissingFallback)
  Scenario: Portal URL is missing and the region still announces the unavailable fallback
    Given the user is logged in as Member
    And the portal URL is missing
    When the user navigates to /en/membership
    Then the user asserts a region named "Manage subscription" is reachable
    And the user asserts the region exposes the fallback message "The Stripe customer portal is currently unavailable."

  @story(component=SubscriptionPortalLink, story=PortalLinkLocalizes)
  Scenario: Portal link accessible name localizes to German
    Given the user is logged in as Member
    When the user navigates to /de/membership
    Then the user asserts a link named "Stripe-Kundenportal öffnen (extern)" inside the region named "Mitgliedschaft verwalten" is reachable
