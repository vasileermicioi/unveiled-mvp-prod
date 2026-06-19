## MODIFIED Requirements

### Requirement: HeroUI Primitive Parity Coverage

Every HeroUI-backed primitive shipped in `@unveiled/design-system` SHALL have a gherkin-driven parity scenario under `tests/features/ui-system/` that locks its accessible name, keyboard contract, focus behavior, and the canonical visual variants produced by the production wrapper.

#### Scenario: Button primitive is parity-locked

- **WHEN** the Button primitive (re-exported from `@unveiled/design-system` and originally authored in `packages/design-system/src/button.tsx`) is rendered with each entry from its `variant` and `size` matrix
- **THEN** a gherkin scenario in `tests/features/ui-system/button.feature` asserts the visible label, `aria-disabled`, focus ring, loading state, and `asChild` rendering match the approved Ladle story
- **AND** the scenario carries a `@ladle(component=Button, story=…)` tag resolved by `packages/design-system/scripts/coverage.ts`.

#### Scenario: Panel and Card primitives are parity-locked

- **WHEN** the `Panel` and `Card` primitives are rendered with each entry from their `variant`, `tone`, and `shadow` matrix
- **THEN** a gherkin scenario in `tests/features/ui-system/panel-card.feature` asserts the bordered, high-contrast Unveiled visual treatment is preserved
- **AND** the scenario carries a `@ladle(component=…, story=…)` tag that resolves to a co-located `Panel.ladle.tsx` / `Card.ladle.tsx` harness shipped by `@unveiled/design-system`.

#### Scenario: Badge primitive is parity-locked

- **WHEN** the `Badge` primitive is rendered with each entry from its variant and tone matrix
- **THEN** a gherkin scenario in `tests/features/ui-system/badge.feature` asserts the visible label, color, count-adjacent label, and `aria-label` (when used as a count badge) match the approved Ladle story
- **AND** the scenario carries a `@ladle(component=Badge, story=…)` tag resolved by `packages/design-system/scripts/coverage.ts`.

#### Scenario: Form primitives are parity-locked

- **WHEN** any of `Field`, `TextInput`, `SelectInput`, or `TextArea` is rendered with `label`, `hint`, `error`, `value`, `onChange`, and `disabled` props
- **THEN** a gherkin scenario in `tests/features/ui-system/field-text-input.feature`, `field-select-input.feature`, or `field-text-area.feature` asserts the visible label, hint, error placement, focus ring, and disabled state match the approved Ladle story
- **AND** the selector contract used by the suite continues to be proximity (`getFieldNearestTo`) + layout (`getByLabel`) selectors, with no `data-testid` or CSS-class selectors introduced.

#### Scenario: Modal and Drawer primitives are parity-locked

- **WHEN** the `Modal` or `Drawer` primitive is opened with each entry from its `size`, `placement`, and content-state matrix
- **THEN** a gherkin scenario in `tests/features/ui-system/modal.feature` and `tests/features/ui-system/drawer.feature` asserts the focus trap, `aria-modal`, `aria-labelledby`, close-on-escape behavior, and the full-screen brand-yellow booking shell render as the Ladle story shows them
- **AND** the public `open`, `onClose`, `title`, and `children` props remain selector-disciplinable via proximity + layout selectors.

#### Scenario: Tabs and Menu primitives are parity-locked

- **WHEN** the `Tabs` or `Menu` primitive is rendered with each entry from its `orientation`, `variant`, and trigger-state matrix
- **THEN** a gherkin scenario in `tests/features/ui-system/tabs.feature` and `tests/features/ui-system/menu.feature` asserts the visible label, keyboard arrow-key navigation, `aria-selected` / `aria-expanded` state, and active-panel visibility match the approved Ladle story.

#### Scenario: Toast and Notification primitives are parity-locked

- **WHEN** the `Toast` or `Notification` primitive is rendered with each entry from its `tone`, `duration`, and `action` matrix
- **THEN** a gherkin scenario in `tests/features/ui-system/toast-notification.feature` asserts the visible message, optional action label, `role="status"` / `role="alert"` wrapper, auto-dismiss timer, and localized `aria-live` region match the approved Ladle story.

### Requirement: Parity Suite Has No Replica References

The gherkin parity suite SHALL NOT reference `packages/design-system/src/heroui-replica/` or any future Mantine replica after this change is applied. Every `@ladle(…)` tag SHALL resolve to a story backed by the production primitive under `packages/design-system/src/` and a co-located `<Component>.ladle.tsx` harness under `tests/features/`.

#### Scenario: No feature file imports a replica path

- **WHEN** `rg "heroui-replica|mantine-replica" tests/features/` runs
- **THEN** zero matches are returned.

#### Scenario: Every @ladle tag resolves to a production primitive

- **WHEN** `bun --filter @unveiled/design-system run ladle:coverage` runs
- **THEN** every `@ladle(component=…, story=…)` tag in the suite resolves to a story whose component module is exported from `packages/design-system/src/` (not from a replica folder).

### Requirement: Permanent Replica Import-Graph Guard

A permanent unit test SHALL prevent any future Ladle-only staging folder under `packages/design-system/src/` from being imported by production code.

#### Scenario: Production entry points do not import a replica folder

- **WHEN** `packages/design-system/src/heroui-replica/isolation.test.ts` walks the import graph from every production entry point under `packages/app/src/**`, `packages/landing/src/**`, `src/components/unveiled/`, `src/components/payments/`, `src/components/providers/`, `src/pages/`, and `src/layouts/`
- **THEN** no transitive import lands inside a folder whose path matches `packages/design-system/src/*-replica/` (case-insensitive).

#### Scenario: New replica folder is detected

- **WHEN** a contributor adds a new folder under `packages/design-system/src/` whose name ends in `-replica/`
- **THEN** the unit test fails
- **AND** `bun run check` fails until the contributor removes the folder or renames it (and gates it through the Ladle-only mechanism documented in `docs/guidelines.md`).