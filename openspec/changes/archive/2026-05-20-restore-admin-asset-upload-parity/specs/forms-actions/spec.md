## ADDED Requirements

### Requirement: Admin Asset Upload Form Actions
Admin asset upload form actions SHALL validate file input and return safe action results that can be composed with event and partner save forms.

#### Scenario: Upload action validates image file
- **WHEN** an admin submits an event image or partner logo upload with a file content type, filename, or size outside allowed limits
- **THEN** the action returns a safe field or form error
- **AND** it does not call the storage write boundary

#### Scenario: Upload action reports progress state
- **WHEN** an admin starts an asset upload from the event or partner form
- **THEN** the UI renders an in-progress state for that upload control until the action resolves

#### Scenario: Successful upload wires result into save form
- **WHEN** an admin upload action succeeds
- **THEN** the returned display URL is placed into the matching event image or partner logo URL value used by the save action
- **AND** the admin can submit the existing save form without re-uploading the file

#### Scenario: Failed upload keeps current URL value
- **WHEN** an upload action fails after the form already has a manual or existing asset URL
- **THEN** the form displays the safe error
- **AND** keeps the current URL value unchanged for the next save attempt

#### Scenario: Save action persists uploaded URL
- **WHEN** an admin submits an event or partner save form after a successful upload
- **THEN** the save action persists the uploaded display URL in the event `imageUrl` or partner `logoUrl` field
