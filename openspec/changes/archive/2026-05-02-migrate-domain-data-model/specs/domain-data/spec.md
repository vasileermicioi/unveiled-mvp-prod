## ADDED Requirements

### Requirement: Relational Domain Schema
The app SHALL model core Unveiled product data in Drizzle/Postgres tables linked to Better Auth identity.

#### Scenario: Core tables exist
- **WHEN** database migrations are applied
- **THEN** relational tables exist for user domain profiles, partners, events, bookings, waitlist entries, credit ledger entries, and saved events
- **AND** the existing Better Auth user table remains the source of authentication identity.

#### Scenario: Domain rows link to identity
- **WHEN** a domain row belongs to a user
- **THEN** it references the Better Auth user identifier through a foreign key or equivalent relational constraint.

#### Scenario: Legacy Firebase runtime is absent
- **WHEN** domain data code is implemented
- **THEN** it does not import Firebase Auth, Firestore, Firebase Functions, Firebase Storage, or legacy store runtime code.

### Requirement: Domain Business States
The domain schema SHALL preserve the old app's user-visible business states as constrained relational values.

#### Scenario: User and subscription states are available
- **WHEN** user profile rows are stored
- **THEN** role values include `USER`, `ADMIN`, and `PARTNER`
- **AND** subscription status values include `ACTIVE`, `PAUSED`, `CANCELLED_PENDING`, `INACTIVE`, `PAST_DUE`, and `UNPAID`.

#### Scenario: Event and redemption states are available
- **WHEN** event rows are stored
- **THEN** ticket type values include `VOUCHER` and `SECRET_CODE`
- **AND** secret code mode values include `MANUAL`, `SHARED_GENERATED`, and `UNIQUE_PER_BOOKING`
- **AND** timing mode values include fixed time slot and all-day event behavior.

#### Scenario: Booking and accounting states are available
- **WHEN** booking, waitlist, or ledger rows are stored
- **THEN** booking status values include `CONFIRMED`, `WAITLIST`, `CANCELLED`, and `USED`
- **AND** waitlist status values include `WAITING`, `PROMOTED`, and `CANCELLED`
- **AND** ledger type values include subscription refill, purchase, booking, expiry, refund, admin adjustment, and referral bonus.

### Requirement: User Domain Profile
The domain schema SHALL store member, partner, and admin profile data needed by later auth, shell, onboarding, profile, and admin flows.

#### Scenario: Profile fields are stored
- **WHEN** a user domain profile is created
- **THEN** it can store role, optional partner linkage, credit balance, selected language, first name, last name, email-facing profile state, onboarding completion, subscription state, and billing/provider identifiers.

#### Scenario: Preference fields are stored
- **WHEN** member preference data is saved
- **THEN** it can preserve age group, interests, moods, districts, max distance, timing preferences, preferred days, preferred languages, accessibility preference, newsletter status, and update timestamps.

#### Scenario: Behavior data is stored
- **WHEN** behavior/audit counters are persisted
- **THEN** the schema can preserve session count, event-open count, booking count, waitlist count, save/unsave counts, filter apply count, recent event IDs, last seen/view data, and last filter metadata.

### Requirement: Partner Domain Data
The domain schema SHALL store partner venue data needed for discovery, partner portal, admin management, and venue check-in.

#### Scenario: Partner fields are stored
- **WHEN** a partner row is created
- **THEN** it stores name, address, contact email, optional logo URL, optional venue check-in token, optional portal user linkage, and created/updated timestamps.

#### Scenario: Partner ownership is enforceable
- **WHEN** a partner portal user is linked to a partner
- **THEN** the schema can identify which partner-owned events and bookings the user is allowed to manage in later server actions.

### Requirement: Event Domain Data
The domain schema SHALL store event data needed for discovery, maps, booking, admin management, and public previews.

#### Scenario: Event fields are stored
- **WHEN** an event row is created
- **THEN** it stores partner reference, title, description, category, event type, timing data, address, neighborhood, optional coordinates, image URL, tags, credit price, total capacity, remaining capacity, ticket type, redemption configuration, accessibility, language, age targeting, and created/updated timestamps.

#### Scenario: Event display data can be joined
- **WHEN** event display view models are derived
- **THEN** partner name, address, and logo can be resolved from the related partner row rather than requiring a duplicated event partner name field.

#### Scenario: Event capacity fields exist
- **WHEN** later booking transactions run
- **THEN** event rows expose total capacity and remaining capacity fields suitable for transactional updates.

### Requirement: Booking Waitlist And Ledger Data
The domain schema SHALL store booking, waitlist, and ledger records needed for member tickets, partner check-in, admin operations, and credit accounting.

#### Scenario: Booking fields are stored
- **WHEN** a booking row is created
- **THEN** it stores user reference, event reference, partner reference, ticket count, total credits, status, redemption type, redemption info, optional redemption URL, optional idempotency key, optional checked-in timestamp, and created/updated timestamps.

#### Scenario: Waitlist fields are stored
- **WHEN** a waitlist entry is created
- **THEN** it stores event reference, user reference, requested quantity, status, and created/updated timestamps.

#### Scenario: Ledger fields are stored
- **WHEN** a credit ledger entry is created
- **THEN** it stores user reference, signed amount, balance after mutation, ledger type, description, optional idempotency key, and timestamp.

### Requirement: Saved Events Relation
The domain schema SHALL store saved events as a relational association rather than a user document array.

#### Scenario: Saved event is unique per user
- **WHEN** a user saves an event
- **THEN** the schema prevents duplicate saved-event rows for the same user and event.

#### Scenario: Saved count can be queried
- **WHEN** the app shell or saved-events page needs saved count data
- **THEN** the saved-events relation supports efficient counting and listing by user.

### Requirement: Query Indexes And Constraints
The domain schema SHALL include indexes and constraints for known migrated query patterns.

#### Scenario: Discovery queries are indexed
- **WHEN** events are listed by date, category, partner, or date range
- **THEN** the schema includes indexes that support those filters and sort order.

#### Scenario: Booking queries are indexed
- **WHEN** member bookings or partner guest lists are loaded
- **THEN** the schema includes indexes for bookings by user and created date, partner and created date, partner and status, and event where needed.

#### Scenario: Waitlist and ledger queries are indexed
- **WHEN** waitlist or ledger views are loaded
- **THEN** the schema includes indexes for waitlist entries by event/date and user/date, and ledger entries by user/timestamp.

#### Scenario: Idempotency is enforceable
- **WHEN** later transactional actions use idempotency keys
- **THEN** booking or ledger schema supports uniqueness constraints that prevent duplicate effects for the same operation scope.

### Requirement: Development Seed Data
The app SHALL provide manual development seed data for the migrated domain model.

#### Scenario: Seed creates demo partners and events
- **WHEN** the seed command runs on an empty development database
- **THEN** it creates demo partner and event rows equivalent to the old app's built-in Berlin examples.

#### Scenario: Seed is idempotent
- **WHEN** the seed command is run multiple times
- **THEN** it does not create duplicate demo partners or events.

#### Scenario: Seed avoids auth and payments
- **WHEN** development seed data is created
- **THEN** it does not create Better Auth accounts, passwords, payment customers, subscriptions, bookings, or ledger entries.
