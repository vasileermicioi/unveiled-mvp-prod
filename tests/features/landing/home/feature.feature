Feature: Public landing page
  The landing surface at `/` introduces Unveiled to unauthenticated
  visitors and exposes a clear entry point into the member surface at
  `/app/*`. The hero is the only interactive surface at this stage;
  richer landing content lands in a follow-up iteration.

  Background:
    Given the visitor is on the public landing surface

  @ladle(component=LandingHero, story=VisitorSeesHeroWithAppCta)
  Scenario: Visitor opens / and sees the hero CTA pointing at /app
    When the visitor opens /
    Then the page renders the landing hero
    And the hero exposes a call to action whose href is /app

  @ladle(component=LandingHero, story=VisitorWithReducedMotionSeesStaticHero)
  Scenario: Visitor with prefers-reduced-motion sees a static hero
    Given the visitor prefers reduced motion
    When the visitor opens /
    Then the page renders the landing hero without any animation
    And the hero call to action still links to /app

  @ladle(component=LandingHero, story=AuthenticatedVisitorSeesGoToAppLink)
  Scenario: Authenticated visitor sees a Go to app link alongside the hero CTA
    Given the visitor is signed in
    When the visitor opens /
    Then the page renders the landing hero
    And the header shows a "Go to app" link whose href is /app
    And the hero exposes a "Go to app" link whose href is /app
