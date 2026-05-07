## ADDED Requirements

### Requirement: Member Membership Gate State
Payment and subscription data SHALL expose member membership gate state needed by discovery, booking, and membership pages.

#### Scenario: Active membership allows booking checks to proceed
- **WHEN** a member has an active membership state and enough credits for the requested ticket quantity
- **THEN** booking surfaces can proceed to capacity and event-state checks

#### Scenario: Non-active membership blocks booking
- **WHEN** a member has unpaid, past-due, canceled, missing, or admin-frozen membership state
- **THEN** discovery and booking surfaces show the visible membership gate
- **AND** booking transactions reject the booking safely

#### Scenario: Membership page uses existing checkout state
- **WHEN** a member opens the membership page
- **THEN** the page displays subscription, checkout, credit, unpaid, past-due, or frozen state using existing payment and subscription data
