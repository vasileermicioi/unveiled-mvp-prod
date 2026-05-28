## Purpose
Define typed form and server-action behavior for user, partner, and admin mutations.
## Requirements
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

