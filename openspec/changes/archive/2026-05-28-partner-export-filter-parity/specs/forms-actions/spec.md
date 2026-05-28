## ADDED Requirements

### Requirement: Partner Booking Export Action Event Filter
The partner booking export server action SHALL accept an optional `eventId` parameter to filter the exported bookings.

#### Scenario: Partner exports bookings filtered by event
- **WHEN** a partner requests to export bookings passing a specific `eventId`
- **THEN** the action verifies the partner ownership and returns only bookings linked to the specified event.
