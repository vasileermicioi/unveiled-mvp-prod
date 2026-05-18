## ADDED Requirements

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
