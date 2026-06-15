Feature: Subscriptions
  Subscriptions cover the Stripe checkout, the webhook handler, and the
  Stripe billing portal entry for an active member.

  Background:
    Given the user is logged in as Member

  Scenario: Member starts the Stripe checkout
    When the user navigates to /en/membership
    And the user submits checkout with Plan=monthly
    Then the user asserts the response is 303

  Scenario: Member opens the billing portal
    When the user navigates to /en/profile
    And the user toggles Manage billing
    Then the user asserts the response is 303

  @story(component=StripeCheckoutRedirectButton, story=SubmitIsLabeledFormSubmit)
  Scenario: Stripe checkout form is a labeled landmark with a localized submit button
    When the user navigates to /en/membership
    Then the user asserts a form named "Start Stripe checkout" is reachable
    And the user asserts a button named "Continue to Stripe checkout" inside the form is reachable

  @story(component=StripeCheckoutRedirectButton, story=SubmitLocalizes)
  Scenario: Stripe checkout form landmark and submit copy localize to German
    When the user navigates to /de/membership
    Then the user asserts a form named "Stripe-Checkout starten" is reachable
    And the user asserts a button named "Weiter zum Stripe-Checkout" inside the form is reachable

  @story(component=StripeWebhookHandlerValidation, story=VerifiedEventPassesSchema)
  Scenario: Verified webhook event whose payload matches the generated contract is accepted
    Given the user is logged in as Admin
    When the user posts a verified Stripe event of type "invoice.paid" to the Stripe webhook endpoint
    Then the user asserts the webhook response is 200

  @story(component=StripeWebhookHandlerValidation, story=SchemaFailureRejected)
  Scenario: Verified webhook event whose payload does not match the contract is rejected with a 422
    Given the user is logged in as Admin
    When the user posts a verified Stripe event with a payload missing the required "type" field to the Stripe webhook endpoint
    Then the user asserts the webhook response is 422
    And the user asserts the webhook response body includes the message "Stripe payload does not match the generated contract."

  @story(component=SubscriptionPortalLink, story=PortalLinkIsLabeledExternal)
  Scenario: Active member sees a labeled portal link in the manage-subscription region
    When the user navigates to /en/membership
    Then the user asserts a region named "Manage subscription" is reachable
    And the user asserts a link named "Open Stripe customer portal (external)" inside the region is reachable
    And the user asserts the link has target "_blank"

  @story(component=SubscriptionPortalLink, story=PortalLinkMissingFallback)
  Scenario: Portal URL is missing and the region still announces the unavailable fallback
    Given the portal URL is missing
    When the user navigates to /en/membership
    Then the user asserts a region named "Manage subscription" is reachable
    And the user asserts the region exposes the fallback message "The Stripe customer portal is currently unavailable."

  @story(component=SubscriptionPortalLink, story=PortalLinkLocalizes)
  Scenario: Portal link accessible name localizes to German
    When the user navigates to /de/membership
    Then the user asserts a link named "Stripe-Kundenportal öffnen (extern)" inside the region named "Mitgliedschaft verwalten" is reachable
