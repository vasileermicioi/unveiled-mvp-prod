## ADDED Requirements

### Requirement: Shell Surfaces Are HeroUI-Backed

The app shell's reusable containers, navigation variants, page shell containers, and global state wrappers SHALL be composed from the HeroUI-backed primitives in `src/components/ui/` and SHALL NOT import from the deprecated shadcn primitives, the Ladle-only `heroui-replica/`, or any `mantine-replica/` folder.

#### Scenario: Shell imports land on production primitives

- **WHEN** the shell source under `src/layouts/` and
  `src/components/unveiled/` is audited
- **THEN** every `@/components/ui/...` import resolves to a HeroUI-backed
  primitive module under `src/components/ui/`
- **AND** no import lands inside `src/components/ui/heroui-replica/` or
  `src/components/ui/mantine-replica/`.

#### Scenario: Shell-level Ladle stories are parity-locked

- **WHEN** a shell container (page top-bar, breadcrumb row, status
  banner, language toggle, mobile drawer) is rendered inside a Ladle
  harness
- **THEN** the harness is referenced by a gherkin scenario in
  `tests/features/ui-system/` via a `@ladle(component=…, story=…)`
  tag
- **AND** the scenario asserts the shell surface matches the approved
  Ladle story for every variant the shell exposes.

### Requirement: Shell Docs Reference HeroUI

`AGENTS.md`, `docs/guidelines.md`, and `CONTRIBUTING.md` SHALL describe HeroUI as the production component library for the shell and SHALL NOT reference Mantine, shadcn, the `mantine-replica/`, the `heroui-replica/`, or the deleted Storybook workflow.

#### Scenario: Canonical docs name HeroUI

- **WHEN** a contributor reads the "Tech stack", "File layout", or
  "Toolchain commands" sections of `AGENTS.md`
- **THEN** HeroUI is named as the production component library
- **AND** no mention of Mantine, shadcn, or Storybook remains.

#### Scenario: Docs and replica gates agree

- **WHEN** `bun run heroui-design-system-replica:check` and the
  umbrella `bun run check` pass
- **THEN** the docs and the gates agree that the only HeroUI source of
  truth is the production module path, not a Ladle-only folder.