## MODIFIED Requirements

### Requirement: Safe Operational Logging
The system SHALL record operational job outcomes without leaking API keys, authorization headers, or full provider request payloads, and SHALL emit those records as structured JSON log lines through the application logger.

#### Scenario: Job records outcomes
- **WHEN** the job skips, sends, detects a duplicate, or fails a partner send
- **THEN** the system records job name, partner identity, window identity, status, timestamps, and safe details only.

#### Scenario: Error contains sensitive details
- **WHEN** a provider or runtime error includes secret-like values
- **THEN** the system excludes secrets and raw authorization data from logs and persisted job records.

#### Scenario: Job log line is structured JSON
- **WHEN** the partner code job emits an outcome line
- **THEN** the line is emitted through the application logger as a single JSON object on stdout, with `level: "info"`, `service: "unveiled-worker"`, a `jobName` of `daily-partner-codes`, and a `context` object containing `status`, `sent`, `failed`, `skipped`, `duplicates`, `window`, `cron`, and `scheduledTime`.

#### Scenario: Skipped job is structured
- **WHEN** the scheduled job starts without `DATABASE_URL`
- **THEN** the system emits a single JSON log line with `level: "warn"`, `jobName: "daily-partner-codes"`, `status: "skipped"`, `reason: "missing_database_url"`, and `scheduledTime` in ISO 8601.
