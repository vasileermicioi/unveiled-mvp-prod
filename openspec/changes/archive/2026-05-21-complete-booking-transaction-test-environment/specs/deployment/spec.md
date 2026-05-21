## ADDED Requirements

### Requirement: Transaction Test Environment Validation
The app SHALL provide a script to validate the transaction test environment configuration before test execution.

#### Scenario: Script detects missing configuration
- **WHEN** the validation script runs without a configured test database URL
- **THEN** it exits with a non-zero code and logs a descriptive setup error.

#### Scenario: Script detects active configuration
- **WHEN** the validation script runs with a valid test database URL
- **THEN** it exits with code 0 and logs verification success.
