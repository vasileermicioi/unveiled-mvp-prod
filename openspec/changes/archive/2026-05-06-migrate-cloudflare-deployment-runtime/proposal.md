## Why

The new app is intended to run on Cloudflare, but it currently uses the Astro Node standalone adapter and runtime assumptions that have not been verified for Cloudflare SSR, auth, database access, scheduled jobs, or asset storage. The Firebase-era deployment model also left storage rules, functions, and hosting behavior implicit, so production deployment needs an explicit target runtime contract before implementation.

## What Changes

- Define a Cloudflare deployment capability covering SSR, API routes, health checks, environment variables, preview/production commands, observability, and asset storage.
- Switch the app from Node standalone deployment assumptions to the selected Cloudflare deployment shape.
- Require database access to use a Cloudflare-compatible Neon/Postgres connection mode instead of local PGlite or Node-only pooling assumptions.
- Replace Firebase Storage assumptions with the selected asset storage approach, including admin-only write behavior for event and partner image assets.
- Update auth requirements so Better Auth sessions, cookies, callback URLs, and secrets work in Cloudflare preview and production.
- Update jobs and notification requirements so scheduled jobs run through the Cloudflare-compatible scheduler path with documented secrets and operational visibility.

## Capabilities

### New Capabilities

- `deployment`: Cloudflare runtime, deploy commands, environment/secrets, storage integration, health checks, and observability expectations.

### Modified Capabilities

- `auth`: Better Auth runtime behavior must be compatible with Cloudflare-hosted SSR/API routes and configured production URLs/secrets.
- `jobs-notifications`: Scheduled notification jobs must run through a Cloudflare-compatible execution path with production secrets and logs.

## Impact

- Affected configuration and scripts: `astro.config.mjs`, package scripts, Cloudflare project configuration, preview/deploy commands, and environment documentation.
- Affected runtime code: server-rendered pages, Astro API routes/actions, Better Auth handlers, Drizzle database client setup, scheduled notification handlers, and `src/pages/api/health.json.ts`.
- Affected dependencies: Astro Cloudflare adapter, Neon-compatible database driver/client mode, optional Cloudflare R2 or compatible asset storage client, and any Cloudflare deployment tooling.
- Affected legacy assumptions: Firebase Hosting, Firebase Functions, and Firebase Storage rules are not production targets for the new app.
