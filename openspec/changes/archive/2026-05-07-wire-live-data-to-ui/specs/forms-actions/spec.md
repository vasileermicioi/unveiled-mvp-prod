## ADDED Requirements

### Requirement: Mutations Refresh Live Product Data
Astro Action success paths SHALL invalidate or refetch every data-access query whose visible data may be affected by the mutation.

#### Scenario: Saved state mutation refreshes member discovery
- **WHEN** a member saves or unsaves an event successfully
- **THEN** member discovery and saved-event query keys for that member are invalidated or refetched.

#### Scenario: Booking mutation refreshes capacity, bookings, and wallet
- **WHEN** a member creates, cancels, checks waitlist state, or otherwise mutates booking-visible data successfully
- **THEN** affected public discovery, member discovery, member bookings, member wallet, and member ledger query keys are invalidated or refetched.

#### Scenario: Profile or preference mutation refreshes member profile
- **WHEN** a member updates profile fields or preferences successfully
- **THEN** member profile, member preferences, and any discovery queries affected by preference filters are invalidated or refetched.

#### Scenario: Partner guest mutation refreshes partner portal
- **WHEN** a partner check-in or guest-list mutation succeeds
- **THEN** partner guest and partner portal query keys for that partner are invalidated or refetched.

#### Scenario: Admin mutation refreshes operational and public data
- **WHEN** an admin mutates events, partners, members, credits, or dashboard-visible data successfully
- **THEN** affected admin query keys and any affected public, member, or partner query keys are invalidated or refetched.

### Requirement: No Realtime Listener Dependency For Action Results
Product UI updates after actions SHALL NOT depend on Firebase snapshot listeners or another realtime subscription mechanism.

#### Scenario: Action result includes invalidation hints
- **WHEN** an action mutates data used by hydrated product views
- **THEN** the action result includes query invalidation hints or enough action-specific information for the caller to invalidate affected data-access query keys.

#### Scenario: Client applies invalidation before current display
- **WHEN** a hydrated form receives a successful action result
- **THEN** it invalidates or refetches affected TanStack Query keys before presenting stale dependent query data as current.

#### Scenario: Realtime import is absent
- **WHEN** mutation result handling is implemented for product UI refresh
- **THEN** it does not import `_old_app/store.ts`, Firebase snapshot listeners, Firestore listeners, Firebase Functions, or Firebase Auth runtime modules.
