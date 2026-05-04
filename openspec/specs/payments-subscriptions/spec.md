# payments-subscriptions Specification

## Purpose
TBD - created by archiving change migrate-payments-subscriptions. Update Purpose after archive.
## Requirements
### Requirement: Stripe Subscription Lifecycle
The app SHALL maintain member subscription state and booking credit availability from Stripe subscription and invoice events plus authorized admin overrides.

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

### Requirement: Subscription Data Model
The app SHALL persist provider-linked subscription records in Postgres without making Stripe payloads the primary domain model.

#### Scenario: Subscription is stored
- **WHEN** a member starts or syncs a Stripe subscription
- **THEN** the app stores the member ID, provider name, Stripe customer ID, Stripe subscription ID, Stripe price ID, local plan code, local status, current period bounds, cancellation timestamps when present, billing email, and last provider sync timestamp

#### Scenario: Payment method is stored
- **WHEN** Stripe provides a default or most recent payment method for the member subscription
- **THEN** the app stores display-safe payment method data such as type, brand, last four digits when available, expiry when available, SEPA bank display data when available, wallet type when available, and provider payment method ID

#### Scenario: Billing address is stored
- **WHEN** Stripe or checkout input provides billing address fields
- **THEN** the app stores display-safe billing name, country, postal code, city, line fields, and provider customer association

### Requirement: Provider Event Processing
The app SHALL verify, store, and process Stripe webhook events idempotently.

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

### Requirement: Credit Refill Policy
The app SHALL apply monthly subscription credits from paid provider invoices with explicit idempotency and no automatic rollover.

#### Scenario: Monthly refill applies
- **WHEN** a paid Stripe invoice is eligible for the `BASIC_BERLIN` plan
- **THEN** the app refills the member to the configured monthly plan allowance
- **AND** writes the refill as a credit ledger entry with provider invoice metadata

#### Scenario: Credits do not roll over automatically
- **WHEN** a monthly refill is applied to a member with unused plan credits
- **THEN** the app does not accumulate an additional full monthly allowance on top of unused plan credits
- **AND** the ledger records the actual adjustment required to reach the plan allowance

#### Scenario: Admin adjustment remains auditable
- **WHEN** an authorized admin manually adjusts member credits
- **THEN** the adjustment is written as a separate ledger entry with admin actor metadata and reason
- **AND** provider refill processing does not delete or rewrite the admin adjustment entry

### Requirement: Plan And Provider Mapping
The app SHALL map the visible `BASIC_BERLIN` membership plan to configured Stripe Billing records.

#### Scenario: Basic Berlin plan is configured
- **WHEN** checkout initializes for the membership plan
- **THEN** the app uses the configured Stripe recurring price for `BASIC_BERLIN`
- **AND** displays the plan as `Basic Berlin` priced at `29€/mo`

#### Scenario: Promo code is submitted
- **WHEN** a member submits a promo code during checkout
- **THEN** the app validates and applies it through Stripe promotion or coupon configuration when supported
- **AND** the promo code does not change the monthly credit allowance unless a configured plan policy explicitly says so

### Requirement: Admin Billing Overrides
The app SHALL allow authorized admins to inspect and override billing-related booking eligibility.

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

