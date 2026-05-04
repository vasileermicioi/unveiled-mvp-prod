## ADDED Requirements

### Requirement: Billing Display Fields
Member-facing and admin-facing UI SHALL receive display-safe billing, payment method, subscription status, and credit refill fields derived from provider-backed subscription records.

#### Scenario: Member billing fields are available
- **WHEN** profile, membership, or billing status UI renders for a member
- **THEN** required fields are plan label, plan price label, local subscription status label, provider action-required label when applicable, next bill date, current period end, billing address display, payment method display, support email, and booking availability state

#### Scenario: Frozen billing fields are available
- **WHEN** a member is frozen because of provider billing state or admin override
- **THEN** required fields are frozen reason label, recovery or support action label, support email, booking disabled state, and profile/bookings visibility state

#### Scenario: Admin billing fields are available
- **WHEN** an admin member detail or billing row renders
- **THEN** required fields are provider customer ID, provider subscription ID, local subscription status label, provider status label, last provider sync timestamp, current period bounds, payment method display, credit balance, and available billing override actions

### Requirement: Subscription Credit Ledger Display Fields
Credit ledger UI SHALL distinguish provider refills, booking debits, and admin adjustments without exposing unsafe provider payloads.

#### Scenario: Provider refill ledger fields are available
- **WHEN** a subscription refill ledger entry renders
- **THEN** required fields are ledger entry ID, credit amount, direction, reason/source label, provider label, invoice reference label, created date, resulting balance when available, and idempotency reference when shown to admins

#### Scenario: Manual adjustment ledger fields are available
- **WHEN** an admin adjustment ledger entry renders
- **THEN** required fields are ledger entry ID, credit amount, direction, reason text, admin actor label, created date, and resulting balance when available
