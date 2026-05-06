## Why

The legacy Firebase Functions scheduler sends daily partner passcode emails, but Firebase scheduler/functions are not part of the target hosting plan. The new app needs a Cloudflare-compatible scheduled/background workflow so partners continue receiving upcoming event redemption codes after migration.

## What Changes

- Add scheduled job support for operational notifications on the Cloudflare deployment target.
- Implement a daily partner passcode email job that runs at `59 23 * * *` using Europe/Berlin event-window logic.
- Query Postgres for upcoming events and confirmed bookings with redemption information, group sendable codes by partner, and send partner emails through Resend.
- Add safe logging for empty runs, skipped partners, successful sends, and provider failures without exposing secrets.
- Add required environment variables for Resend and the daily codes sender address.
- Add a local/manual trigger for development and operational verification.
- Add persisted duplicate-send protection for scheduled retry or duplicate invocation scenarios.

## Capabilities

### New Capabilities

- `jobs-notifications`: Covers scheduled/background notification jobs, including daily partner passcode emails, Resend delivery, safe operational logs, local/manual execution, and duplicate-send protection.

### Modified Capabilities

- None.

## Impact

- Adds Cloudflare scheduled job entrypoint or equivalent worker wiring for the target deployment.
- Adds notification/job domain code, Resend client configuration, and tests around scheduled partner code email behavior.
- Adds Postgres schema or existing-table extensions for job send logs if duplicate-send protection requires persistence.
- Updates `.env.example` with `RESEND_API_KEY` and `DAILY_CODES_FROM_EMAIL`.
- References legacy behavior from `_old_app/functions/src/index.ts` while implementing the workflow with the new Astro, Drizzle, Postgres, and Cloudflare-compatible architecture.
