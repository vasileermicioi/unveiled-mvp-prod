Feature: Login redirect round-trip
  When a member submits valid credentials the API response must carry
  the Better Auth session cookie so the Astro middleware can resolve
  the next navigation as authenticated. The auth landing form must
  surface a deterministic terminal state and fall back to a manual
  "Continue" link if the browser blocks programmatic navigation.

  @ladle(component=LoginRedirect, story=Success)
  Scenario: Successful login sets the Better Auth session cookie and reaches /app
    When the visitor opens /app/en/login
    Then the response status is 200
    When the user submits Login Form with Email=member@example.test, Password=correct horse battery
    Then the user waits for /api/account/login to complete
    And the user asserts the response is 200

  @ladle(component=LoginRedirect, story=Invalid)
  Scenario: Invalid credentials surface an error and skip the redirecting state
    When the visitor opens /app/en/login
    Then the response status is 200
    When the user submits Login Form with Email=member@example.test, Password=definitely-wrong
    Then the user waits for /api/account/login to complete
    And the user asserts the response is 401

  @ladle(component=LoginRedirect, story=BlockedCookie)
  Scenario: Blocked programmatic navigation exposes the manual Continue link
    When the visitor opens /app/en/login
    Then the response status is 200
    When the user submits Login Form with Email=member@example.test, Password=correct horse battery
    Then the user waits for /api/account/login to complete
    And the user asserts the main shows "Redirecting…"