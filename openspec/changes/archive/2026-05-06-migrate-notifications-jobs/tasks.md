## 1. Job Configuration And Data Model

- [x] 1.1 Add Resend/job environment parsing for `RESEND_API_KEY` and `DAILY_CODES_FROM_EMAIL`.
- [x] 1.2 Update `.env.example` with the Resend/job variables and safe placeholder values.
- [x] 1.3 Add a persisted job send log schema for job name, partner ID, window start/end, status, provider metadata, safe error details, and timestamps.
- [x] 1.4 Add a database migration and schema assertions for the unique job/partner/window duplicate-send key.

## 2. Core Partner Code Job

- [x] 2.1 Implement Europe/Berlin event-window calculation for the scheduled daily run.
- [x] 2.2 Implement the Postgres query for upcoming events, partners, and confirmed bookings with redemption information.
- [x] 2.3 Implement grouping of sendable booking codes by partner and event.
- [x] 2.4 Implement skip results for no events, no sendable bookings, missing partner contact emails, and missing email configuration.
- [x] 2.5 Implement partner/window send claiming with duplicate detection through the persisted send log.

## 3. Email Delivery

- [x] 3.1 Add a Resend email client wrapper that keeps API keys and authorization headers out of logs.
- [x] 3.2 Implement plain-text and HTML passcode email rendering with escaped partner, event, booking, user, ticket, and address values.
- [x] 3.3 Record successful sends with partner/window status and safe provider message metadata.
- [x] 3.4 Record failed sends with partner/window status and safe provider error details.

## 4. Runtime Entrypoints

- [x] 4.1 Add a Cloudflare-compatible scheduled entrypoint for `59 23 * * *` that calls the shared job service.
- [x] 4.2 Add a manual local/dev trigger that calls the same job service and returns a structured result.
- [x] 4.3 Ensure scheduled and manual paths share the same lookup, grouping, idempotency, rendering, and delivery code.

## 5. Verification

- [x] 5.1 Add unit tests for Berlin window calculation, including daylight-saving boundary cases.
- [x] 5.2 Add tests for grouping sendable partner payloads and skipping missing contact emails or missing redemption data.
- [x] 5.3 Add tests for duplicate scheduled invocations sending at most one email per partner/window.
- [x] 5.4 Add tests for Resend success, provider failure, and secret-safe logging/error persistence.
- [x] 5.5 Run the project checks and relevant test suite.
- [x] 5.6 Run OpenSpec status or validation for `migrate-notifications-jobs` and confirm the change is apply-ready.
