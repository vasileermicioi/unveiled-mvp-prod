Feature: Stripe webhook handler validates against the generated contract
  The Stripe webhook handler validates the parsed event payload
  against the generated Zod schema emitted by the TypeSpec build
  before mutating any subscription, credit, or ledger state. A
  schema failure returns a 422 response whose body matches the
  `WebhookError` model from `typespec/webhooks.tsp`.

  @story(component=StripeWebhookHandlerValidation, story=VerifiedEventPassesSchema)
  Scenario: Verified webhook event whose payload matches the contract is accepted
    Given the user is logged in as Admin
    When the user posts a verified Stripe event of type "invoice.paid" to the Stripe webhook endpoint
    Then the user asserts the webhook response is 200

  @story(component=StripeWebhookHandlerValidation, story=SchemaFailureRejected)
  Scenario: Verified webhook event whose payload does not match the contract is rejected with a 422
    Given the user is logged in as Admin
    When the user posts a verified Stripe event with a payload missing the required "type" field to the Stripe webhook endpoint
    Then the user asserts the webhook response is 422
    And the user asserts the webhook response body includes the message "Stripe payload does not match the generated contract."
