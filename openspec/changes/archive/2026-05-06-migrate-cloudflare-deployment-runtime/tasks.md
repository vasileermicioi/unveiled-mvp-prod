## 1. Cloudflare Runtime Setup

- [x] 1.1 Add the Astro Cloudflare adapter and remove the Node standalone adapter dependency/configuration.
- [x] 1.2 Update `astro.config.mjs` to build SSR output for Cloudflare while preserving React and Tailwind integration.
- [x] 1.3 Add Cloudflare preview and production deploy scripts to package configuration.
- [x] 1.4 Add Cloudflare project configuration for Pages SSR, build output, compatibility date, and required bindings.

## 2. Environment and Secrets

- [x] 2.1 Update `.env.example` and deployment docs with local, preview, and production variables for app URLs, Better Auth, database, Resend, payments, and asset storage.
- [x] 2.2 Implement a server-side environment access helper compatible with local development and Cloudflare runtime bindings.
- [x] 2.3 Ensure public client configuration only exposes `PUBLIC_` values and no secret values are bundled or logged.

## 3. Database Connectivity

- [x] 3.1 Replace Cloudflare runtime database access with a Neon-compatible Drizzle client mode.
- [x] 3.2 Preserve local development support using the documented `DATABASE_URL`.
- [x] 3.3 Add a safe database connectivity check used by readiness verification.

## 4. Auth Runtime

- [x] 4.1 Update Better Auth configuration to use environment-specific app/auth URLs for local, preview, and production.
- [x] 4.2 Verify Better Auth session cookies are created, read, and cleared correctly in Cloudflare preview and production.
- [x] 4.3 Ensure missing auth secrets fail safely and are reported through readiness without exposing secret values.

## 5. Asset Storage

- [x] 5.1 Implement the selected event/partner asset storage target using Cloudflare R2 or document the temporary remote URL launch path.
- [x] 5.2 Add server-side admin authorization before any asset write or replacement.
- [x] 5.3 Return and persist display URLs or object metadata usable by event and partner display data.
- [x] 5.4 Reject guest, member, and partner asset write attempts before storage data changes.

## 6. Scheduled Jobs

- [x] 6.1 Wire the daily partner code job to a Cloudflare-compatible scheduled trigger.
- [x] 6.2 Reuse the existing manual trigger/domain job path for scheduled execution.
- [x] 6.3 Ensure scheduled jobs can access database and Resend configuration from Cloudflare environment configuration.
- [x] 6.4 Record safe scheduled invocation status, skipped configuration results, failures, and duplicate-send outcomes.

## 7. Health and Observability

- [x] 7.1 Keep or update the liveness health endpoint so it returns safe success data without dependency or secret details.
- [x] 7.2 Add an authorized readiness check that validates required configuration and database connectivity with safe status output.
- [x] 7.3 Review SSR, API, auth, database, storage, and job error logging to remove secrets and provider authorization payloads.

## 8. Verification

- [x] 8.1 Run the local build and fix Cloudflare adapter/runtime incompatibilities.
- [x] 8.2 Run the documented Cloudflare preview command and verify SSR, API routes, and hydrated React islands.
- [x] 8.3 Smoke test login, session hydration, and logout on the Cloudflare preview deployment.
- [x] 8.4 Verify readiness reports success with complete configuration and safe failure with missing database/auth secrets.
- [x] 8.5 Run the manual partner code job trigger and verify scheduled job logging behavior.
- [x] 8.6 Document production deploy, rollback, and required Cloudflare secret setup steps.
