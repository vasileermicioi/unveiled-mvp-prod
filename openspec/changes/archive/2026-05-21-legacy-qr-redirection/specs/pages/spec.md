## ADDED Requirements

### Requirement: Legacy QR Code Check-In Redirection
The app SHALL detect legacy query parameters (`venuePartner` and `venueToken`) on the root route and redirect the user automatically to the migrated venue check-in route.

#### Scenario: Legacy QR parameters redirect successfully
- **WHEN** a user requests the root route `/` with both `venuePartner` and `venueToken` query parameters
- **THEN** the app performs a server-side redirect to `/venue-check-in/[venuePartner]?token=[venueToken]`
- **AND** the redirection handles both authenticated users and guest users.
