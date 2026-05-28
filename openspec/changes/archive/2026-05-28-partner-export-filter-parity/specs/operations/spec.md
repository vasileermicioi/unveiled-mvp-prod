## ADDED Requirements

### Requirement: Partner Portal UI Event Export Filter
The partner portal SHALL pass the active event ID filter value to the booking export action when downloading guest codes.

#### Scenario: Partner configures event filter and downloads CSV
- **WHEN** a partner selects an event in the event filter dropdown and clicks the download CSV button
- **THEN** the UI passes the selected `eventId` to the booking export action.
