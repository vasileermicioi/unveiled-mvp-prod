## 1. SafeImage Component and Placeholders

- [x] 1.1 Create `src/components/ui/safe-image.tsx` exposing a typed `<SafeImage>` component that accepts `src`, `alt`, `fallbackSrc`, and an optional `aspectRatio` (or className-based equivalent)
- [x] 1.2 Implement `onError` swap from `src` to `fallbackSrc` and a one-shot guard so we don't loop on a broken fallback
- [x] 1.3 Render the fallback directly when `src` is null/undefined/empty
- [x] 1.4 Reset the error state when the `src` prop changes (so a new valid src retries)
- [x] 1.5 Add a small set of placeholder graphics under `public/placeholders/` (`event.svg`, `partner.svg`, `avatar.svg`) themed to the brand palette
- [x] 1.6 Add a unit test for the component covering: empty src → fallback, working src → image, onError → fallback, src change resets state

## 2. Wire SafeImage Into Existing Surfaces

- [x] 2.1 Replace `FadeInImage` usages in event cards (and any other stored-asset image surface) with `<SafeImage>` so the placeholder fallback applies
- [x] 2.2 Replace partner logo/venue image rendering with `<SafeImage>` where the logoUrl is shown
- [x] 2.3 Replace avatar rendering with `<SafeImage>` where applicable (member feed, partner portal)
- [x] 2.4 Verify the existing layout/visual behavior is preserved (aspect ratio, sizing, fade-in if previously used) by relying on className/aspectRatio passthrough

## 3. Configurable Upload Size Cap

- [x] 3.1 Add `R2_MAX_UPLOAD_BYTES` to `.env.example` as optional (with a comment explaining the default)
- [x] 3.2 Make `validateAdminAssetUploadFile` (or its size check) read `R2_MAX_UPLOAD_BYTES` when set, falling back to the existing `ADMIN_ASSET_UPLOAD_MAX_BYTES` constant (5 MB) otherwise
- [x] 3.3 Add a unit test covering both: unset env → default cap, set env → enforced cap
- [x] 3.4 Update the upload-route error message to reflect the actually-enforced cap when overridden

## 4. Documentation

- [x] 4.1 Add an `image-storage.md` (or extend an existing operations doc) describing: the upload flow (binding, validation, key scheme, public URL), the placeholder fallback contract, the `R2_MAX_UPLOAD_BYTES` knob, and the local dev fallback (HTTPS URL paste) when the R2 binding is unavailable

## 5. Verification

- [x] 5.1 Run the unit and integration test suite and resolve any failures
- [x] 5.2 Run `bun run check` (astro check + biome) and resolve any errors
- [x] 5.3 Manually verify in the browser: with a valid R2 URL the image renders, with a broken URL the placeholder renders, with a missing URL the placeholder renders directly, and the layout does not reflow
