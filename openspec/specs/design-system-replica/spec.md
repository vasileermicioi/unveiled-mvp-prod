## ADDED Requirements

### Requirement: The replica is Ladle-only

The system MUST keep every file under `src/components/ui/mantine-replica/` out of the production bundle. Each new file in that folder MUST carry a `// @ladle-only` header on its first line, and no file under `src/components/`, `src/pages/`, or `src/layouts/` outside that folder MAY import from it.

#### Scenario: A production file accidentally imports the replica
- **WHEN** a file under `src/components/unveiled/`, `src/components/payments/`, `src/components/providers/`, `src/pages/`, or `src/layouts/` (excluding the replica folder itself) adds an import whose resolved path starts with `src/components/ui/mantine-replica/`
- **THEN** `bun run design-system-replica:check` MUST fail and identify the offending file and import line

#### Scenario: A replica file is missing the Ladle-only header
- **WHEN** a `.tsx` file exists under `src/components/ui/mantine-replica/` whose first non-blank line is not exactly `// @ladle-only`
- **THEN** `bun run design-system-replica:check` MUST fail and list the file

#### Scenario: The replica-not-imported test passes in CI
- **WHEN** CI runs `bun run check`
- **THEN** the unit test `src/components/ui/mantine-replica/replica-not-imported.test.ts` MUST pass, asserting that walking the import graph from the production entry points never reaches a module under `src/components/ui/mantine-replica/`

### Requirement: The replica covers every surface in the inventory

The system MUST maintain a `INVENTORY.md` at `.development-plan/10-iteration/features/improvements/mantine-design-system-replica/INVENTORY.md` that lists every primitive in `src/components/ui/` and every production component that imports from `@/components/ui`. For each row whose `proves` checkbox is set, a `Mantine<Name>.tsx` component MUST exist in `src/components/ui/mantine-replica/` and MUST export a co-located `Mantine<Name>.ladle.tsx` file.

#### Scenario: A primitive in the inventory lacks a Mantine replica
- **WHEN** `INVENTORY.md` lists a primitive with `proves` checked and the corresponding `Mantine<Name>.tsx` is missing
- **THEN** `bun run design-system-replica:check` MUST fail and identify the primitive by name

#### Scenario: A Mantine component lacks its Ladle story
- **WHEN** a `Mantine<Name>.tsx` exists under `src/components/ui/mantine-replica/` without a co-located `Mantine<Name>.ladle.tsx`
- **THEN** `bun run design-system-replica:check` MUST fail and list the component

#### Scenario: Inventory drifts from the production surface
- **WHEN** a new file is added to `src/components/ui/` (excluding the replica folder) or a new component elsewhere imports from `@/components/ui` and the new surface is not reflected in `INVENTORY.md`
- **THEN** the next CI run of `bun run design-system-replica:check` MUST fail with a drift message naming the unlisted surface

### Requirement: The look and feel matches the production surface

The system MUST render every `Mantine<Name>.ladle.tsx` story on a `bg-brand-grey` background inside a container that applies the `unveiled-shadow` token, and `bun run ladle:coverage` MUST pass with no drift.

#### Scenario: A Ladle story lacks the brand backdrop
- **WHEN** a `Mantine<Name>.ladle.tsx` story renders without a `bg-brand-grey` background and the `unveiled-shadow` container
- **THEN** `bun run ladle:coverage` MUST fail and list the story

#### Scenario: Coverage drift is detected
- **WHEN** a `Mantine<Name>.ladle.tsx` exports a story whose `@ladle(component=…, story=…)` tag does not match a story registered in the Ladle project, or a story is registered without a referencing tag
- **THEN** `bun run ladle:coverage` MUST fail and identify the drift

### Requirement: The brand tokens drive the theme

The system MUST generate the Mantine theme exclusively from `design-tokens.json` via `mantine-replica/theme.ts`, wiring every named color (yellow, cream, grey, dark, white, error, success) into a Mantine color tuple and registering `theme.components` overrides for `Button`, `Badge`, `TextInput`, `Textarea`, `Select`, `Card`, `Paper`, `Divider`, `Modal`, `Drawer`, `Popover`, `Tabs`, `Menu`, and `Notification`. No new hex literal MAY be introduced under `src/components/ui/mantine-replica/`.

#### Scenario: A new hex literal is introduced in the replica
- **WHEN** a file under `src/components/ui/mantine-replica/` contains a string matching `/#[0-9a-fA-F]{3,8}\b/` that is not imported from `design-tokens.json`
- **THEN** `bun run design-system-replica:check` MUST fail and identify the file and line

#### Scenario: A registered component override is missing
- **WHEN** `theme.ts` does not register a `theme.components` entry for one of `Button`, `Badge`, `TextInput`, `Textarea`, `Select`, `Card`, `Paper`, `Divider`, `Modal`, `Drawer`, `Popover`, `Tabs`, `Menu`, or `Notification`
- **THEN** `bun run design-system-replica:check` MUST fail and name the missing primitive

#### Scenario: A design-token color is not wired into the theme
- **WHEN** a color name in `design-tokens.json` (yellow, cream, grey, dark, white, error, success) is not present as a key in `theme.colors` or `theme.other` of `theme.ts`
- **THEN** `bun run design-system-replica:check` MUST fail and name the missing color

### Requirement: The design-system overview is the Ladle landing page

The system MUST ship `src/components/ui/mantine-replica/design-system-overview.ladle.tsx`, which renders a single Ladle page laid out in a `<main role="main">` element with a `<h1>` heading "Unveiled Design System (Mantine replica)" and a `<nav>` of anchor links, where each anchor link navigates to a section that renders a `Mantine<Name>` primitive from the replica.

#### Scenario: The overview file is missing
- **WHEN** `src/components/ui/mantine-replica/design-system-overview.ladle.tsx` does not exist
- **THEN** `bun run design-system-replica:check` MUST fail

#### Scenario: The overview page lacks the required landmark and heading
- **WHEN** `design-system-overview.ladle.tsx` renders without a `<main role="main">` element, without a `<h1>` whose text is exactly "Unveiled Design System (Mantine replica)", or without a `<nav>` element containing at least one anchor link
- **THEN** `bun run design-system-replica:check` MUST fail and identify the missing landmark

#### Scenario: The overview omits a replica primitive
- **WHEN** a `Mantine<Name>.tsx` exists in the replica but `design-system-overview.ladle.tsx` does not render it
- **THEN** `bun run design-system-replica:check` MUST fail and name the omitted primitive
