## Context

The application runs on Cloudflare (Workers/Pages via Astro). The Admin and Partner surfaces already accept image inputs and persist them as URL strings on `events.image_url` and `partners.logo_url`. Today, uploads go through `/api/admin/assets/upload`, which uses the Cloudflare R2 binding (`ASSETS_BUCKET`) to write directly to the configured R2 bucket and returns the public URL (`${PUBLIC_ASSET_BASE_URL}/${key}`) to be persisted on the database record.

The Cloudflare R2 binding path is the right fit: it runs in the same worker runtime as the rest of the app, has zero egress fees for reads through a custom domain, and is S3-compatible under the hood so the same data can be migrated to a different storage backend later if needed.

The gaps this change closes are entirely on the **client side**: there is no shared image primitive that gracefully falls back to a placeholder when an R2 asset fails to resolve, and there is no set of placeholder graphics in the public assets directory to fall back to. This means transient R2/CDN issues or missing URLs render as broken images with layout reflow.

## Goals / Non-Goals

**Goals:**

- Codify the existing R2 binding-based upload path (`src/lib/assets/storage.ts` + `src/pages/api/admin/assets/upload.ts`) as the canonical image storage layer.
- Add a reusable `<SafeImage>` component (in `src/components/ui/safe-image.tsx`) that:
  - Renders the supplied `src` when it is non-empty.
  - Renders a placeholder graphic directly when `src` is null/empty.
  - Swaps the `src` to a placeholder when the underlying `<img>` fires `onError` (network error, 404, 5xx).
  - Supports an `aspectRatio` prop (or class-based equivalent) to prevent layout reflow.
- Ship three placeholder SVGs (`event`, `partner`, `avatar`) under `public/placeholders/`.
- Replace existing `<img>` / `FadeInImage` usages of stored image URLs (event cards, partner venue surfaces, avatars) with `<SafeImage>`.
- Make the upload size cap operator-tunable via an optional `R2_MAX_UPLOAD_BYTES` env var (default 5 MB).
- Document the R2 image upload flow in the operations/README so the contract is discoverable.

**Non-Goals:**

- Switching to AWS SDK presigned PUTs (the R2 binding path is already working in production and is the right Cloudflare-native pattern).
- Server-side image transcoding / resizing (out of scope for this change; clients must upload within the size cap).
- Per-object access control on the bucket (a public bucket fronted by a custom domain is intentional).
- Migrating legacy local-disk uploads from the old app (legacy app is reference-only per `project.md`).
- Adding new upload routes for avatars; the existing `kind: "event" | "partner"` taxonomy is sufficient — avatars piggyback on `kind: "partner"` or get a new `kind: "avatar"` once the Admin/Partner surfaces that consume them are wired up.

## Decisions

### 1. Keep the Cloudflare R2 binding as the upload mechanism

**Decision:** Use the existing `ASSETS_BUCKET` R2 binding (via the `R2Bucket` type) to write uploads from the worker. No AWS SDK, no presigned URLs.

**Rationale:** The binding path runs in the same worker as the rest of the app, so the upload is one Worker request (form-data parse → R2 `put` → JSON response). There is no benefit to presigned URLs at the current image size cap (5 MB) since R2's single-shot PUT limit is far above that, and presigning would require either a second S3 client configured at the R2 endpoint or an additional credential management surface. The binding is the simplest and most secure path.

**Alternatives considered:**

- AWS SDK v3 S3 client + presigned PUT — adds a dependency, a credential surface, and complexity for no concrete benefit at our size cap.
- Direct browser-to-R2 uploads without the server — same downsides as presigning, plus we lose the ability to authorize the caller server-side.

### 2. Object key naming: `<kind>/<ownerId>/<uuid>-<safe-filename>`

**Decision:** Keep the existing key scheme from `buildAssetKey`: `<kind>/<ownerId>/<uuid>-<safe-filename>`, where `kind ∈ {event, partner}`, `ownerId` is the parent record id, and `safe-filename` is sanitized lowercase kebab.

**Rationale:** Scope-prefixed keys make lifecycle/bucket policies and log triage trivial, the `ownerId` keeps related objects colocated, and the sanitized filename preserves human-readable context. UUIDs prevent collisions. The trailing extension is derived from the validated content type and is already in the key.

**Alternatives considered:**

- Content-addressable keys (SHA-256 of the file) — gives dedup but adds a round trip and is not needed for MVP.
- User-supplied filenames — leaks PII and risks path traversal; rejected.

### 3. Public delivery via `PUBLIC_ASSET_BASE_URL`

**Decision:** Public URLs are constructed as `${PUBLIC_ASSET_BASE_URL}/${key}`. The bucket is configured with a public bucket binding (custom domain or r2.dev) and fronted by Cloudflare's CDN.

**Rationale:** R2 with a public bucket delivers from Cloudflare's edge with no egress fees, which is the cheapest and fastest path. Keeping the base URL in env means dev/staging/prod can point at different domains without code changes.

**Alternatives considered:**

- Proxying images through an Astro route — adds bandwidth and CPU cost for zero benefit; rejected.

### 4. Client-side `<SafeImage>` placeholder fallback (not server-side)

**Decision:** A new `<SafeImage>` component encapsulates the fallback: if `src` is empty it renders the placeholder; otherwise it renders the `<img>` and swaps to the placeholder on `onError`.

**Rationale:** Client-side fallback handles transient R2/CDN outages and missing assets without server-side cooperation and keeps the server stateless. The component is reused across all image-rendering surfaces so the behavior is consistent.

**Alternatives considered:**

- Server-rendered placeholder when the URL is null/empty — only handles the "never uploaded" case, not the "uploaded but currently broken" case.
- Cloudflare Worker-based image fallback — adds infra complexity for a UX nicety; the client-side fallback is sufficient.

### 5. Placeholder graphics as static SVGs

**Decision:** Ship three minimal SVG placeholders (`event`, `partner`, `avatar`) under `public/placeholders/`.

**Rationale:** SVGs are tiny, scale crisply, and are themed to the brand palette. They live in `public/` so they're served as static assets without any build step.

**Alternatives considered:**

- Inline SVG components — bloats the JS bundle for assets that rarely change.
- PNG placeholders — larger files, no crisp scaling, and would need a build step for rasterization.

### 6. Optional `R2_MAX_UPLOAD_BYTES` env, default 5 MB

**Decision:** The upload size cap is read from `R2_MAX_UPLOAD_BYTES` when set, and falls back to the existing `ADMIN_ASSET_UPLOAD_MAX_BYTES` constant (5 MB) otherwise.

**Rationale:** Operators occasionally need to bump the cap (e.g. for higher-resolution event banners) without a code change. A sensible default keeps the contract clear.

**Alternatives considered:**

- Hard-coded constant only — works, but a single environment knob is cheap and useful.

## Risks / Trade-offs

- **R2 binding required at deploy time** → If `ASSETS_BUCKET` is misconfigured, uploads return a 503 and the existing client falls back to a manual HTTPS URL. Already handled; no regression.
- **Public bucket means no per-object access control** → Acceptable for this app's image surfaces; private assets are explicitly out of scope.
- **No server-side image processing** → Clients must resize/compress before upload. If they don't, large images hit the size cap and surface a field error. Mitigation: document the size cap in the upload UI.
- **Placeholder fallback is client-side only** → A user with JS disabled or a bot crawler still gets a broken image. Mitigation: keep placeholder markup as `<img>` with a sensible `alt` so screen readers don't break.
- **R2 outage breaks image rendering UI** → Mitigated by `<SafeImage>` and the CDN-fronted bucket. No graceful write-side degradation is possible — uploads will fail until R2 is back.
- **No dedup** → The same image uploaded twice produces two objects. Acceptable for MVP.
