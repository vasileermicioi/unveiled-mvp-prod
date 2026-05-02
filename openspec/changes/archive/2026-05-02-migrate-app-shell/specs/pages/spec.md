## ADDED Requirements

### Requirement: Pages Consume Shared Shell Structure
Pages SHALL use shared app-shell containers for global layout behavior while retaining ownership of page-specific content.

#### Scenario: Public pages render in shell
- **WHEN** landing, public discover, how-it-works, FAQ, or membership pages render
- **THEN** they use the shared brand frame, navigation, content container, and optional status placement from the app shell
- **AND** their page-specific sections, forms, cards, accordions, and content remain owned by the page implementations

#### Scenario: Member pages render in shell
- **WHEN** discovery, saved, bookings, or profile pages render
- **THEN** they use the shared member navigation variant, content container, and page-level loading/error/empty wrappers where applicable
- **AND** event cards, booking cards, profile panels, and page-specific controls remain owned by page or feature components

#### Scenario: Operational pages render in shell
- **WHEN** partner or admin pages render
- **THEN** they use the shared operational navigation variant and page container
- **AND** operational tabs, filters, export controls, forms, tables, and management workflows remain inside the page content area

#### Scenario: Page content is not migrated by shell work
- **WHEN** the app shell change is implemented
- **THEN** it does not require completing page-specific business workflows, backend data loading, auth behavior, or legacy state-management behavior
