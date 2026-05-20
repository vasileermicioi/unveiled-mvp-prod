# Cloudflare Deployment

The app deploys Astro SSR to Cloudflare with the `@astrojs/cloudflare` adapter. Scheduled notification jobs deploy separately from `src/worker.ts` using `wrangler.toml`.

## Commands

- Local app development: `bun run dev`
- Local Cloudflare preview: `bun run preview:cloudflare`
- Production app deploy: `bun run deploy:cloudflare`
- Scheduled job deploy: `bun run deploy:jobs`
- Manual partner code job verification: `bun run jobs:daily-partner-codes`

The scheduled worker runs the daily partner code job on `59 23 * * *` from `wrangler.jobs.toml`. It calls the same domain job used by the manual command and writes only safe status fields such as job name, window, counts, and skip/failure category.

## Required Secrets and Variables

Configure these in local `.env` files and Cloudflare project secrets or variables.

- `BETTER_AUTH_SECRET`: secret value with at least 32 random characters.
- `BETTER_AUTH_URL`: canonical auth origin for the current environment.
- `PUBLIC_BETTER_AUTH_URL`: public auth origin for client code.
- `PUBLIC_APP_URL`: public app origin for links and callbacks.
- `DATABASE_URL`: Neon/Postgres connection string using SSL.
- `RESEND_API_KEY`: required when scheduled email delivery is enabled; missing values produce a skipped job result.
- `DAILY_CODES_FROM_EMAIL`: verified sender for partner passcode emails.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PUBLIC_STRIPE_PUBLISHABLE_KEY`: required when payments are enabled.
- `ASSETS_BUCKET`: Cloudflare R2 binding used by admin event image and partner logo uploads.
- `PUBLIC_ASSET_BASE_URL`: public base URL for persisted event and partner image display URLs.
- `READINESS_TOKEN`: optional bearer token for `/api/readiness.json`.

Only variables prefixed with `PUBLIC_` are intended for browser code.

## Asset Storage

Admin-managed event and partner images target Cloudflare R2 through the `ASSETS_BUCKET` binding in `wrangler.toml`. Server-side upload routes must authorize admin writes before touching the bucket, validate image type and size, and return only display-safe metadata to the browser.

Local and parity development can run without an R2 binding. In that state, admin upload controls fail safely with an upload-unavailable message, and operators can continue using the manual HTTPS URL fields for event images and partner logos. Preview and production deployments that enable uploads must configure both `ASSETS_BUCKET` and `PUBLIC_ASSET_BASE_URL` so uploaded files can be displayed after the event or partner save form persists the returned URL.

## Rollback

Rollback by redeploying the previous successful Cloudflare deployment or disabling production traffic while keeping Neon database state and uploaded R2 objects intact. Scheduled jobs can be paused independently by disabling the Worker cron trigger or rolling back `wrangler.toml`.
