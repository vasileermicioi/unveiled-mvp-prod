## ADDED Requirements

### Requirement: Admin Asset Upload Operations
Admin operations SHALL support storage-backed event image and partner logo uploads without removing existing manual URL workflows.

#### Scenario: Admin uploads event image for event form
- **WHEN** an authenticated admin selects a valid event image file for an event form
- **THEN** the upload operation stores the file through the configured asset storage boundary
- **AND** returns a display URL that can be saved as the event `imageUrl`

#### Scenario: Admin uploads partner logo for partner form
- **WHEN** an authenticated admin selects a valid partner logo file for a partner form
- **THEN** the upload operation stores the file through the configured asset storage boundary
- **AND** returns a display URL that can be saved as the partner `logoUrl`

#### Scenario: Non-admin upload is rejected
- **WHEN** a guest, member, or partner attempts to upload an admin-managed event image or partner logo
- **THEN** the operation rejects the request before writing to asset storage
- **AND** no event or partner asset URL is changed

#### Scenario: Manual URL fallback remains available
- **WHEN** an admin provides a valid manual remote asset URL instead of uploading a file
- **THEN** event and partner save operations continue to persist that URL through the existing mutation flow

#### Scenario: Upload failure preserves existing asset
- **WHEN** storage, validation, or configuration prevents an upload after an existing asset URL is present
- **THEN** the operation returns a safe visible failure
- **AND** the existing event image or partner logo URL is not overwritten
