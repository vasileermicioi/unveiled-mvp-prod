Feature: Stripe checkout redirect button is selector-disciplinable and accessible
  The Stripe checkout redirect button on the membership page is
  exposed as a submit button inside a form landmark with a localized
  accessible name, so gherkin can target the affordance through
  proximity+layout selectors and screen readers announce it as a
  single checkout region.

  @story(component=StripeCheckoutRedirectButton, story=SubmitIsLabeledFormSubmit)
  Scenario: Member views the membership page and the checkout form is reachable
    Given the user is logged in as Member
    When the user navigates to /app/en/membership
    Then the user asserts a form named "Start Stripe checkout" is reachable
    And the user asserts a button named "Continue to Stripe checkout" inside the form is reachable

  @story(component=StripeCheckoutRedirectButton, story=NoPaymentMethodPreselected)
  Scenario: Checkout helper copy explains that no payment method is preselected
    Given the user is logged in as Member
    When the user navigates to /app/en/membership
    Then the user asserts the form named "Start Stripe checkout" exposes the helper copy "Pick a payment method and start the Stripe checkout."

  @story(component=StripeCheckoutRedirectButton, story=SubmitLocalizes)
  Scenario: Checkout form landmark and submit copy localize to German
    Given the user is logged in as Member
    When the user navigates to /app/de/membership
    Then the user asserts a form named "Stripe-Checkout starten" is reachable
    And the user asserts a button named "Weiter zum Stripe-Checkout" inside the form is reachable
