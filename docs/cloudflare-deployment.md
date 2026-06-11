# Cloudflare Deployment

The app deploys Astro SSR to Cloudflare with the `@astrojs/cloudflare` adapter. Scheduled notification jobs deploy separately from `src/worker.ts` using `wrangler.toml`.

## Commands

- Local app development: `bun run dev`
- Local Cloudflare preview: `bun run preview:cloudflare` (runs against the real Cloudflare network with `--remote` so R2/KV bindings hit the actual resources; requires `CLOUDFLARE_API_TOKEN` in `.env`)
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

> **Important:** `PUBLIC_ASSET_BASE_URL` must be the public URL of the **same** R2 bucket the `ASSETS_BUCKET` binding writes to. R2 public dev URLs (`pub-<bucket-id>.r2.dev`) are per-bucket — a mismatch produces a 404 on every persisted image URL. If the binding and the public URL get out of sync, existing event/partner image URLs from before the fix will continue to 404 and must be re-uploaded.

### Provisioning a new R2 bucket for local development

To create a fresh bucket on the same Cloudflare account the worker uses, and align the binding + public URL:

```sh
# 1. Create the bucket (replace with the bucket name you want).
npx wrangler r2 bucket create <bucket-name>

# 2. Enable the r2.dev public URL on it. The command prints the URL.
npx wrangler r2 bucket dev-url enable <bucket-name>

# 3. Set the binding to that bucket in wrangler.toml:
#    [[r2_buckets]]
#    binding = "ASSETS_BUCKET"
#    bucket_name = "<bucket-name>"

# 4. Set the public URL in .env:
#    PUBLIC_ASSET_BASE_URL="<the URL printed in step 2>"
#    R2_BUCKET_NAME="<bucket-name>"

# 5. Verify end-to-end:
echo "test" > /tmp/test.txt
npx wrangler r2 object put "<bucket-name>/diag/hello.txt" --file /tmp/test.txt --remote
curl -sI "$PUBLIC_ASSET_BASE_URL/diag/hello.txt"   # expect 200
npx wrangler r2 object delete "<bucket-name>/diag/hello.txt" --remote
```

### Upload Flow

1. The Admin panel collects a `File` and posts `multipart/form-data` to `/api/admin/assets/upload` with `kind` (`event` or `partner`) and `ownerId` (the parent record id).
2. The route calls `requireAdmin` to authorize the caller and `validateAdminAssetUploadFile` to enforce the content type and size.
3. On success, the route writes the file to the `ASSETS_BUCKET` binding under a `<kind>/<ownerId>/<uuid>-<safe-filename>` key and returns `{ ok: true, data: { url, key, contentType, ... } }`.
4. The form persists `data.url` on the parent record's `imageUrl` or `logoUrl` column.

### Upload Size Cap

The default cap is 5 MB (`ADMIN_ASSET_UPLOAD_MAX_BYTES` in `src/lib/assets/storage.ts`). Operators can override this per environment by setting the optional `R2_MAX_UPLOAD_BYTES` env var (positive integer, in bytes). When unset, malformed, or non-positive, the documented default of 5 MB is enforced.

### Image Render Fallback

The shared `<SafeImage>` component (`src/components/ui/safe-image.tsx`) renders an R2 image with a placeholder fallback so missing or temporarily unavailable assets do not break the visible UI:

- Empty / null / whitespace `src` → placeholder graphic is rendered directly.
- `onError` from the underlying `<img>` → component swaps `src` to a placeholder graphic and keeps the layout (the wrapping container retains its dimensions).
- Three placeholder SVGs ship under `public/placeholders/` (`event.svg`, `partner.svg`, `avatar.svg`).
- Components that render stored R2 URLs MUST use `<SafeImage>` (not a raw `<img>`) so the fallback applies consistently.

## Rollback

Rollback by redeploying the previous successful Cloudflare deployment or disabling production traffic while keeping Neon database state and uploaded R2 objects intact. Scheduled jobs can be paused independently by disabling the Worker cron trigger or rolling back `wrangler.toml`.
