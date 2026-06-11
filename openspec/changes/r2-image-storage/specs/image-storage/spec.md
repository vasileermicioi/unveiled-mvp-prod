## ADDED Requirements

### Requirement: Cloudflare R2 Binding Stores Uploaded Images
Image uploads SHALL be stored in a Cloudflare R2 bucket via the worker's `ASSETS_BUCKET` R2 binding, and the public URL of the stored object SHALL be persisted on the relevant database record.

#### Scenario: Admin event image upload writes to R2
- **WHEN** an admin uploads an event banner through the Admin panel
- **THEN** the upload endpoint writes the file to the R2 bucket via the `ASSETS_BUCKET` binding
- **AND** returns the public asset URL (`${PUBLIC_ASSET_BASE_URL}/${key}`)
- **AND** the URL is persisted on the event record's `imageUrl` field

#### Scenario: Admin partner logo upload writes to R2
- **WHEN** an admin uploads a partner logo through the Admin panel
- **THEN** the upload endpoint writes the file to the R2 bucket via the `ASSETS_BUCKET` binding
- **AND** returns the public asset URL
- **AND** the URL is persisted on the partner record's `logoUrl` field

### Requirement: Upload Validation Enforces Type And Size
The upload endpoint SHALL validate the file's content type and size before writing to R2 and SHALL reject unsupported content types or oversized files with a typed field error.

#### Scenario: Supported image types are accepted
- **WHEN** a client uploads a file with a content type of `image/jpeg`, `image/png`, or `image/webp`
- **THEN** the upload endpoint writes the file to R2 and returns the public URL

#### Scenario: Unsupported content types are rejected
- **WHEN** a client uploads a file with a content type outside the allowed set
- **THEN** the upload endpoint returns a typed field error indicating the content type is not allowed
- **AND** no object is written to R2

#### Scenario: Oversized uploads are rejected
- **WHEN** a client uploads a file larger than the configured maximum (`R2_MAX_UPLOAD_BYTES` when set, otherwise the 5 MB default)
- **THEN** the upload endpoint returns a typed field error indicating the file exceeds the size limit
- **AND** no object is written to R2

#### Scenario: Upload endpoint requires an authorized caller
- **WHEN** an unauthenticated or unauthorized client attempts to upload
- **THEN** the endpoint returns a 403 with a safe error
- **AND** no object is written to R2

### Requirement: Object Key Conventions
Uploaded objects SHALL be stored under scope-prefixed, owner-scoped keys.

#### Scenario: Object key is kind/owner-scoped and unique
- **WHEN** an upload is written to R2
- **THEN** the object key follows the pattern `<kind>/<ownerId>/<uuid>-<safe-filename>`
- **AND** `kind` is `event` or `partner`
- **AND** `ownerId` is the parent record id
- **AND** `<safe-filename>` is sanitized lowercase kebab derived from the original filename

### Requirement: Public URLs Use The Configured CDN Base
Stored images SHALL be served through the configured public R2 base URL.

#### Scenario: Public URL uses the configured base
- **WHEN** the upload endpoint returns a public URL for a stored object
- **THEN** the public URL is constructed as `${PUBLIC_ASSET_BASE_URL}/${key}`

#### Scenario: Image components resolve src from the public URL
- **WHEN** an event card, partner profile, or avatar surface renders a stored image
- **THEN** the `src` attribute points at the R2 public URL for the stored object

### Requirement: Image Render Fallback To Placeholder
A reusable `<SafeImage>` component SHALL render an R2 image with a placeholder fallback when the asset is missing, empty, or fails to load.

#### Scenario: Empty src renders placeholder directly
- **WHEN** `<SafeImage>` receives a null, undefined, or empty `src` prop
- **THEN** the component renders the placeholder graphic directly
- **AND** does not attempt to load from R2

#### Scenario: Broken R2 asset swaps to placeholder
- **WHEN** the underlying `<img>` element of `<SafeImage>` fires `onError` (network error, 404, or 5xx)
- **THEN** the component swaps the `src` to a placeholder graphic
- **AND** the surrounding layout retains its dimensions so the page does not reflow

#### Scenario: Successful load keeps the original src
- **WHEN** the underlying `<img>` element of `<SafeImage>` loads successfully
- **THEN** the original `src` is displayed
- **AND** no placeholder swap occurs

#### Scenario: Placeholder graphics exist for event, partner, and avatar
- **WHEN** the application is deployed
- **THEN** placeholder SVGs are served from `public/placeholders/event.svg`, `public/placeholders/partner.svg`, and `public/placeholders/avatar.svg`

### Requirement: Stored Images Use The SafeImage Component
Image-rendering surfaces that display stored R2 URLs SHALL use the `<SafeImage>` component so the placeholder fallback applies consistently.

#### Scenario: Event cards use SafeImage
- **WHEN** an event card renders its banner image
- **THEN** the rendering component uses `<SafeImage>` (not a raw `<img>`) so the placeholder fallback applies

#### Scenario: Partner venue surfaces use SafeImage
- **WHEN** a partner profile or partner venue surface renders its logo
- **THEN** the rendering component uses `<SafeImage>` so the placeholder fallback applies

#### Scenario: Avatar surfaces use SafeImage
- **WHEN** a user avatar is rendered
- **THEN** the rendering component uses `<SafeImage>` so the placeholder fallback applies

### Requirement: Upload Size Cap Is Configurable
The upload size cap SHALL be read from the optional `R2_MAX_UPLOAD_BYTES` env var, with a documented default when unset.

#### Scenario: Unset env falls back to the documented default
- **WHEN** `R2_MAX_UPLOAD_BYTES` is not set
- **THEN** the upload endpoint enforces the documented default cap (5 MB)

#### Scenario: Set env is enforced
- **WHEN** `R2_MAX_UPLOAD_BYTES` is set to a positive integer
- **THEN** the upload endpoint enforces that value as the maximum allowed upload size
