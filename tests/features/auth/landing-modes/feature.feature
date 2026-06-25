Feature: Auth landing form modes
  The auth landing form is a single source of truth: signup mode links to
  login, login mode links to signup, and an authenticated viewer never
  sees the form (server-side redirect to the role-appropriate product
  surface).

  @ladle(component=login-form, story=signed-in)
  Scenario: Signed-in member is redirected from /app/en/login
    When the visitor opens /app/en/login
    Then the response status is 302
    And the user is redirected to /app/en/app

  @ladle(component=login-form, story=signed-in-as-partner)
  Scenario: Signed-in partner is redirected from /app/en/login
    When the visitor opens /app/en/login
    Then the response status is 302
    And the user is redirected to /app/en/partner

  @ladle(component=login-form, story=guest)
  Scenario: Guest sees the signup form with a switch-to-login link
    When the visitor opens /app/en/signup
    Then the response status is 200
    And the main shows "Sign up | Unveiled"
    And the user asserts the form links to login via "Already a member? Log in"