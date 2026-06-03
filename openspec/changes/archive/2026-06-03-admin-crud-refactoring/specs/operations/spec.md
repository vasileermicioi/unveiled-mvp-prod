## ADDED Requirements

### Requirement: Admin Dashboard CRUD Deletion Safety
The Admin operations panel SHALL require confirmation from the admin before executing a delete operation on an event or a partner venue.

#### Scenario: Admin deletes event with confirmation modal
- **WHEN** an admin clicks the "Delete" button on an event row
- **THEN** the system SHALL display a deletion confirmation dialog with options to confirm or cancel the action

#### Scenario: Admin confirms event deletion
- **WHEN** an admin confirms the deletion in the confirmation dialog
- **THEN** the system SHALL call the delete event server action and refresh the active event list

#### Scenario: Admin cancels event deletion
- **WHEN** an admin cancels the deletion in the confirmation dialog
- **THEN** the system SHALL close the confirmation dialog and make no mutations

#### Scenario: Admin deletes partner with confirmation modal
- **WHEN** an admin clicks the "Delete" button on a partner row
- **THEN** the system SHALL display a deletion confirmation dialog with options to confirm or cancel the action

#### Scenario: Admin confirms partner deletion
- **WHEN** an admin confirms the deletion in the confirmation dialog
- **THEN** the system SHALL call the delete partner server action and refresh the active partner directory list

#### Scenario: Admin cancels partner deletion
- **WHEN** an admin cancels the deletion in the confirmation dialog
- **THEN** the system SHALL close the confirmation dialog and make no mutations

### Requirement: Admin Dashboard Edit Form Navigation
The Admin operations panel SHALL support mounting event and partner forms prefilled with existing database states to allow editing.

#### Scenario: Admin opens edit event view
- **WHEN** an admin clicks the "Edit" button on an event row
- **THEN** the system SHALL update the active tab view to the event form prefilled with the event's current properties

#### Scenario: Admin opens edit partner view
- **WHEN** an admin clicks the "Edit" button on a partner row
- **THEN** the system SHALL update the active tab view to the partner form prefilled with the partner's current properties
