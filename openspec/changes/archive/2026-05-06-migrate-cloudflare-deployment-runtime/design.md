## Context

The app is an Astro SSR application using React islands, Better Auth, Drizzle, Postgres/Neon, Resend, and planned event/partner asset storage. It currently uses `@astrojs/node` in standalone mode, reads `process.env.DATABASE_URL`, and has a minimal health endpoint. The legacy app deployed with Firebase Hosting, Functions, and Storage rules, but the target app must use the new stack and the stated Cloudflare deployment target.

Cloudflare introduces runtime constraints that affect SSR handlers, auth cookies, database clients, scheduled execution, environment bindings, and asset upload permissions. The deployment contract needs to be explicit before production implementation so app code does not accidentally depend on Node-only APIs or Firebase infrastructure.

## Goals / Non-Goals

**Goals:**

- Deploy Astro SSR, API routes, and server actions to Cloudflare using an adapter and commands that work for preview and production.
- Use a Cloudflare-compatible Neon/Postgres path for Drizzle database access.
- Configure Better Auth URLs, secrets, cookies, and callback behavior for local, preview, and production origins.
- Replace Firebase Storage assumptions with a Cloudflare-compatible asset storage approach.
- Run scheduled notification jobs through Cloudflare-compatible scheduling and keep operational logging safe.
- Document required environment variables, secrets, health checks, and rollback steps.

**Non-Goals:**

- Live migration of Firebase data.
- Rebuilding unrelated UI pages or business flows.
- Implementing every backend operation beyond the runtime, storage, health, and scheduler surfaces needed for deployment.

## Decisions

### Use Cloudflare Pages with the Astro Cloudflare adapter

Use `@astrojs/cloudflare` as the primary adapter and configure the build for Cloudflare Pages SSR. Pages matches the app shape because it serves static assets and SSR functions from one project, supports preview deployments, and keeps deploy ergonomics close to the existing Astro app.

Alternative considered: Cloudflare Workers-only deployment. Workers offers more direct control over runtime bindings and schedules, but it adds more deployment surface for an app whose primary shape is an Astro site with SSR/API routes. If scheduled triggers require a separate Worker, keep that Worker small and call the same shared job logic used by manual local execution.

### Use Neon serverless-compatible database access

Replace direct `postgres` package usage in Cloudflare runtime paths with a Neon-compatible driver mode supported by Drizzle. Local development may still use the same `DATABASE_URL`, but production Cloudflare code must not rely on Node TCP sockets, Node pooling behavior, or PGlite fallback.

Alternative considered: keep `postgres` and rely on compatibility. This is too risky for Cloudflare because runtime compatibility and connection lifecycle behavior differ from Node.

### Prefer Cloudflare R2 for uploaded event and partner assets

Use R2 for admin-managed image uploads when upload support is in scope. Store only object keys and public display URLs in domain data, enforce admin-only writes through server-side authorization, and expose assets through a configured public base URL. Remote image URLs may remain acceptable as a temporary launch path if upload UI is deferred, but the storage contract should still define the R2 target.

Alternative considered: keep Firebase Storage. This conflicts with the target runtime and preserves legacy backend architecture that the new app is not meant to carry forward.

### Keep secrets in Cloudflare environment configuration

Document required variables in `.env.example` for local development and configure production values through Cloudflare project secrets or bindings. Runtime code should read secrets through the adapter-supported environment access pattern and must not expose secret values through public variables, logs, health checks, or client bundles.

Alternative considered: use only `process.env` everywhere. Astro/Vite can inline or omit values depending on runtime, so Cloudflare implementation should use the adapter-supported runtime environment path where needed.

### Health checks separate liveness from dependency readiness

Keep a lightweight health endpoint for liveness and add a production readiness path that verifies required configuration and database connectivity without exposing secret values. This allows Cloudflare preview and production verification without turning every deploy check into a full business-flow test.

## Risks / Trade-offs

- [Risk] Some libraries may import Node-only modules transitively in Cloudflare builds → Mitigation: run Cloudflare preview/build validation and replace incompatible server dependencies before deploy.
- [Risk] Database connection behavior can degrade under edge concurrency → Mitigation: use Neon serverless-compatible Drizzle access and avoid long-lived Node pooling assumptions.
- [Risk] Preview origins can break Better Auth cookie or callback behavior → Mitigation: configure environment-specific Better Auth URLs and verify login/logout/session hydration in preview.
- [Risk] Public asset URLs can bypass authorization if upload and display concerns are mixed → Mitigation: authorize writes server-side, store object metadata explicitly, and only expose intended public display URLs.
- [Risk] Scheduled jobs may run twice during deploy or retry windows → Mitigation: preserve existing duplicate-send protection and log job/window/partner claims.
- [Risk] Health checks can leak configuration detail → Mitigation: return coarse status and safe dependency names only, never raw environment values or provider payloads.

## Migration Plan

1. Add Cloudflare deployment configuration, adapter dependency, and preview/deploy scripts.
2. Replace database client setup with a Neon/Drizzle mode that works in Cloudflare and local development.
3. Update environment documentation and Cloudflare secret setup for auth, database, Resend, Stripe where applicable, and asset storage.
4. Add R2 storage integration or retain remote image URLs behind the documented temporary path until upload UI is implemented.
5. Wire scheduled notification execution to a Cloudflare-compatible trigger while sharing the existing domain job logic.
6. Expand health checks to cover liveness and safe readiness.
7. Validate with local build, Cloudflare preview, auth smoke test, database health check, and manual scheduled job trigger.
8. Roll back by redeploying the last known Node/Firebase-adjacent deployment branch or disabling Cloudflare traffic while preserving database state and uploaded assets.

## Open Questions

- Should scheduled jobs live in the same Cloudflare Pages project or a separate Worker that imports shared job code?
- Is admin image upload required for launch, or can launch use remote image URLs while R2 is prepared for the first upload milestone?
- Which production custom domains and preview URL patterns must be registered for Better Auth?
