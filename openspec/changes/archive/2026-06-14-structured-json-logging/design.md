## Context

Today every operational log line in the app is emitted by an ad-hoc
`console.log` or `console.error` call. There are three known call sites:

- `src/worker.ts` — the Cloudflare scheduled handler. The two log
  lines (skipped config and job summary) already happen to use
  `JSON.stringify`, but they are hand-shaped, not part of any shared
  schema, and the `daily-partner-codes` summary line is consumed
  downstream as if its fields were stable.
- `src/middleware.ts` — a single `console.error("Failed to track
  session:", err)` in a try/catch.
- `src/actions/index.ts` — a `console.error` in `safeActionError` for
  unexpected action errors.
- `src/lib/jobs/daily-partner-codes.ts` — `input.logger?.error` /
  `input.logger?.log` calls, with the `logger` typed as
  `Pick<Console, "log" | "error">` so the job is testable.

There is no `App.Locals` augmentation in `src/`, no `env.d.ts`, and no
shared logger module. Astro middleware can attach values to
`context.locals`, but nothing currently does. The Cloudflare Workers
`tail` consumer already parses JSON lines per log, so the platform
already supports structured output without any adapter.

The constraint is: no new runtime dependency. Cloudflare Workers
bundling is sensitive to module weight, and the project has a
≤ 200 KB gzipped per-route budget (P0 `bundle-size-budget`). A
hand-rolled ~150 LOC logger is the simplest thing that meets the
spec.

## Goals / Non-Goals

**Goals:**

- One canonical logger module, one JSON schema, used everywhere in
  `src/`.
- Request-scoped context (trace id, route, action) attached to every
  log line in a request without callers threading it through.
- Same API usable from cron/queue jobs (no request context).
- Existing observable behavior preserved: the daily-partner-codes
  summary line keeps the same fields, just emitted as a structured
  JSON object via the logger.
- Sensitive values redacted by default.
- Lint rule that blocks new ad-hoc `console.*` calls in `src/`
  (tests excluded) and points at the logger.

**Non-Goals:**

- No new HTTP route, Astro Action, or TypeSpec entry. The contract
  surface does not change.
- No Sentry / OpenTelemetry / Honeycomb / Datadog SDK integration.
  That belongs to the follow-up changes (`sentry-error-reporting`,
  `request-trace-id`, `analytics-engine-events`).
- No log shipping / Logpush config. The logger writes to stdout and
  `wrangler tail` / Logpush picks it up. Pipeline-side config is
  owned by the runbook change (`runbook-incident-response`).
- No client-side / browser logging. Browser `console` calls stay
  untouched (and there are none in `src/components/` today, by
  policy).
- No PII redaction policy beyond the obvious secret list. Wider
  PII policy is owned by `gdpr-data-export` and the privacy policy
  page change.
- No new LikeC4 element. The logger is part of the existing
  `application` container.

## Decisions

### D1. Hand-rolled ~150 LOC logger, no runtime dep
**Choice:** Write `src/lib/logger.ts` from scratch using the platform
`console`.
**Why:** Keeps the bundle under budget, no supply-chain surface, and
the Workers `console.log` is already one-line-per-call. Pino and
Winston are not Workers-friendly without extra adapters.
**Alternatives considered:** `pino` with `pino-pretty` (rejected:
adds ~50 KB and a worker-incompatible transport layer), `consola`
(rejected: ESM-only, no upstream type definitions we want, and
parses arguments rather than emitting raw JSON), and a thin
abstraction over `console` (rejected: the abstraction is the value).

### D2. Stable schema, optional context bag
**Choice:** Required top-level fields: `timestamp`, `level`,
`message`, `service`, `env`. All other data goes in a flat `context`
object so logs are easy to grep and so a follow-up change can
introduce `traceId`, `userId`, etc. as context fields without
schema breaks.
**Why:** The spec already requires the stable schema. Keeping the
context bag flat (not nested) keeps queries in Loki / Honeycomb
ergonomic.
**Alternatives considered:** A `pino`-style nested object
(`{ req: { id, route } }`) — rejected because it makes the
ingestion-side parser more complex and we control the producers.

### D3. Redaction by key name, not by regex
**Choice:** When a `context` object contains a key matching the
sensitive list (`password`, `token`, `authorization`, `apiKey`,
`secret`, `cookie`, and a few obvious Stripe / Resend variants), the
value is replaced with `"[REDACTED]"`.
**Why:** Regex-based redaction is brittle and tends to either
over-match (corrupting non-secret text) or under-match (missing
non-standard header names). Key-name redaction is exhaustive for
the call sites we control.
**Alternatives considered:** Allowlist (only known-safe keys
logged) — rejected because it forces every new log call to think
about the allowlist, which kills adoption.

### D4. `child(bindings)` for request scoping
**Choice:** `logger.child(bindings)` returns a new logger whose
context is the merge of the parent's context and `bindings`. The
merge is shallow.
**Why:** Mirrors the well-known `pino.child` pattern, keeps the
ergonomics, and lets middleware do `const log = logger.child({ traceId,
route })` once per request.
**Alternatives considered:** Async-local storage / Node's
`AsyncLocalStorage` (rejected: Cloudflare Workers has a V8 isolate
model that does not preserve ALS across `waitUntil` boundaries in
the way Node does, and the manual-pass model is simpler and explicit).

### D5. `locals.logger` typed via `App.Locals`
**Choice:** Introduce a new file `src/env.d.ts` that augments
`App.Locals` with `logger: Logger`. Astro middleware builds the
child logger and assigns it to `context.locals.logger` at the top
of `onRequest`.
**Why:** TypeScript already has `Astro.locals` plumbing; the only
missing piece is the augmentation file (the project has none
today). The trace-id follow-up change (`request-trace-id`) will
add `traceId` to the same augmentation.
**Alternatives considered:** Pass the logger as a function argument
through every action — rejected because every action handler
already has to import its dependencies, and `Astro.locals` is the
idiomatic place.

### D6. Biome rule blocks `console.*` in `src/`
**Choice:** Add a `biome.json` override under `javascript.runtime`
or a `noConsole` rule that fails on `console.log` / `console.info` /
`console.warn` / `console.error` in `src/**`. The override scopes
`console.warn` and `console.error` in `*.test.ts` and `*.integration.test.ts`
so the existing tests keep passing.
**Why:** Without an enforcement rule, new `console.log` calls will
re-appear within a sprint. The rule is the only way the migration is
durable.
**Alternatives considered:** A lint rule that warns instead of
fails — rejected because the whole point of the change is to retire
ad-hoc `console` calls.

### D7. `LOG_LEVEL` is the only runtime knob
**Choice:** Two env vars, both with safe defaults: `LOG_LEVEL`
(default `info`) and `LOG_SAMPLE_RATE` (default `1`, reserved for
the `analytics-engine-events` follow-up which will share the same
logger). No `LOG_FORMAT` toggle — JSON is the only format. No
per-route log level.
**Why:** Production needs the ability to quiet a noisy job without
a deploy. A sample-rate knob is included for symmetry with the
upcoming Analytics Engine change, but defaults to `1` so this
change does not silently drop lines.

## Risks / Trade-offs

- **Risk:** A new ad-hoc `console.log` slips in because the Biome
  rule is not yet enabled.
  **Mitigation:** `tasks.md` includes a task to enable the rule and
  a follow-up that grep-asserts no `console.*` remains under
  `src/` (excluding tests). The grep check is wired into
  `bun run check`.
- **Risk:** The schema is too loose — a developer adds a top-level
  field and downstream consumers break.
  **Mitigation:** The required top-level field set is locked in the
  spec. The logger's `emit` function strips unknown top-level
  fields and moves them into `context` so the schema stays stable
  even if callers misbehave.
- **Risk:** A request-scoped logger leaks across requests in the
  same isolate.
  **Mitigation:** The middleware assigns a fresh `logger.child({})`
  to `locals.logger` on every request; nothing else stores the
  reference. There is no module-level mutable logger binding.
- **Risk:** Reformatting existing log lines (cron summary) breaks
  a downstream consumer that parses stdout.
  **Mitigation:** The spec requires the cron summary's `context`
  fields to match the previous line's fields one-for-one
  (`jobName`, `status`, `sent`, `failed`, `skipped`, `duplicates`,
  `window`, `cron`, `scheduledTime`). A unit test asserts the
  migration preserves these fields. The downstream consumer, if
  any, can be updated in the same PR.
- **Risk:** Performance regression on the hot path (every request
  now does a `JSON.stringify`).
  **Mitigation:** The middleware does a single `JSON.stringify` per
  log call; `pino`-style micro-benchmarks put this well under
  10 µs / call. The change is not on the latency budget's critical
  path (DB / Stripe dominate).
- **Trade-off:** No structured logging in the browser. Accepted
  because the browser has its own observability story (RUM, Sentry
  session replay) owned by other P0/P1 catalog rows.

## Migration Plan

1. Land `src/lib/logger.ts` + `src/lib/logger.test.ts`. Tests pass
   against the new module before any call site is migrated.
2. Enable the Biome `noConsole` rule in `biome.json` (scoped to
   `src/**`, excluding test files) so the migration is enforced
   going forward.
3. Migrate `src/worker.ts`, `src/middleware.ts`, `src/actions/index.ts`,
   and `src/lib/jobs/daily-partner-codes.ts` in a single PR so the
   diff is reviewable as one unit.
4. Add `src/env.d.ts` with `App.Locals.logger` augmentation and
   update `src/middleware.ts` to assign a child logger per request.
5. Run `bun run check`. The new `bun run check` includes a grep
   step that fails if any `console.log` / `console.info` /
   `console.warn` / `console.error` remains under `src/` outside
   test files.
6. Roll back by reverting the PR. The logger is additive (every
   call site was a `console.*` call that is still there as a
   one-line change in git), so rollback is a clean `git revert`.

## Open Questions

- Should `LOG_LEVEL=debug` be enabled in preview? The preview
  environment tends to produce high-cardinality logs; a `preview`
  default of `info` and a `local` default of `debug` is a
  reasonable split, but the env-driven default still falls out of
  the design. Deferred to the implementation — both options are
  one line in `src/lib/logger.ts`.
- Should the logger also wrap `unhandledrejection` /
  `uncaughtException` so the Cloudflare runtime's automatic
  exception logs are JSON too? Out of scope for this change
  (Cloudflare captures those as separate events), but worth
  revisiting in the `sentry-error-reporting` follow-up.
