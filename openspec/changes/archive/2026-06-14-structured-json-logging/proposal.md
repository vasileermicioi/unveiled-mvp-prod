## Why

The app emits operational events through ad-hoc `console.log` and
`console.error` calls scattered across `src/worker.ts`,
`src/middleware.ts`, `src/actions/index.ts`, and cron/queue jobs
(`src/lib/jobs/**`). The output is a mix of plain strings and one-off
`JSON.stringify({...})` blobs with no stable schema, no level, no
trace correlation, and no place for structured context (request id,
user id, route, status, latency). This makes the log stream
un-aggregable: we cannot filter, alert, or post-mortem against it
once it leaves `wrangler tail`, and any third-party log pipeline
(Datadog, Loki, Honeycomb, Cloudflare Logpush) will index it as
opaque text.

Production requires a structured JSON logger so every line emitted
by the Astro SSR worker, Astro Actions, HTTP endpoints, and cron/queue
jobs can be parsed, queried, and alerted on. This is the foundational
P0 from the 09-iteration catalog (`02-remaining-features-to-prod.md`,
row "Structured JSON logging") and a prerequisite for
`request-trace-id`, `analytics-engine-events`, `sentry-error-reporting`,
and the runbooks.

## What Changes

- Introduce a single `logger` module at `src/lib/logger.ts` that emits
  one JSON object per line on stdout, with a stable schema:
  `timestamp` (ISO 8601 UTC), `level` (`debug|info|warn|error`),
  `message`, `service` (`unveiled-web`|`unveiled-worker`),
  `env` (`local|preview|production`), and a flat bag of typed context
  fields. Levels are filterable via env (`LOG_LEVEL`,
  `LOG_SAMPLE_RATE`).
- Add a small set of `logger.child({...})` bindings so request-scoped
  context (trace id, user id, route, action name) is attached to every
  log line in a request without callers having to thread it through.
- Replace every existing `console.log` / `console.error` call inside
  `src/worker.ts`, `src/middleware.ts`, `src/actions/index.ts`, and
  `src/lib/jobs/**` with a call to the new logger. The output shape
  of the existing `daily-partner-codes` cron summary line is
  preserved as a structured object (one log line, same fields), so
  downstream consumers that already key off it keep working.
- Expose the logger to Astro middleware via a `locals.logger` field
  (typed in `src/env.d.ts`) so route handlers and Astro Actions can
  emit log lines tagged with the same trace id / request context.
- Add a single Vitest unit test asserting: (a) every log call emits
  valid JSON on exactly one line, (b) the schema fields above are
  always present, (c) `child()` bindings are merged into the context
  bag, (d) `LOG_LEVEL` filters out lower-priority lines.

No public HTTP contract change. No new HTTP route or Astro Action is
added. The browser is not affected.

## Capabilities

### New Capabilities

- `production-observability`: covers structured logging, request-scoped
  trace id (`x-trace-id`), and Cloudflare Analytics Engine events as
  one production observability capability. This change introduces the
  capability and adds the logging requirement. The trace id and
  Analytics Engine requirements are added by their own follow-up
  changes (`request-trace-id`, `analytics-engine-events`).

### Modified Capabilities

- `jobs-notifications`: the existing cron summary line in
  `src/worker.ts` and the `input.logger` shape on
  `runDailyPartnerCodeJob` are tightened to a typed log line. The
  observable fields of the summary line (`jobName`, `status`, `sent`,
  `failed`, `skipped`, `duplicates`, `window`, `cron`,
  `scheduledTime`) are preserved — only the transport and schema are
  formalized.

## Impact

- **Code**: new `src/lib/logger.ts`; new `src/lib/logger.test.ts`;
  edits in `src/worker.ts`, `src/middleware.ts`, `src/actions/index.ts`,
  `src/lib/jobs/daily-partner-codes.ts`, and `src/env.d.ts`.
- **Env**: two new server env vars, both optional with safe defaults —
  `LOG_LEVEL` (default `info`) and `LOG_SAMPLE_RATE` (default `1`).
  No `PUBLIC_*` exposure.
- **Dependencies**: no new runtime dependency. The logger is a
  ~150-line file using the platform `console` (Cloudflare Workers
  `tail` already parses JSON lines).
- **CI / check**: `bun run check` is unchanged. The new unit test
  runs under the existing unit-test step.
- **TypeSpec**: no change. No new HTTP route or Astro Action.
- **LikeC4**: the `application` container's logging responsibility is
  noted in the design doc, but no new container / component is
  introduced, so `bun run arch:check` should not require a model
  change. The first follow-up that introduces a real observability
  component (e.g. Sentry sink) will own the LikeC4 delta.
- **Design tokens**: no change.
- **i18n**: no new user-facing copy.
