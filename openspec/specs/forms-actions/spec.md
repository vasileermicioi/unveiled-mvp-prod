# forms-actions Specification

## Purpose
TBD - created by archiving change migrate-forms-actions. Update Purpose after archive.
## Requirements
### Requirement: Shared Form Schemas
The app SHALL define UI-facing Zod schemas for mutating form submissions.

#### Scenario: Auth schema validates visible auth fields
- **WHEN** login, signup, or password recovery input is submitted
- **THEN** the schema validates only the visible auth fields required for that mode
- **AND** invalid fields receive user-facing messages suitable for rendering beside the field.

#### Scenario: Preference schema validates onboarding and profile preferences
- **WHEN** onboarding or profile preference input is submitted
- **THEN** the schema validates age group, interests, moods, districts, max distance, timing, preferred days, preferred languages, accessibility state, and related option constraints.

#### Scenario: Admin event schema validates event and series input
- **WHEN** an admin submits event or event series input
- **THEN** the schema validates partner host, title, date/time or all-day timing, recurrence values, capacity, credits, redemption configuration, language, accessibility, age targeting, image values, and description.

#### Scenario: Schema excludes persistence-only fields
- **WHEN** a UI schema is used for form validation
- **THEN** it does not accept database-only fields such as generated identifiers, audit timestamps, derived counters, provider secrets, or authorization-controlled role ownership fields.

### Requirement: Astro Action Mutations
User-facing mutating forms SHALL submit through typed Astro Actions backed by Zod validation.

#### Scenario: Field validation fails
- **WHEN** submitted form data is invalid
- **THEN** the action returns field-associated validation messages
- **AND** no database, Better Auth, or domain mutation is committed.

#### Scenario: Mutation succeeds
- **WHEN** submitted form data is valid and the viewer is authorized
- **THEN** the action commits the intended mutation
- **AND** the response includes a success state and any TanStack Query invalidation hints needed by hydrated client views.

#### Scenario: Authorization fails
- **WHEN** a user submits an action without the required authentication, role, ownership, or partner access
- **THEN** the action returns a safe user-facing form error
- **AND** protected data is not read beyond what is necessary for authorization
- **AND** no mutation is committed.

### Requirement: Action Result Envelope
Form actions SHALL return a consistent typed result envelope.

#### Scenario: Field errors are returned
- **WHEN** validation identifies one or more invalid fields
- **THEN** the result includes `ok: false` and field errors keyed by form field path.

#### Scenario: Form error is returned
- **WHEN** submission fails for a non-field reason such as authorization, unavailable resource, duplicate effect, or rejected business state
- **THEN** the result includes `ok: false` and a safe form-level error message or message key.

#### Scenario: Success result is returned
- **WHEN** submission succeeds
- **THEN** the result includes `ok: true`
- **AND** it includes any success notice, action-specific data, and query invalidation hints required by the calling view.

### Requirement: React Hook Form Integration
React form islands SHALL integrate Astro Action results with React Hook Form state.

#### Scenario: Server field errors render beside fields
- **WHEN** an action returns field errors
- **THEN** the React form applies them to the corresponding React Hook Form fields without duplicating validation message mapping.

#### Scenario: Successful action invalidates queries
- **WHEN** an action succeeds with invalidation hints
- **THEN** the React form invalidates the indicated TanStack Query keys before or while rendering the success state.

#### Scenario: Local-only controls remain client state
- **WHEN** a control only filters, sorts, opens UI, advances wizard display, or changes unsaved draft state
- **THEN** it does not need to submit an Astro Action unless it commits server data.

### Requirement: Legacy Runtime Boundary
Form action implementation SHALL remain independent of legacy Firebase runtime mutation paths.

#### Scenario: Legacy store is absent
- **WHEN** form schemas, action handlers, or form submission helpers are implemented
- **THEN** they do not import `_old_app/store.ts`, Firebase Auth, Firestore, Firebase Functions, or Firebase Storage runtime modules.

#### Scenario: Legacy messages are preserved as references
- **WHEN** old form validation messages are visible in migrated UI
- **THEN** equivalent localized user-facing messages are preserved without depending on old runtime code.

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

