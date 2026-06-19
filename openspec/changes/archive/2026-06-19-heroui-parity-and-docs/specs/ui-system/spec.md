## ADDED Requirements

### Requirement: UI-System Parity Suite Locks HeroUI Behavior

The gherkin parity suite under `tests/features/ui-system/` SHALL lock
the visible, accessible, and keyboard behavior of every HeroUI-backed
primitive exported from `src/components/ui/`. The Ladle coverage gate
SHALL be the contract that proves every `@ladle(…)` tag in the suite
resolves to a co-located production primitive story.

#### Scenario: Coverage gate is the parity contract

- **WHEN** `bun run ladle:coverage` runs against the post-migration
  suite
- **THEN** every scenario tagged with
  `@ladle(component=…, story=…)` resolves to a Ladle story backed by a
  HeroUI primitive module under `src/components/ui/` (no replica
  folder).

#### Scenario: Selector discipline is preserved

- **WHEN** a parity scenario is added or edited under
  `tests/features/ui-system/`
- **THEN** it expresses selections using only proximity selectors
  (`getFieldNearestTo`, `getButtonNearestTo`, `getLinkNearestTo`) or
  layout selectors (`getByRole`, `getByLabel`, `getByLandmark`,
  `getInside`)
- **AND** the selector-discipline lint at
  `tests/steps/lint/selectors.ts` does not flag the scenario.

### Requirement: Visual Regression Baselines Cover HeroUI Primitives

`tests/visual/` SHALL contain approved visual regression baselines for
every HeroUI-backed primitive the suite ships, so pixel-level
regressions introduced by future primitive swaps are caught by the
suite rather than by manual review.

#### Scenario: HeroUI primitives have a baseline snapshot

- **WHEN** the visual regression suite runs against any HeroUI-backed
  primitive (`Button`, `Panel`, `Card`, `Badge`, `Field`, `TextInput`,
  `SelectInput`, `TextArea`, `Modal`, `Drawer`, `Tabs`, `Menu`,
  `Toast`, `Notification`, `Skeleton`, `StatePanel`)
- **THEN** it has an approved baseline under `tests/visual/` and any
  pixel diff above the agreed threshold fails the run.

#### Scenario: Baselines were refreshed for the HeroUI migration

- **WHEN** the migration from shadcn to HeroUI changed a primitive's
  pixel output
- **THEN** the baseline under `tests/visual/` was regenerated and
  approved as part of this change
- **AND** the prior shadcn baseline was removed (or archived with a
  clear marker) so the suite no longer carries stale references.