## Why

The application stores all uploaded images (event banners, partner logos, avatars) as URL strings on the relevant database records, but rendering those URLs across the UI has no graceful fallback: a missing, broken, or temporarily unavailable R2 asset shows a broken image and the surrounding layout reflows. There is also no shared `<SafeImage>` primitive that image-rendering surfaces (event cards, partner profiles, avatars) can rely on for consistent placeholder behavior.

This change codifies the existing Cloudflare R2 binding-based upload path as the canonical image storage layer and adds a reusable `<SafeImage>` component with on-error placeholder fallback plus a set of placeholder graphics, so R2 outages and missing assets never break the visible UI.

## What Changes

- Add a reusable `<SafeImage>` React component that renders an `<img>` with an `onError` swap to a placeholder graphic and supports a fixed aspect ratio to prevent layout reflow.
- Render the placeholder directly when the `src` is null or empty.
- Ship a small set of placeholder SVGs (`placeholders/event.svg`, `placeholders/partner.svg`, `placeholders/avatar.svg`) in the public assets directory.
- Replace existing `<img>` / `FadeInImage` usages that point at stored image URLs (event cards, partner venue surfaces, avatars) with `<SafeImage>` so the fallback applies consistently.
- Add an optional `R2_MAX_UPLOAD_BYTES` configuration (default 5 MB, matching the existing `ADMIN_ASSET_UPLOAD_MAX_BYTES`) so the cap is operator-tunable without code changes.
- Document the R2 image upload flow (binding, validation, key scheme, public URL, fallback) in the operations/README.

## Capabilities

### New Capabilities
- `image-storage`: Canonical Cloudflare R2 image storage, server-side validation, public CDN delivery, and a reusable `<SafeImage>` placeholder-fallback component used wherever stored images are rendered.

### Modified Capabilities
- (none) — the existing `assets/storage` module and `/api/admin/assets/upload` route already implement the upload path. This change adds the missing client-side fallback primitive and a small set of placeholders.

## Impact

- New files: `src/components/ui/safe-image.tsx`, `public/placeholders/{event,partner,avatar}.svg`.
- Modified files: any image-rendering component that uses `<img>` or `FadeInImage` for stored event/partner/avatar assets.
- New optional env: `R2_MAX_UPLOAD_BYTES` (defaults to 5 MB).
- Database: no schema change. Existing string `image_url` / `logo_url` columns continue to store the R2 public URL.
- Infrastructure: requires a Cloudflare R2 bucket and a public bucket binding (already configured via `ASSETS_BUCKET` + `PUBLIC_ASSET_BASE_URL`).
