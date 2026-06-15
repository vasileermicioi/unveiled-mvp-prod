# payments-subscriptions Specification Deltas

## MODIFIED Requirements

### Requirement: Stripe Subscription Lifecycle
The app SHALL maintain member subscription state and booking credit availability from Stripe subscription and invoice events plus authorized admin overrides, and SHALL expose the lifecycle controls through selector-disciplinable, bilingual UI surfaces with the required `aria-*` attributes, labels, and landmark wrappers.

#### Scenario: Initial subscription payment succeeds
- **WHEN** Stripe reports a paid subscription invoice for a member with a new refill idempotency key
- **THEN** the member subscription becomes active
- **AND** the member credit balance is refilled according to the configured plan allowance
- **AND** a credit ledger entry records the provider, invoice ID, subscription ID, amount, and idempotency key

#### Scenario: Renewal payment succeeds
- **WHEN** Stripe reports a paid renewal invoice for an existing active subscription with a new refill idempotency key
- **THEN** the member credit balance is refilled according to the configured plan allowance
- **AND** one refill ledger entry is recorded for that invoice

#### Scenario: Payment fails
- **WHEN** Stripe marks the subscription or invoice as past due, unpaid, canceled, incomplete, or requiring customer action
- **THEN** the member booking credit availability is frozen
- **AND** the member profile, billing state, ledger history, and existing bookings remain visible

#### Scenario: Duplicate webhook arrives
- **WHEN** the same Stripe event or invoice refill idempotency key is processed again
- **THEN** no duplicate refill, duplicate ledger entry, or duplicate subscription state transition is created

#### Scenario: Stripe checkout redirect button is selector-disciplinable and accessible
- **WHEN** a member views the membership page in an unpaid, frozen, or pre-checkout state
- **THEN** the Stripe checkout redirect button is reachable through a proximity+layout selector (e.g. the form's submit button) and is the unique selectable element for that affordance
- **AND** the button exposes a localized, accessible name via its text content or `aria-label`
- **AND** the button is wrapped in a form landmark with a localized `aria-label` so the checkout flow is announced as a single region

#### Scenario: Subscription portal link is selector-disciplinable and accessible
- **WHEN** a member with an active subscription views the membership page
- **THEN** the subscription portal link is reachable through a proximity+layout selector and is the unique selectable element for that affordance
- **AND** the link exposes a localized, accessible name via its text content or `aria-label`
- **AND** the link communicates its external destination (`target="_blank"`) through `aria-label` text in both EN and DE

### Requirement: Provider Event Processing
The app SHALL verify, store, and process Stripe webhook events idempotently, and SHALL describe the webhook HTTP surface in TypeSpec so the contract is the source of truth for handler validation.

#### Scenario: Webhook signature is valid
- **WHEN** Stripe sends a webhook with a valid signature over the raw request body
- **THEN** the app stores a provider event receipt keyed by provider and event ID
- **AND** processes supported event types in a database transaction

#### Scenario: Webhook signature is invalid
- **WHEN** a webhook request cannot be verified with the configured Stripe webhook secret
- **THEN** the app rejects the request without mutating subscription state, credits, payment method data, or ledger entries

#### Scenario: Unsupported event is received
- **WHEN** a verified Stripe event type is not handled by the subscription lifecycle
- **THEN** the app records the event receipt
- **AND** acknowledges it without mutating member billing state

#### Scenario: Webhook handler is contract-driven
- **WHEN** the TypeSpec project is compiled
- **THEN** a `WebhookService.stripe` operation exists in TypeSpec and its input model is the only source of truth for the parsed Stripe event payload
- **AND** the generated Zod schema validates every parsed payload before any subscription, credit, or ledger mutation runs
- **AND** the generated OpenAPI document lists the webhook endpoint under the payments-subscriptions capability

#### Scenario: Webhook handler validation surfaces schema failures
- **WHEN** a verified webhook payload does not match the generated Zod schema
- **THEN** the handler rejects the request without mutating subscription, credit, or ledger state
- **AND** the failure is recorded in the provider event log with the schema validation error
- **AND** the handler returns a 4xx response whose body is described by the TypeSpec contract

### Requirement: Subscription Data Model
The app SHALL persist provider-linked subscription records in Postgres without making Stripe payloads the primary domain model, and SHALL surface the persisted records in the credit ledger view using selector-disciplinable, accessible table semantics.

#### Scenario: Subscription is stored
- **WHEN** a member starts or syncs a Stripe subscription
- **THEN** the app stores the member ID, provider name, Stripe customer ID, Stripe subscription ID, Stripe price ID, local plan code, local status, current period bounds, cancellation timestamps when present, billing email, and last provider sync timestamp

#### Scenario: Payment method is stored
- **WHEN** Stripe provides a default or most recent payment method for the member subscription
- **THEN** the app stores display-safe payment method data such as type, brand, last four digits when available, expiry when available, SEPA bank display data when available, wallet type when available, and provider payment method ID

#### Scenario: Billing address is stored
- **WHEN** Stripe or checkout input provides billing address fields
- **THEN** the app stores display-safe billing name, country, postal code, city, line fields, and provider customer association

#### Scenario: Credit ledger view is a single accessible region
- **WHEN** a member or admin views the credit ledger
- **THEN** the ledger is rendered inside a single table landmark (`<table>` with an accessible caption or `aria-label`)
- **AND** column headers are `<th scope="col">` cells so screen readers announce the column name with each row
- **AND** each row is reachable through a proximity+layout selector anchored on a stable, localized row label (e.g. invoice ID or entry ID) so gherkin can target rows without `getByText` chains
- **AND** the table is announced as a single region (e.g. `<section aria-labelledby="...">`) with a localized heading

### Requirement: Admin Billing Overrides
The app SHALL allow authorized admins to inspect and override billing-related booking eligibility through selector-disciplinable, accessible forms, and SHALL surface the action affordances through localized labels and `aria-*` wrappers.

#### Scenario: Admin freezes member access
- **WHEN** an authorized admin freezes a member account with a reason
- **THEN** booking credit availability becomes frozen
- **AND** the override stores admin actor, reason, and timestamp

#### Scenario: Admin unfreezes member access
- **WHEN** an authorized admin removes an admin freeze from a member whose provider subscription is active
- **THEN** booking credit availability becomes available again

#### Scenario: Unauthorized override is rejected
- **WHEN** a non-admin attempts to freeze, unfreeze, or adjust billing state
- **THEN** the app rejects the request and commits no subscription, override, credit, or ledger mutation

#### Scenario: Admin freeze form is selector-disciplinable and accessible
- **WHEN** an authorized admin opens the freeze form for a member
- **THEN** the reason field is reachable through a proximity+layout selector anchored on the form's accessible name
- **AND** the freeze and unfreeze submit buttons are the unique selectable elements for their respective affordances inside that form landmark
- **AND** every input has a programmatic label (`<label for>` or `aria-label`) and the form exposes a localized `aria-label`

#### Scenario: Admin freeze form reports server errors accessibly
- **WHEN** a freeze or unfreeze submission is rejected by the server
- **THEN** the error is announced through an `aria-live` region or by associating the message with the relevant field via `aria-describedby`
- **AND** the form retains the entered reason so the admin can correct the input without retyping
