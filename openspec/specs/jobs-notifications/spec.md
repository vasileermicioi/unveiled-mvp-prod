# jobs-notifications Specification

## Purpose
Define requirements for daily passcode emails and scheduled notifications.

## Requirements

### Requirement: Scheduled Partner Code Email
The system SHALL send upcoming event passcodes to partner contacts on a daily Cloudflare-compatible schedule without relying on Firebase Functions.

#### Scenario: Partner has upcoming code-backed bookings
- **WHEN** the daily partner code job runs for the next Europe/Berlin event window
- **THEN** the system finds confirmed bookings for upcoming events with redemption information, groups codes by partner contact, and sends one passcode email per sendable partner.

#### Scenario: No sendable codes exist
- **WHEN** the daily partner code job runs and there are no upcoming bookings with redemption information
- **THEN** the system exits without error and records a safe skip result.

#### Scenario: Partner contact email is missing
- **WHEN** an upcoming event has code-backed bookings but its partner has no contact email
- **THEN** the system does not send an email for that partner and records a safe skip result.

### Requirement: Berlin Event Window
The system SHALL calculate the daily partner code job window using Europe/Berlin event timing.

#### Scenario: Scheduled run selects next Berlin day
- **WHEN** the scheduled job runs at `59 23 * * *`
- **THEN** the system selects events in the next Europe/Berlin day window and excludes events outside that window.

#### Scenario: Daylight-saving boundary
- **WHEN** the selected Europe/Berlin day crosses a daylight-saving transition
- **THEN** the system still includes events by local Berlin day boundaries rather than a fixed UTC offset.

### Requirement: Resend Delivery
The system SHALL deliver partner passcode emails through Resend using configured server-side credentials.

#### Scenario: Email send succeeds
- **WHEN** Resend accepts a partner passcode email
- **THEN** the system records the partner, job window, sent status, and provider message metadata without recording secret values.

#### Scenario: Email provider fails
- **WHEN** Resend returns an error for a partner passcode email
- **THEN** the system records the partner, job window, failed status, and safe error details for operational review.

#### Scenario: Resend API key is missing
- **WHEN** the job runs without `RESEND_API_KEY`
- **THEN** the system does not attempt delivery and records a safe skipped configuration result.

### Requirement: Duplicate Send Protection
The system SHALL prevent duplicate partner passcode emails for the same job window and partner unless an explicit operator retry path is used.

#### Scenario: Scheduled run is invoked twice
- **WHEN** the job is invoked more than once for the same partner and event window
- **THEN** the system sends at most one partner passcode email for that partner and records duplicate invocations as skipped or already claimed.

#### Scenario: Provider failure is recorded
- **WHEN** a send attempt fails after the job claims a partner and window
- **THEN** the system preserves the failure result so operators can review whether a controlled retry is needed.

### Requirement: Manual Job Trigger
The system SHALL provide a local or development trigger for the daily partner code job that uses the same domain logic as the scheduled run.

#### Scenario: Developer runs the manual trigger
- **WHEN** a developer invokes the manual job trigger with local environment configuration
- **THEN** the system executes the same event lookup, grouping, idempotency, rendering, and delivery path used by the scheduled job.

#### Scenario: Manual trigger runs without sendable data
- **WHEN** the manual trigger finds no sendable partner codes
- **THEN** the system returns a successful skipped result suitable for local verification.

### Requirement: Safe Operational Logging
The system SHALL record operational job outcomes without leaking API keys, authorization headers, or full provider request payloads.

#### Scenario: Job records outcomes
- **WHEN** the job skips, sends, detects a duplicate, or fails a partner send
- **THEN** the system records job name, partner identity, window identity, status, timestamps, and safe details only.

#### Scenario: Error contains sensitive details
- **WHEN** a provider or runtime error includes secret-like values
- **THEN** the system excludes secrets and raw authorization data from logs and persisted job records.

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
