## ADDED Requirements

### Requirement: Ladle and Hero UI Naming Conventions

This capability is updated to be consistent with the Ladle storybook replacement and Hero UI component library naming conventions. All component references, testing patterns, and UI system references align with the Ladle + Hero UI toolchain.

#### Scenario: Terminology is consistent with Ladle

- **WHEN** contributors read this spec
- **THEN** they find no references to Storybook; Ladle is the reference toolchain
- **AND** they find no references to shadcn/ui; Hero UI is the reference component library

#### Scenario: Testing patterns follow Playwright + proximity selector discipline

- **WHEN** a gherkin scenario selects any shell control
- **THEN** the scenario is expressed using proximity selectors (`getFieldNearestTo`, `getButtonNearestTo`, `getLinkNearestTo`) or layout selectors (`getByRole`, `getByLabel`, `getByLandmark`, `getInside`)
- **AND** no `data-testid` or CSS class selectors are used