## ADDED Requirements

### Requirement: Operational Actions Regression Run Verification
The transaction integration suite SHALL verify that admin credit adjustments and admin booking operations execute cleanly with ledger updates.

#### Scenario: Admin operational transaction verification
- **WHEN** the transaction test suite runs
- **THEN** it executes admin booking creation and credit adjustments, and asserts correct ledger entries are persisted.
