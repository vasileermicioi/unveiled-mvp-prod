## ADDED Requirements

### Requirement: Admin Export Action Partner Filter
The admin export server action SHALL accept an optional `partnerId` parameter to filter the exported bookings.

#### Scenario: Admin exports bookings filtered by partner
- **WHEN** an admin requests to export bookings passing a specific `partnerId`
- **THEN** the action verifies the admin role and returns only bookings linked to the specified partner.
