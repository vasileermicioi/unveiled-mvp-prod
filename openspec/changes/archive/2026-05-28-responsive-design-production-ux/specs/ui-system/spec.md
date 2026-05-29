## ADDED Requirements

### Requirement: Skeleton Loading Primitives
The UI SHALL provide reusable `<Skeleton>` pulse containers representing loading state skeletons for textual elements, buttons, and card content.

#### Scenario: Skeleton pulse animation is active
- **WHEN** a `<Skeleton>` container renders during data loading phases
- **THEN** it displays a pulse animation (`animate-pulse`) using muted grey background blocks matching card and text dimensions.

### Requirement: Responsive Table-to-Card Structures
On viewports below `768px`, data tables (including admin lists and reports) SHALL collapse their row structures into self-contained vertical card blocks.

#### Scenario: Administrative table collapses on mobile
- **WHEN** the viewport width is below 768px
- **THEN** the admin partners directory table, events registry table, and member registry table render as stackable grid cards with label-value rows instead of horizontal columns.
