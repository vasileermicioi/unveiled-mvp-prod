## Why

The legacy admin panel let operators upload event images and partner logos directly from the admin UI. The migrated app has storage helpers and admin mutation flows, but the visible upload controls and storage-backed persistence path are not yet restored.

## What Changes

- Add admin-facing upload controls for event image and partner logo management.
- Route uploads through the current asset storage abstraction instead of Firebase Storage.
- Persist successful upload display URLs through existing event and partner admin mutation flows.
- Preserve manual URL fields as an operational fallback when upload is unavailable or not desired.
- Show upload progress, success, preview, and safe validation or storage error states without overwriting existing asset URLs on failure.
- Enforce admin authorization, allowed image content types, and file size limits before storage writes.
- Add regression coverage for authorization, validation, display-model wiring, and form result behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `operations`: Admin event and partner operations gain storage-backed image/logo upload parity.
- `forms-actions`: Admin upload actions and form result handling require safe validation, authorization, and non-stale error behavior.
- `display-data`: Admin event and partner display models expose upload-ready asset state, previews, and fallback URL values.
- `deployment`: Asset storage configuration requirements must cover local, preview, and production upload behavior.

## Impact

- Affected UI: admin event and partner management forms in `src/components/unveiled/visual-system-app.tsx`.
- Affected server boundaries: admin operations and any upload action or API route needed to pass file data to `src/lib/assets/storage.ts`.
- Affected data: event `imageUrl` and partner `logoUrl` persistence after successful upload.
- Affected configuration: asset storage environment or Cloudflare binding expectations for local parity, preview, and production.
- Affected tests: storage validation, admin authorization, operation result wiring, and admin UI/parity smoke assertions where feasible.
