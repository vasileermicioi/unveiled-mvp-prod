# production-observability Specification

## Purpose
Define how the application exposes operational signals (structured logs, request-scoped trace ids, analytics events) for production observability.

## Requirements

### Requirement: Structured JSON Log Lines
The system SHALL emit every operational log line as a single line of valid JSON on stdout, suitable for ingestion by a log aggregation pipeline.

#### Scenario: Log line is single-line JSON
- **WHEN** any code path emits a log line through the application logger
- **THEN** the output is exactly one line of valid JSON parseable by `JSON.parse` with no embedded raw newlines.

#### Scenario: Log line carries a stable schema
- **WHEN** a log line is emitted
- **THEN** it contains the fields `timestamp` (ISO 8601 UTC), `level` (`debug|info|warn|error`), `message` (string), `service` (`unveiled-web` or `unveiled-worker`), `env` (`local|preview|production`), and a flat `context` object for additional typed fields.

#### Scenario: Log level filtering respects LOG_LEVEL
- **WHEN** `LOG_LEVEL` is set to a value such as `warn`
- **THEN** log lines with a lower severity (`debug`, `info`) are not emitted.

#### Scenario: Sensitive fields are redacted
- **WHEN** a log line would contain a known-sensitive key (`password`, `token`, `authorization`, `apiKey`, `secret`, `cookie`)
- **THEN** the value is replaced with the literal string `"[REDACTED]"` before the line is emitted.

### Requirement: Request-Scoped Logger Context
The system SHALL provide a request-scoped logger that automatically attaches the current request's trace id, route, and viewer id (when known) to every log line emitted while serving a request.

#### Scenario: Middleware attaches a child logger
- **WHEN** Astro middleware runs for a request
- **THEN** it stores a child logger on `locals.logger` bound with the current `traceId` and `route` context.

#### Scenario: Action handler logs inherit context
- **WHEN** an Astro Action handler emits a log line via the request-scoped logger
- **THEN** the emitted JSON line includes the same `traceId` and `route` fields as the request, plus the `action` name.

#### Scenario: Background work has no request context
- **WHEN** a cron or queue job emits a log line outside of a request lifecycle
- **THEN** the emitted JSON line has no `traceId` or `route` fields, but still includes `service` and `env`.

### Requirement: Logger API Surface
The system SHALL expose a typed logger API with the methods `debug`, `info`, `warn`, `error`, and `child`, and SHALL treat the logger as the only sanctioned way to emit operational log lines from application code.

#### Scenario: Logger exposes typed methods
- **WHEN** application code imports the logger
- **THEN** the logger exports a function for each of `debug`, `info`, `warn`, `error` that accepts a message string and an optional context object, plus a `child(bindings)` method that returns a new logger with merged context.

#### Scenario: Direct console use is rejected by lint
- **WHEN** application code under `src/` (excluding test files) calls `console.log`, `console.info`, `console.warn`, or `console.error`
- **THEN** Biome fails the lint with a rule that points at the application logger as the replacement.

#### Scenario: Replaced call sites still produce one log line per event
- **WHEN** a previously-console-logging call site (cron summary, action error, session-track failure) is migrated to the logger
- **THEN** the same number of log lines is emitted, and each line carries the previous call's information in the structured `context` field.
