## ADDED Requirements

### Requirement: Public Discover Page Event Preview Modal
The public discover page SHALL allow guest/unauthenticated users to click events to view a detailed preview modal containing the title, category, description, timing, and venue, with a call-to-action to register or sign in instead of booking options.

#### Scenario: Guest views event details preview modal
- **WHEN** a guest/unauthenticated user clicks an event card or map marker on the public discover page
- **THEN** the page opens a detailed event preview modal showing the event information
- **AND** the modal displays a premium call-to-action button redirecting the user to sign in
- **AND** the modal hides all ticket count selection and booking action buttons
