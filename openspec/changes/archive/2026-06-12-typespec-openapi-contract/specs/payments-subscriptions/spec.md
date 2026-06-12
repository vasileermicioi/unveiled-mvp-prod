## ADDED Requirements

### Requirement: Webhook Payload Is Validated Against The Generated Contract
The Stripe webhook handler SHALL validate the parsed payload against the Zod schema emitted by the TypeSpec build for `WebhookService.stripe` before mutating any subscription, credit, or ledger state.

#### Scenario: Verified webhook passes schema validation
- **WHEN** a webhook request passes `Stripe-Signature` verification
- **THEN** the parsed payload is validated against the generated Zod schema
- **AND** the handler processes the event only if the schema matches

#### Scenario: Schema validation failure rejects the request
- **WHEN** a verified webhook payload does not match the generated Zod schema
- **THEN** the handler rejects the request without mutating subscription, credit, or ledger state
- **AND** records the failure in the provider event log for audit

#### Scenario: Stripe payload types live in the contract
- **WHEN** the TypeSpec project is compiled
- **THEN** the `WebhookService.stripe` operation's input model describes the supported `StripeEvent` variants (subscription, invoice, payment method, billing address) and their payload shapes
- **AND** the Stripe API client response shapes (Subscription, Invoice, PaymentMethod, Customer) are typed in TypeSpec and imported by the webhook handler
