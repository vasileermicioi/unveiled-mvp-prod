## Context

The legacy app uses Firebase Functions `onSchedule` to run `emailDailyPartnerCodes` at `59 23 * * *` in `Europe/Berlin`, then sends grouped partner passcode emails through Resend. The new app is Astro with Drizzle/Postgres and targets Cloudflare-compatible hosting, so scheduled work must not depend on Firebase Functions or Firestore.

The current Postgres model already has the core data needed for the job: `events.dateTime`, `events.partnerId`, `events.address`, partner contact emails, booking redemption fields, booking status, ticket count, user ID, and event/booking indexes. The missing pieces are a Cloudflare scheduled entrypoint, Resend configuration, a reusable job service, and duplicate-send protection.

## Goals / Non-Goals

**Goals:**

- Run the daily partner passcode email workflow outside Firebase on a Cloudflare-compatible schedule.
- Preserve the business behavior of the legacy job while querying Postgres instead of Firestore.
- Send one email per partner with all sendable upcoming event codes in the next Berlin-day window.
- Record safe operational results for skipped, sent, duplicate, and failed partner sends.
- Provide a manual local/dev trigger that exercises the same job logic as the scheduled path.
- Prevent duplicate partner emails when a scheduled run is retried or invoked twice for the same window.

**Non-Goals:**

- Building a general marketing email, campaign, or newsletter system.
- Changing payment webhook behavior.
- Adding partner portal UI changes.
- Preserving Firebase Functions architecture or Firestore data access patterns.

## Decisions

1. Use a Cloudflare scheduled Worker-compatible entrypoint that calls shared TypeScript job code.

   The job logic will live in application modules under `src/lib/jobs` or similar, while the Cloudflare entrypoint stays thin and deployment-specific. This keeps querying, grouping, idempotency, email rendering, and Resend delivery testable without requiring a Worker runtime in most unit tests.

   Alternative considered: embed the full job inside an Astro route or page function. That would be easier to invoke manually but weaker for scheduled execution and would couple operational behavior to HTTP routing.

2. Compute the target window as the next Europe/Berlin calendar day for the scheduled run.

   The legacy implementation used a rolling next-24-hours window, while the requested migration calls for Europe/Berlin next-24-hours/day logic. The new implementation should centralize the window calculation and test it across daylight-saving boundaries. Scheduled execution at `23:59` Berlin time should select events beginning on the next Berlin day.

   Alternative considered: use UTC-only rolling 24-hour windows. That is simpler but can select the wrong local day around timezone boundaries and would not match partner-facing expectations.

3. Add a persisted send log keyed by job name, partner ID, and window start/end.

   Before sending a partner email, the job records or claims the send attempt in Postgres. A unique key prevents duplicate sends for the same partner and event window if Cloudflare retries, a deploy overlaps, or an operator manually triggers the job twice. The log stores status, safe error details, provider message ID when available, and timestamps.

   Alternative considered: no persistence and rely on Cloudflare scheduler behavior. That leaves duplicate partner emails possible during retries or manual verification.

4. Use direct Resend HTTP integration behind a small client wrapper.

   A minimal wrapper around `fetch("https://api.resend.com/emails")` avoids unnecessary dependency weight and keeps secrets contained. The wrapper accepts `RESEND_API_KEY` and `DAILY_CODES_FROM_EMAIL` from environment configuration and returns safe delivery metadata.

   Alternative considered: install the Resend SDK. That is acceptable if the implementation prefers it, but the job only needs one endpoint and the direct API keeps the runtime surface smaller.

5. Treat missing configuration and empty datasets as successful skipped runs.

   Missing `RESEND_API_KEY`, no upcoming events, no confirmed bookings with redemption info, or missing partner contact emails must not crash the scheduler. These outcomes should produce structured skip logs with no secret values.

   Alternative considered: fail hard on missing email configuration. That is useful in CI but noisy in production scheduler paths; validation can still be covered by tests and environment documentation.

## Risks / Trade-offs

- Cloudflare deployment shape may differ between Workers, Pages Functions, or Astro adapter output -> Keep job logic runtime-neutral and isolate the scheduler binding/adapter in a small entrypoint.
- Duplicate-send protection can block legitimate re-sends after a bad email body or partner address fix -> Store attempt status and provide manual trigger semantics that can either respect idempotency by default or explicitly force a retry with an operator-controlled flag.
- Berlin daylight-saving transitions can shift UTC boundaries -> Test window calculation around DST start/end and avoid fixed UTC offsets.
- Email provider errors may include sensitive request details -> Normalize logged errors to status code, provider error type/message, partner ID, and job run IDs only.
- Partner emails can become large for high-volume events -> Group by partner and event, but keep rendering simple and consider future pagination or attachment export if payload sizes become a provider limit.

## Migration Plan

1. Add the shared job service, Resend client wrapper, environment parsing, and tests.
2. Add a send-log table and migration if no existing operational log table can enforce partner/window idempotency.
3. Add the Cloudflare scheduled entrypoint configured for `59 23 * * *` with Europe/Berlin-aware window calculation in code.
4. Add a local/manual trigger that calls the same service with explicit dry-run or current-time options for development verification.
5. Update `.env.example` with Resend variables and document safe local execution.
6. Deploy with Resend credentials configured, run the manual trigger in a non-production-safe mode or dry run, then enable the scheduler.

Rollback is to disable the Cloudflare scheduled trigger or remove its cron binding. Because sends are idempotently logged by partner/window, re-enabling the scheduler should not resend already claimed partner emails unless an explicit force path is implemented and used.
