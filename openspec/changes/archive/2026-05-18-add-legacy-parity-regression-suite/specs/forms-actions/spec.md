## ADDED Requirements

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
