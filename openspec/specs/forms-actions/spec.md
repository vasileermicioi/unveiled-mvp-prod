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

