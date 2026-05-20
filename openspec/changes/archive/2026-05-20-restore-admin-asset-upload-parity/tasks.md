## 1. Upload Boundary

- [x] 1.1 Add shared upload validation for allowed image MIME types, filename metadata, and maximum file size before storage writes.
- [x] 1.2 Add an admin-only upload action or API route that accepts event image and partner logo files, authorizes the current viewer, and calls `uploadAdminAsset`.
- [x] 1.3 Return safe upload success metadata including display URL, content type, filename, and asset kind.
- [x] 1.4 Return safe validation, authorization, configuration, and storage errors without exposing storage secrets or stack traces.

## 2. Admin Form Wiring

- [x] 2.1 Add event image upload control, preview state, progress state, success state, and safe error state to the admin event form.
- [x] 2.2 Add partner logo upload control, preview state, progress state, success state, and safe error state to the admin partner form.
- [x] 2.3 Preserve editable manual HTTPS URL fallback fields for event image and partner logo values.
- [x] 2.4 Wire successful event uploads into the `imageUrl` value submitted by the existing event save action.
- [x] 2.5 Wire successful partner uploads into the `logoUrl` value submitted by the existing partner save action.
- [x] 2.6 Ensure failed uploads do not clear or overwrite existing/manual asset URL values.

## 3. Display And Configuration

- [x] 3.1 Extend admin display data or form view state to expose current image/logo URL, preview availability, upload availability, and safe error text.
- [x] 3.2 Ensure upload-unavailable state is visible when asset storage configuration is missing while manual URL fields remain usable.
- [x] 3.3 Document or update local, preview, and production asset storage configuration requirements for upload-enabled environments.

## 4. Regression Coverage

- [x] 4.1 Add unit tests for upload file validation, including rejected content type, missing filename, oversize file, and accepted image file cases.
- [x] 4.2 Add tests proving non-admin uploads are rejected before storage writes.
- [x] 4.3 Add tests proving successful upload metadata can be persisted through event `imageUrl` and partner `logoUrl` save flows.
- [x] 4.4 Add tests proving upload failure preserves existing/manual URL values and returns safe visible errors.
- [x] 4.5 Add DOM or parity smoke coverage for admin-visible event image and partner logo upload controls where feasible.

## 5. Verification

- [x] 5.1 Run focused asset storage, upload boundary, admin operation, and form wiring tests.
- [x] 5.2 Run the repository check command and address type, lint, or formatting failures.
- [x] 5.3 Run relevant parity smoke coverage for admin operations when available, or document why browser file upload verification is covered at unit/DOM level instead.
