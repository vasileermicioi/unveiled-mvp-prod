## ADDED Requirements

### Requirement: Target Brand Tokens
The UI system SHALL expose the Unveiled visual language as target-app reusable tokens and utility patterns.

#### Scenario: Brand tokens exist
- **WHEN** the target UI system is implemented
- **THEN** reusable tokens exist for brand yellow `#FAFF86`, brand dark `#202621`, brand cream `#FEFFE2`, brand grey `#F5F5F5`, white surfaces, dark borders, offset shadows, compact uppercase metadata, and display headings
- **AND** components use those tokens instead of ad hoc one-off color or shadow values

#### Scenario: Legacy visual reference is checked
- **WHEN** the token values are chosen
- **THEN** `_old_app/index.css` and logo assets are used only as read-only visual references

### Requirement: Shared Primitive Parity
The UI system SHALL provide shared primitives whose visible states match the legacy UI reference.

#### Scenario: Primitive variants render
- **WHEN** buttons, inputs, selects, textareas, cards, badges, table rows, dialogs, tabs, and state panels are rendered
- **THEN** they support primary, secondary, active, disabled, hover, loading, error, empty, and copied visual states
- **AND** their default appearance follows the squared, thick-bordered, high-contrast Unveiled style

#### Scenario: Icon usage renders
- **WHEN** a legacy-referenced control includes an icon
- **THEN** the corresponding target component uses a lucide-style icon with matching size, placement, and contrast

### Requirement: Visual Parity Verification
The UI system SHALL be verified against representative legacy visuals before implementation is considered complete.

#### Scenario: Core states are inspected
- **WHEN** the UI system migration is reviewed
- **THEN** primary/secondary buttons, segmented controls, text inputs, selects, cards, dialogs, loading panels, empty panels, and error panels are compared against `_old_app/` references
- **AND** mobile and desktop states are included in the review

