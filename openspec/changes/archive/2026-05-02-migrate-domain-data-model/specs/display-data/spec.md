## ADDED Requirements

### Requirement: Relational Display Derivation
Display view models SHALL be derivable from the relational domain schema while preserving existing UI-visible fields.

#### Scenario: Event display data is derived
- **WHEN** event cards, event details, maps, admin event rows, or public previews load from Postgres
- **THEN** the display data includes the same visible event fields currently required by the display-data spec
- **AND** partner display fields can be joined from the related partner row.

#### Scenario: User display data is derived
- **WHEN** navigation, profile, onboarding, shell counts, or admin member rows load from Postgres
- **THEN** the display data includes role, credits, saved count, selected language, profile fields, subscription labels, preference values, and behavior counts needed by the existing UI contracts.

#### Scenario: Booking and ledger display data is derived
- **WHEN** booking cards, redemption panels, partner guest rows, exports, admin metrics, or ledger history load from Postgres
- **THEN** the display data includes ticket counts, status labels, redemption details, checked-in timestamps, joined event/partner fields, export columns, credit balances, and credit-burn metrics required by existing UI contracts.

### Requirement: Server-Derived Counts And Labels
The app SHALL derive counts and labels from relational rows instead of legacy Firestore document structures.

#### Scenario: Shell counts are derived
- **WHEN** the app shell renders for a member
- **THEN** saved-event count and credit count can be derived from relational saved-event and user profile data.

#### Scenario: Discovery labels are derived
- **WHEN** discovery loads event data
- **THEN** active range labels, visible result counts, category options, partner options, and map marker fields can be derived from relational event and partner rows.

#### Scenario: Admin and partner metrics are derived
- **WHEN** operational surfaces load dashboard or portal data
- **THEN** total bookings, credits burned, active partners, total guests, and guest totals can be derived from relational bookings, ledger, partner, and event rows.
