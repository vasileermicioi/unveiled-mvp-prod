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
