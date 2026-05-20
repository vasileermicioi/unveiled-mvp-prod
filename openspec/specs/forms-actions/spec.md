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

