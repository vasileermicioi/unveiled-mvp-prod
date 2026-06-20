## Purpose

Define typed form and server-action behavior for user, partner, and admin mutations.
## Requirements
### Requirement: Gherkin Coverage For A Form Submission Through A Server Action
The forms-actions layer SHALL be exercised by at least one Gherkin scenario that submits a form through a server action and asserts the action result envelope, and the scenario id SHALL be referenced from this capability spec.

#### Scenario: Gherkin scenario exercises a member form submission
- **WHEN** a contributor reads `tests/features/bookings/booking.feature`
- **THEN** at least one scenario submits a booking form as a Member
- **AND** asserts that the returned result envelope (success data or field error) renders correctly
- **AND** asserts that the affected queries (bookings, dashboard, event capacity) are invalidated after success

#### Scenario: Gherkin scenario exercises an admin form submission
- **WHEN** a contributor reads `tests/features/operations/admin-crud.feature`
- **THEN** at least one scenario submits an event or partner form as an Admin
- **AND** asserts that the returned result envelope renders the matching localized error on invalid input
- **AND** asserts that the affected queries (admin list, public discovery) are invalidated after success

#### Scenario: Gherkin scenario exercises an unauthorized form submission
- **WHEN** a contributor reads `tests/features/identity/authorization.feature`
- **THEN** at least one scenario submits a protected form as the wrong role (e.g. a Member submitting an admin form)
- **AND** asserts that the action returns a safe authorization failure with no committed mutation side effect

Define typed form and server-action behavior for user, partner, and admin mutations.

### Requirement: Operations UI Forms Submit Existing Actions
Admin and partner operation forms SHALL submit through typed server actions and preserve the existing action result envelope.

#### Scenario: Admin event form submits existing operation
- **WHEN** an admin submits create, update, delete, or series event input
- **THEN** the form calls the matching authorized server action, renders returned field or form errors, and invalidates affected event, dashboard, discovery, and option-list queries after success.

#### Scenario: Admin partner form submits existing operation
- **WHEN** an admin submits partner create/update/delete, QR token rotation, or portal access provisioning input
- **THEN** the form or row action calls the matching authorized server action, renders returned field or form errors, and invalidates affected partner, portal, dashboard, and public partner queries after success.

#### Scenario: Admin member form submits existing operation
- **WHEN** an admin submits freeze, unfreeze, or credit adjustment input
- **THEN** the row action calls the matching authorized server action, renders returned errors, and invalidates affected admin member, member profile, ledger, booking eligibility, and dashboard queries after success.

#### Scenario: Partner check-in form submits existing operation
- **WHEN** a partner submits a guest check-in action
- **THEN** the row action calls the matching authorized server action, renders returned errors, and invalidates affected partner portal and guest-list queries after success.

### Requirement: Operations UI Export Actions Are Authorized
Operational export controls SHALL request export rows through authorized server action or route boundaries before client download behavior runs.

#### Scenario: Partner export uses partner scope
- **WHEN** a partner downloads guest or code export data
- **THEN** the action or route verifies partner ownership and returns only rows owned by the linked partner.

#### Scenario: Admin export uses admin scope
- **WHEN** an admin downloads booking or code export data
- **THEN** the action or route verifies admin role and returns only admin-authorized rows.

#### Scenario: Export failure renders safely
- **WHEN** export validation or authorization fails
- **THEN** the export control renders a safe visible error and does not produce a stale or unauthorized file.

### Requirement: Critical Action Regression Coverage
The app SHALL have automated regression coverage for critical typed action flows and their visible invalidation outcomes.

#### Scenario: Member actions are covered
- **WHEN** a seeded active member submits booking, waitlist, save or unsave, profile, or preference actions
- **THEN** the suite verifies the typed result state, safe failure behavior where applicable, and the invalidation expectations for affected member surfaces.

#### Scenario: Partner and admin actions are covered
- **WHEN** a seeded partner or admin submits a covered operational action
- **THEN** the suite verifies the typed result state, safe field or form errors on failure, and the invalidation expectations for affected operational and dependent surfaces.

#### Scenario: Unauthorized action calls are rejected safely
- **WHEN** the wrong role or a guest submits a protected action under the parity suite
- **THEN** the action returns the expected safe authorization failure and no protected mutation side effects are committed.

### Requirement: Booking Calendar Download Action
Booking success actions SHALL provide a safe `.ics` download affordance when the confirmed event has calendar metadata.

#### Scenario: Save the date action downloads calendar file
- **WHEN** a member reaches a confirmed booking success state for an event with calendar metadata
- **THEN** the action set includes a visible "save the date" affordance that downloads an `.ics` file for the booked event

#### Scenario: Calendar file fields are complete
- **WHEN** the calendar file is generated for a booked event
- **THEN** it includes title, start time, derived end time, venue address, and description

#### Scenario: Calendar text is escaped
- **WHEN** the calendar file is generated from title, description, partner name, or address fields containing commas, semicolons, backslashes, or newlines
- **THEN** those values are escaped according to iCalendar text formatting rules

#### Scenario: Calendar filename is stable
- **WHEN** the calendar file is generated for an event title
- **THEN** the download filename is deterministic, filesystem-safe, and ends with `.ics`

#### Scenario: Calendar action is unavailable without metadata
- **WHEN** a booking success state lacks enough calendar metadata to generate a valid file
- **THEN** the calendar action is hidden or disabled without blocking redemption display or the return-to-feed action

### Requirement: Admin Asset Upload Form Actions
Admin asset upload form actions SHALL validate file input and return safe action results that can be composed with event and partner save forms.

#### Scenario: Upload action validates image file
- **WHEN** an admin submits an event image or partner logo upload with a file content type, filename, or size outside allowed limits
- **THEN** the action returns a safe field or form error
- **AND** it does not call the storage write boundary

#### Scenario: Upload action reports progress state
- **WHEN** an admin starts an asset upload from the event or partner form
- **THEN** the UI renders an in-progress state for that upload control until the action resolves

#### Scenario: Successful upload wires result into save form
- **WHEN** an admin upload action succeeds
- **THEN** the returned display URL is placed into the matching event image or partner logo URL value used by the save action
- **AND** the admin can submit the existing save form without re-uploading the file

#### Scenario: Failed upload keeps current URL value
- **WHEN** an upload action fails after the form already has a manual or existing asset URL
- **THEN** the form displays the safe error
- **AND** keeps the current URL value unchanged for the next save attempt

#### Scenario: Save action persists uploaded URL
- **WHEN** an admin submits an event or partner save form after a successful upload
- **THEN** the save action persists the uploaded display URL in the event `imageUrl` or partner `logoUrl` field

### Requirement: Behavior Tracking Actions
The system SHALL provide server actions or endpoints to record member behavior events without blocking the member's main flow.

#### Scenario: Member opens an event detail
- **WHEN** an authenticated member opens an event, the UI triggers a non-blocking tracking call
- **THEN** the server increments the eventOpenCount, updates the viewCounts map for that event, sets the lastOpenedEventId, prepends it to recentEventIds (keeping only unique IDs, capped at a maximum of 5), and updates lastSeenAt and lastView.

#### Scenario: Member applies discovery filters
- **WHEN** an authenticated member performs a search or changes discovery filters, the UI triggers a non-blocking tracking call
- **THEN** the server increments the filterApplyCount, records the lastFilter search parameters, and updates lastSeenAt and lastView.

#### Scenario: Safe no-op tracking for guest and unauthorized users
- **WHEN** a guest or unauthenticated user triggers a behavior tracking event
- **THEN** the system ignores the tracking call without throwing an error or committing any database changes.

### Requirement: Member Checkout Form Promo Code
The checkout form SHALL forward the user-entered promo code when initiating a membership update or registration.

#### Scenario: Member submits promo code at checkout
- **WHEN** a user enters a promo code in the checkout form and clicks continue
- **THEN** the checkout button action submits the typed promo code value to the update membership server action

### Requirement: Complete Onboarding Form Preferences
The onboarding form SHALL capture and forward all selected profile preferences, including interests, moods, districts, max distance, timing, days, preferred languages, age group, and accessibility toggles, to the save onboarding server action.

#### Scenario: Member submits complete onboarding preferences wizard
- **WHEN** an authenticated member completes all steps of the onboarding wizard and submits the form
- **THEN** the onboarding form forwards the actual selected wizard choices to the save onboarding action rather than using hardcoded values

### Requirement: Admin Event Form Parity
The admin event creation and editing form SHALL include configurable controls for event categories, ticket types, language selection, target age groups, and location fields, and forward these values to the save action.

#### Scenario: Admin configures and saves voucher event
- **WHEN** an admin creates or edits an event selecting a specific category (e.g. Kultur, Theater, etc.), ticket type "Promo Code" (VOUCHER), enters promo code, website URL, selects target age groups and languages, inputs neighborhood and address, and submits the form
- **THEN** the form reads these inputs from FormData and calls the saveEvent action with the dynamic payload including the configured category, voucher ticket type, promoCode, eventWebsiteUrl, ageGroups, languages, neighborhood, and address.

#### Scenario: Admin configures and saves secret code event
- **WHEN** an admin selects ticket type "Workaround Password" (SECRET_CODE), enters secret code and secret code mode, and submits the form
- **THEN** the form reads these inputs from FormData and calls the saveEvent action with the dynamic payload containing secretCodeMode and secretCode.

### Requirement: Admin Export Action Partner Filter
The admin export server action SHALL accept an optional `partnerId` parameter to filter the exported bookings.

#### Scenario: Admin exports bookings filtered by partner
- **WHEN** an admin requests to export bookings passing a specific `partnerId`
- **THEN** the action verifies the admin role and returns only bookings linked to the specified partner.

### Requirement: Partner Booking Export Action Event Filter
The partner booking export server action SHALL accept an optional `eventId` parameter to filter the exported bookings.

#### Scenario: Partner exports bookings filtered by event
- **WHEN** a partner requests to export bookings passing a specific `eventId`
- **THEN** the action verifies the partner ownership and returns only bookings linked to the specified event.

### Requirement: Localized Action Validation Errors
Action validation schemas and server-side operations SHALL return failure/validation error messages and success feedback in the language specified by the active guest session or member locale.

#### Scenario: Validation failure returns localized message
- **WHEN** an action input validation fails
- **THEN** the returned validation error details are localized into the language specified by the active viewer or request header language parameter

### Requirement: Admin CRUD Form Validation and Localized Errors
The Admin event and partner forms SHALL validate inputs (such as emails, dates, capacities, and required fields) and return localized error feedback based on the current UI language.

#### Scenario: Admin submits invalid event details
- **WHEN** an admin submits the event form with invalid inputs (e.g. negative capacity, empty title)
- **THEN** the system SHALL display localized inline validation errors matching the selected language (DE or EN)

#### Scenario: Admin submits invalid partner details
- **WHEN** an admin submits the partner form with invalid inputs (e.g. invalid contact email format)
- **THEN** the system SHALL display localized inline validation errors matching the selected language (DE or EN)

### Requirement: Admin CRUD Form Submission Query Invalidation
The Admin event and partner forms SHALL submit update payloads with unique database IDs and trigger automatic query invalidations upon success.

#### Scenario: Admin saves event edit successfully
- **WHEN** an admin submits the event form with modified properties for an existing event ID
- **THEN** the system SHALL call the save event server action, display a success notice, and invalidate all associated queries (such as events list and public discovery data)

#### Scenario: Admin saves partner edit successfully
- **WHEN** an admin submits the partner form with modified properties for an existing partner ID
- **THEN** the system SHALL call the save partner server action, display a success notice, and invalidate all associated queries (such as partners list and partner-specific detail queries)

### Requirement: Complete Localization Verification of Form and Action Errors
All input forms, action responses, and validation constraints SHALL return complete, error-free translations in both German and English without utilizing hardcoded language fallbacks, and the signup, login, logout, and password-recovery typed server actions SHALL map every Better Auth error code through the typed `AuthErrorCopy` dictionary exposed by `src/lib/i18n.ts`.

#### Scenario: Validation error is translated
- **WHEN** any server or client input validation fails
- **THEN** all field-level validation messages and top-level alerts SHALL be rendered in the current route language.

#### Scenario: Better Auth error is mapped through the typed dictionary
- **WHEN** the signup, login, logout, or password-recovery typed server action returns a failure envelope with a Better Auth error code
- **THEN** the action returns the `safe.error` shape unchanged (so the action result envelope is preserved)
- **AND** the rendered user-facing string is the `i18n.auth.errors.<code>` entry in the active viewer language
- **AND** the action does not embed an English literal in the response payload.

#### Scenario: Unknown Better Auth code uses the missing-key placeholder
- **WHEN** the action receives a Better Auth error code that is not present in the typed `AuthErrorCopy` shape
- **THEN** the rendered string is the `{i18n.missing:<key>}` placeholder (per the i18n-copy spec)
- **AND** a console warning logs the missing key and the active language during development.

### Requirement: Astro Action Inputs Are Parsed By The Generated Zod Schema
Every Astro Action under `src/actions/index.ts` SHALL declare its input schema by importing from `src/lib/generated/actions`, and the runtime envelope SHALL remain Astro Action's `safe` / `data` / `error` shape.

#### Scenario: Action input is parsed by the generated schema
- **WHEN** an Astro Action is invoked
- **THEN** its input is parsed through the Zod schema emitted by the TypeSpec build for that action
- **AND** validation failures produce the same error envelope as the existing hand-written Zod schemas

#### Scenario: Action result type is imported from the generated module
- **WHEN** a form or page consumes an Astro Action's result
- **THEN** the consumer's TypeScript types import from `src/lib/generated/actions`
- **AND** the `safe` / `data` / `error` envelope is preserved

#### Scenario: Hand-written Zod schemas in action-contracts are replaced
- **WHEN** an Astro Action is migrated to the generated module
- **THEN** its hand-written Zod schema in `src/lib/action-contracts.ts` is removed
- **AND** `src/actions/index.ts` imports the action's input schema and result type from `@/lib/generated/actions`
- **AND** `src/lib/action-contracts.ts` becomes a thin re-export shim or is removed entirely once every action is migrated

### Requirement: Astro Actions Are The Mutation Surface From The Astro App

Astro Actions under `src/actions/index.ts` SHALL remain the only mutation surface invoked from Astro SSR pages and islands, and SHALL preserve the `safe` / `data` / `error` envelope. The canonical HTTP shape of every Astro Action SHALL additionally be exposed by `@unveiled/api` under `packages/api/src/routes/actions/**` so non-Astro callers (cron jobs, webhooks, third-party SDKs) can hit the same validators without going through Astro. After this change, requests to `/api/actions/*` are forwarded from the Astro app Worker to the API Worker via the Cloudflare service binding declared in `wrangler.toml` (`binding = "API"`).

#### Scenario: Action input is parsed by the generated schema

- **WHEN** an Astro Action is invoked
- **THEN** its input is parsed through the Zod schema emitted by the TypeSpec build for that action
- **AND** validation failures produce the same error envelope as the existing hand-written Zod schemas

#### Scenario: Action result type is imported from the generated types

- **WHEN** a form or page consumes an Astro Action's result
- **THEN** the consumer's TypeScript types import from `src/lib/generated/openapi-types.ts`
- **AND** the `safe` / `data` / `error` envelope is preserved

#### Scenario: Non-Astro caller hits the action over HTTP

- **WHEN** a cron job or third-party SDK issues `POST /api/actions/<name>` with the action's input JSON to the Astro app Worker
- **THEN** the middleware short-circuit forwards the request to `env.API.fetch(request)`
- **AND** the Hono route under `packages/api/src/routes/actions/**` validates the input against the generated Zod schema
- **AND** invokes the action handler
- **AND** returns the action's typed result envelope

#### Scenario: Action handler logic is unchanged

- **WHEN** the action handler moves from `src/actions/index.ts` to `packages/api/src/routes/actions/**`
- **THEN** the handler logic (validation, authorization, mutation, invalidation hints) is byte-equivalent to the prior Astro Action implementation
- **AND** only the HTTP binding changes (service-binding forwarding replaces the Astro catch-all shim)

### Requirement: Astro Actions Have A Canonical HTTP Shape In @unveiled/api

Every Astro Action under `src/actions/index.ts` SHALL have a matching Hono route under `packages/api/src/routes/actions/**`. The Hono route SHALL accept the action's input, invoke the action handler, and return the action's typed result envelope. Requests to `/api/actions/*` are reached via the service binding declared in `wrangler.toml`.

#### Scenario: Action HTTP shape is registered in the OpenAPI document

- **WHEN** `bun run openapi:gen` is run
- **THEN** every action under `packages/api/src/routes/actions/**` is registered with `@hono/zod-openapi` and appears in `packages/api/openapi.generated.yaml`

#### Scenario: Action HTTP shape diffs against TypeSpec

- **WHEN** `bun run openapi:check` is run
- **THEN** the registered action HTTP shapes match the AstroAction namespace declared in `typespec/main.tsp` modulo server URL

#### Scenario: /api/actions/* is reached via the service binding

- **WHEN** a request arrives at `/api/actions/<name>` at the Astro app Worker
- **THEN** the middleware short-circuit forwards the request to `env.API.fetch(request)` before any Astro guard runs
- **AND** the action handler inside the API Worker returns the action's typed result envelope
- **AND** no Astro catch-all shim under `src/pages/api/**` is involved

