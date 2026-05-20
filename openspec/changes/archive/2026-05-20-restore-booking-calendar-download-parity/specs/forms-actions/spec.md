## ADDED Requirements

### Requirement: Booking Calendar Download Action
Booking success actions SHALL provide a safe `.ics` download affordance when the confirmed event has calendar metadata.

#### Scenario: Save the date action downloads calendar file
- **WHEN** a member reaches a confirmed booking success state for an event with calendar metadata
- **THEN** the action set includes a visible "save the date" affordance that downloads an `.ics` file for the booked event

#### Scenario: Calendar file fields are complete
- **WHEN** the calendar file is generated for a booked event
- **THEN** it includes title, start time, derived end time, venue address, and description

#### Scenario: Calendar text is escaped
- **WHEN** the calendar file is generated from title, description, partner name, or address fields containing commas, semicolons, backslashes, or newlines
- **THEN** those values are escaped according to iCalendar text formatting rules

#### Scenario: Calendar filename is stable
- **WHEN** the calendar file is generated for an event title
- **THEN** the download filename is deterministic, filesystem-safe, and ends with `.ics`

#### Scenario: Calendar action is unavailable without metadata
- **WHEN** a booking success state lacks enough calendar metadata to generate a valid file
- **THEN** the calendar action is hidden or disabled without blocking redemption display or the return-to-feed action
