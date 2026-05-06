## ADDED Requirements

### Requirement: Cloudflare Scheduled Execution
The system SHALL execute scheduled notification jobs through a Cloudflare-compatible schedule without relying on Firebase Functions or Node-only runtime behavior.

#### Scenario: Cloudflare schedule invokes partner code job
- **WHEN** the configured daily Cloudflare schedule fires
- **THEN** it invokes the same partner code job domain logic used by the manual trigger.

#### Scenario: Scheduled runtime has required secrets
- **WHEN** the scheduled job starts in preview or production
- **THEN** it can access required database and Resend configuration through Cloudflare environment configuration.

#### Scenario: Scheduled runtime misses required secrets
- **WHEN** the scheduled job starts without a required database or email secret
- **THEN** it records a safe skipped configuration result and does not attempt provider delivery.

### Requirement: Scheduled Job Observability
The system SHALL expose safe operational visibility for Cloudflare scheduled notification executions.

#### Scenario: Scheduled invocation is recorded
- **WHEN** Cloudflare invokes a scheduled notification job
- **THEN** the system records job name, scheduled time, runtime environment, status, and safe details.

#### Scenario: Operator reviews job failure
- **WHEN** a scheduled notification job fails in Cloudflare
- **THEN** logs and persisted job records contain enough safe context to identify the job window and failure category without exposing secrets or full provider payloads.
