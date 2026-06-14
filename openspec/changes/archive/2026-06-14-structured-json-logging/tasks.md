## 1. Logger module

- [x] 1.1 Create `src/lib/logger.ts` exporting a `logger` object with `debug`, `info`, `warn`, `error`, and `child(bindings)` methods, plus a `Logger` type
- [x] 1.2 Emit exactly one JSON line per call to stdout via `console[level]`, with required fields `timestamp` (ISO 8601 UTC), `level`, `message`, `service`, `env`, and a flat `context` object
- [x] 1.3 Resolve `service` from the Astro / Worker runtime (`unveiled-web` for the SSR app, `unveiled-worker` for the scheduled handler) and `env` from `import.meta.env.MODE` mapped to `local|preview|production`
- [x] 1.4 Redact values for the sensitive key list (`password`, `token`, `authorization`, `apiKey`, `secret`, `cookie`, plus `resendApiKey`, `stripeApiKey`, `databaseUrl`) by replacing them with `"[REDACTED]"`
- [x] 1.5 Apply `LOG_LEVEL` filtering (default `info`); expose the same `LOG_LEVEL` and `LOG_SAMPLE_RATE` (default `1`) env reads
- [x] 1.6 Make `child(bindings)` return a new logger with the bindings shallow-merged into the context

## 2. Tests for the logger module

- [x] 2.1 Create `src/lib/logger.test.ts` covering: every level emits valid single-line JSON, the required top-level fields are present, `child` merges bindings, `LOG_LEVEL` filters lower levels, and sensitive keys are redacted
- [x] 2.2 Add a unit test that captures the emitted lines via a stub `console` and asserts the cron summary fields (`jobName`, `status`, `sent`, `failed`, `skipped`, `duplicates`, `window`, `cron`, `scheduledTime`) are preserved when the daily-partner-codes summary is emitted via the logger

## 3. Type augmentation and middleware wiring

- [x] 3.1 Add `src/env.d.ts` augmenting `App.Locals` with `logger: Logger` (import the `Logger` type from `src/lib/logger.ts`)
- [x] 3.2 In `src/middleware.ts`, build a child logger at the top of `onRequest` with `{ traceId: "<pending-trace-id>", route: routeForPath(url.pathname) }` and assign it to `context.locals.logger`
- [x] 3.3 Replace the `console.error("Failed to track session:", err)` call in `src/middleware.ts` with a `context.locals.logger.error({ err }, "session_track_failed")` call
- [x] 3.4 Leave the trace-id field as a placeholder constant for this change; the `request-trace-id` follow-up will own reading `x-trace-id` and overwriting it

## 4. Migrate call sites

- [x] 4.1 In `src/worker.ts`, replace the two `console.error` / `console.log` JSON-stringify calls with `logger.warn` / `logger.info` calls using the structured `context` payload, preserving every field
- [x] 4.2 In `src/actions/index.ts`, replace the `console.error("[safeActionError] Caught unexpected action error:", error)` call with a `logger.error({ err, action: ctx.action?.name }, "action_unexpected_error")` call
- [x] 4.3 In `src/lib/jobs/daily-partner-codes.ts`, change the `input.logger` type from `Pick<Console, "log" | "error">` to `Pick<Logger, "info" | "warn" | "error">` and update the manual-trigger call site to pass a `Logger`-shaped object
- [x] 4.4 Add a new logger import to `src/worker.ts` and any other touched files; do not leave any `console.*` call behind

## 5. Lint enforcement

- [x] 5.1 Add a Biome override in `biome.json` enabling `noConsole` for `**/src/**/*.{ts,tsx,astro}` (excluding `*.test.ts`, `*.integration.test.ts`, `*.stories.tsx`)
- [x] 5.2 Add a `scripts/check-no-console.ts` (or extend an existing script wired into `bun run check`) that greps for `console\.(log|info|warn|error)` under `src/` excluding tests and fails with a non-zero exit when a match is found
- [x] 5.3 Wire the new check into `package.json` `scripts.check` so `bun run check` runs it on every PR

## 6. Validation

- [x] 6.1 Run `bun run check` and confirm `astro check`, `biome check .`, `bun run specs:check`, `bun run tokens:check`, and the new `no-console` check all pass
- [x] 6.2 Run `bun run db:seed:operations-smoke` (or the closest equivalent) and confirm the `daily-partner-codes` job still emits the same fields, now as a JSON object
- [x] 6.3 Run `wrangler tail --format=json` against a local `bun run preview:cloudflare` instance, fire one request, and confirm the emitted line is single-line JSON with the required schema fields
- [x] 6.4 Run `openspec validate structured-json-logging` and confirm the change validates cleanly
