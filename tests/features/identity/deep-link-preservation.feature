Feature: Deep-link preservation
  A Guest who visits a guarded member, partner, or admin route is
  redirected to the login surface with the intended destination
  preserved as a `?redirect=` query parameter, and the login form
  forwards the viewer to the validated destination after a
  successful sign-in. Off-site / off-table / cross-language targets
  are rejected by `parseSafeRedirectTarget` and the viewer lands on
  the safe per-surface fallback.

  @story(component=DeepLinkPreservation, story=HappyPath)
  Scenario: Login form preserves a safe deep-link target
    Then the user asserts the main shows "After signing in you will be redirected to /app/en/bookings?status=upcoming."

  Scenario: Guest visits /app/en/admin and is redirected to /app/en/login with the deep-link preserved
    When the visitor opens /app/en/admin
    Then the response status is 302
    And the Location header is /app/en/login?redirect=%2Fadmin

  Scenario: Guest visits /app/en/partner and is redirected to /app/en/login
    When the visitor opens /app/en/partner
    Then the response status is 302
    And the Location header is /app/en/login?redirect=%2Fpartner

  Scenario: Guest visits /app/en/bookings and is redirected to /app/en/login
    When the visitor opens /app/en/bookings
    Then the response status is 302
    And the Location header is /app/en/login?redirect=%2Fbookings

  Scenario: Guest visits /app/en/admin?tab=metrics and the query string is preserved
    When the visitor opens /app/en/admin?tab=metrics
    Then the response status is 302
    And the Location header is /app/en/login?redirect=%2Fadmin%3Ftab%3Dmetrics

  Scenario: /app/en/login renders the login form
    When the visitor opens /app/en/login
    Then the response status is 200

  Scenario: /app/en/login?redirect=%2Fadmin renders the login form with the deep-link preview
    When the visitor opens /app/en/login?redirect=%2Fadmin
    Then the response status is 200
