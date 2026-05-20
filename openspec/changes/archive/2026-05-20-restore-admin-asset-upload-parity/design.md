## Context

Legacy admin workflows supported event image and partner logo uploads from file inputs. The migrated app already has a Cloudflare-compatible asset helper in `src/lib/assets/storage.ts`, admin mutation flows in `src/lib/admin-operations.ts`, and admin event/partner forms in `src/components/unveiled/visual-system-app.tsx`, but those forms currently do not expose file upload controls or persist uploaded URLs.

Uploads are security-sensitive because they write storage data and then affect public-facing image/logo display. The implementation must authorize admin access before storage writes, validate image files before upload, and avoid overwriting existing asset URLs when upload or validation fails.

## Goals / Non-Goals

**Goals:**

- Restore admin-visible upload controls for event images and partner logos.
- Use the existing asset storage abstraction and Cloudflare-compatible bindings.
- Feed uploaded display URLs into existing event `imageUrl` and partner `logoUrl` mutation fields.
- Preserve manual remote URL inputs as a fallback.
- Render upload progress, preview, success, and safe failure states.
- Add focused tests for authorization, validation, and operation/form wiring.

**Non-Goals:**

- Reintroduce Firebase Storage paths, Firebase SDK usage, or Firebase storage rules.
- Build a reusable media library, bulk uploader, cropping workflow, or CDN optimization pipeline.
- Change the database schema for event or partner asset fields.
- Replace existing admin create/update operation semantics beyond asset URL handling.

## Decisions

### Use an Admin-Only Upload Action or API Route

The upload boundary SHALL accept multipart file data, authorize the current viewer as admin, validate content type and size, call `uploadAdminAsset`, and return a display URL plus safe metadata. This keeps storage writes server-side and avoids exposing storage bindings or credentials to the browser.

Alternative considered: upload inside the existing event/partner save actions. That would couple large binary payloads to operational mutation schemas and make it harder to preserve existing manual URL behavior. A dedicated upload boundary lets forms upload first, then submit the returned URL through current mutation flows.

### Keep Existing `imageUrl` and `logoUrl` Persistence

Uploaded assets SHALL populate the same event and partner URL fields used by current admin operations. This avoids schema migration and keeps public display mappers unchanged except for exposing upload-ready preview state where useful.

Alternative considered: store storage keys separately from display URLs. That gives stronger asset lifecycle management later, but it is outside the parity scope and would require broader data migration.

### Validate Before Storage Writes

The upload boundary SHALL validate allowed image content types, maximum file size, required filename metadata, target kind, and admin authorization before calling storage. Failed validation SHALL return safe form-visible errors and leave the current URL value unchanged.

Alternative considered: rely on storage provider metadata and downstream image rendering to reject bad files. That would allow unauthorized or unsupported payloads to reach storage and does not meet the legacy parity safety requirements.

### Preserve Manual URL Fallback

Event and partner forms SHALL continue to accept HTTPS remote image/logo URLs. If upload configuration is missing locally or in preview, admins can still save explicit URLs, while the UI shows a safe upload-unavailable state.

Alternative considered: require upload for all assets. That would block operators in environments where asset storage is not configured and would remove an existing operational escape hatch.

## Risks / Trade-offs

- Storage binding unavailable locally or in preview -> show upload unavailable state and keep manual URL inputs functional.
- Large file handling in Astro Actions may be awkward -> use a route boundary if file upload ergonomics or runtime limits make actions unsuitable.
- Upload succeeds but later save fails -> keep the uploaded URL visible in the form so the admin can retry without re-uploading.
- Upload fails after an existing URL is present -> preserve the existing/manual URL value and render a safe error.
- Public asset URL base is misconfigured -> validate configuration through existing deployment/config checks and surface safe upload errors.

## Migration Plan

1. Add upload validation helpers for allowed image types and size limits near the existing asset storage helper.
2. Add the authorized upload boundary and wire it to `uploadAdminAsset`.
3. Add admin UI upload controls that produce previews and populate hidden or visible URL fields after successful upload.
4. Keep manual URL fields editable for both event images and partner logos.
5. Add tests for storage validation, non-admin rejection, successful URL wiring, failed upload preservation, and relevant admin UI assertions.
6. Deploy with asset storage bindings configured in preview and production; rollback by hiding upload controls while leaving manual URL fields and existing save operations intact.

## Open Questions

- Should the initial implementation use Astro Actions for multipart `File` input, or a small admin-only API route if runtime support is clearer?
- What file size limit should match production storage and UX expectations?
- Should local parity use an in-memory/mock asset bucket or document upload-unavailable behavior while preserving manual URL input?
