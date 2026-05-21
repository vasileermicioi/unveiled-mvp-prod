# data-access Specification

## Purpose
Define authorized loader and query models for partner and admin operations UI, along with invalidation scopes.
## Requirements
### Requirement: Operational Read Models Cover Live UI Parity
The data-access layer SHALL provide authorized read models for the complete partner and admin operations UI.

#### Scenario: Partner operations read model is loaded
- **WHEN** `/partner` loads or refetches for an authenticated partner
- **THEN** data access verifies partner role and ownership before returning partner details, QR path/token status, event options, guest rows, check-in state, aggregate guest counts, and export row availability for only the linked partner.

#### Scenario: Admin event operations read model is loaded
- **WHEN** `/admin` event data loads or refetches for an authenticated admin
- **THEN** data access verifies admin role before returning event rows, partner options, event form option lists, event export data, dashboard-affecting counts, and public-discovery invalidation targets.

#### Scenario: Admin partner operations read model is loaded
- **WHEN** `/admin` partner data loads or refetches for an authenticated admin
- **THEN** data access verifies admin role before returning partner rows, portal linkage fields, QR token state, venue QR URLs, partner form values, and public/partner invalidation targets.

#### Scenario: Admin member operations read model is loaded
- **WHEN** `/admin` member data loads, refetches, or expands a member row for an authenticated admin
- **THEN** data access verifies admin role before returning member rows, provider fields where available, freeze state, credits, booking counts, event-open counts, saved/waitlist counts, preferences, history summaries, ledger rows, and eligibility-affecting fields.

### Requirement: Operational Query Keys And Refresh Scope Are Precise
Operational data-access query keys and invalidation hints SHALL distinguish admin and partner surfaces, entity identifiers, ownership scope, and active filters.

#### Scenario: Partner mutation invalidates scoped portal data
- **WHEN** partner check-in or export-visible guest state changes
- **THEN** invalidation hints target only the linked partner portal, guest-list, export, and affected booking query keys.

#### Scenario: Admin event mutation invalidates dependent data
- **WHEN** an admin event or series mutation succeeds
- **THEN** invalidation hints target affected admin event, dashboard, partner option, public discovery, member discovery, and export query keys.

#### Scenario: Admin partner mutation invalidates dependent data
- **WHEN** an admin partner, QR token, portal access, or partner deletion mutation succeeds
- **THEN** invalidation hints target affected admin partner, partner portal, public partner, event option, dashboard, and export query keys.

#### Scenario: Admin member mutation invalidates dependent data
- **WHEN** an admin member freeze/unfreeze or credit adjustment mutation succeeds
- **THEN** invalidation hints target affected admin member, member profile, member ledger, booking eligibility, wallet, and dashboard query keys.

### Requirement: Authorized Regression Read Coverage
The data-access layer SHALL have regression coverage that proves route loaders and query read models return only authorized seeded data for the active role.

#### Scenario: Protected route data stays role-scoped
- **WHEN** member, partner, admin, or venue check-in data loaders run under the parity suite
- **THEN** each loader returns only the seeded rows authorized for that route owner and does not expose protected rows from another role or entity scope.

#### Scenario: Production routes do not depend on demo data
- **WHEN** route loaders and query mappers populate seeded production pages
- **THEN** the resulting read models can satisfy visible parity assertions without requiring hard-coded workbench or demo fixture rows.

#### Scenario: Mutation refresh targets stay precise
- **WHEN** a covered booking, profile, partner, or admin mutation succeeds
- **THEN** regression assertions verify that invalidation hints and affected query keys target the specific route-owned data sets that should refresh.

### Requirement: Member Behavior Analytics Loader
The data-access layer SHALL load complete and aggregated member behavior metrics for the admin interface.

#### Scenario: Behavior metrics are loaded for admin member view
- **WHEN** the admin loads or expands a member's profile
- **THEN** the returned read model includes the correct values for sessionCount, eventOpenCount, bookingCount, waitlistCount, savedCount, unsavedCount, filterApplyCount, recentEventIds, and lastSeenAt.

