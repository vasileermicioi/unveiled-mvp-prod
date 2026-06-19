# Capability: heroui-ladle-design-system

## Purpose

Define the HeroUI-based design-system replica hosted exclusively inside the
Ladle harness, including its isolation guarantees, inventory coverage, look
and feel parity with production, brand-token driven theme, and the
design-system overview landing page.

## Requirements

### Requirement: The HeroUI replica is Ladle-only

The system MUST keep every file under `packages/design-system/src/heroui-replica/` out of the production bundle. Each file in that folder MUST carry a `// @ladle-only` header on its first non-blank line, and no file under `packages/design-system/src/**` (excluding the replica folder itself) and no file under `packages/app/src/**`, `packages/landing/src/**`, `src/components/`, `src/pages/`, `src/layouts/`, or `src/actions/` MAY import from it.

#### Scenario: A production file accidentally imports the HeroUI replica
- **WHEN** a file under `packages/design-system/src/**`, `packages/app/src/**`, `packages/landing/src/**`, `src/components/unveiled/`, `src/components/payments/`, `src/components/providers/`, `src/pages/`, `src/layouts/`, or `src/actions/` (excluding the replica folder itself) adds an import whose resolved path starts with `packages/design-system/src/heroui-replica/` or `@unveiled/design-system/heroui-replica`
- **THEN** `bun --filter @unveiled/design-system run heroui-design-system-replica:check` MUST fail and identify the offending file and import line.

#### Scenario: A replica file is missing the Ladle-only header
- **WHEN** a `.ts` or `.tsx` file exists under `packages/design-system/src/heroui-replica/` whose first non-blank line is not exactly `// @ladle-only`
- **THEN** `bun --filter @unveiled/design-system run heroui-design-system-replica:check` MUST fail and list the file.

#### Scenario: The replica-not-imported test passes in CI
- **WHEN** CI runs `bun run check`
- **THEN** the unit test `packages/design-system/src/heroui-replica/isolation.test.ts` MUST pass, asserting that walking the import graph from the production entry points in `packages/app/src/**`, `packages/landing/src/**`, and the runtime export of `@unveiled/design-system` never reaches a module under `packages/design-system/src/heroui-replica/`.

### Requirement: The HeroUI replica covers every surface in the inventory

The system MUST maintain an `INVENTORY.md` at `.development-plan/11-iteration/features/improvements/heroui-design-system-replica/INVENTORY.md` that lists every primitive in `packages/design-system/src/` and every production component that imports from `@unveiled/design-system`. For each row whose `proves` checkbox is set, a `Hero<Name>.tsx` component MUST exist in `packages/design-system/src/heroui-replica/` and MUST export a co-located `Hero<Name>.ladle.tsx` file.

#### Scenario: A primitive in the inventory lacks a HeroUI replica
- **WHEN** `INVENTORY.md` lists a primitive with `proves` checked and the corresponding `Hero<Name>.tsx` is missing
- **THEN** `bun --filter @unveiled/design-system run heroui-design-system-replica:check` MUST fail and identify the primitive by name.

#### Scenario: A HeroUI component lacks its Ladle story
- **WHEN** a `Hero<Name>.tsx` exists under `packages/design-system/src/heroui-replica/` without a co-located `Hero<Name>.ladle.tsx`
- **THEN** `bun --filter @unveiled/design-system run heroui-design-system-replica:check` MUST fail and list the component.

#### Scenario: Inventory drifts from the production surface
- **WHEN** a new file is added to `packages/design-system/src/` (excluding the replica folder) or a new component elsewhere imports from `@unveiled/design-system` and the new surface is not reflected in `INVENTORY.md`
- **THEN** the next CI run of `bun --filter @unveiled/design-system run heroui-design-system-replica:check` MUST fail with a drift message naming the unlisted surface.

### Requirement: The look and feel matches the production surface

The system MUST render every `Hero<Name>.ladle.tsx` story on a `bg-brand-grey` background inside a container that applies the `unveiled-shadow` token, and `bun --filter @unveiled/design-system run ladle:coverage` MUST pass with no drift.

#### Scenario: A Ladle story lacks the brand backdrop
- **WHEN** a `Hero<Name>.ladle.tsx` story renders without a `bg-brand-grey` background and the `unveiled-shadow` container
- **THEN** `bun --filter @unveiled/design-system run ladle:coverage` MUST fail and list the story.

#### Scenario: Coverage drift is detected
- **WHEN** a `Hero<Name>.ladle.tsx` exports a story whose `@ladle(component=…, story=…)` tag does not match a story registered in the Ladle project, or a story is registered without a referencing tag
- **THEN** `bun --filter @unveiled/design-system run ladle:coverage` MUST fail and identify the drift.

### Requirement: The brand tokens drive the HeroUI theme

The system MUST generate the HeroUI theme exclusively from `design-tokens.json` via `packages/design-system/src/heroui-replica/theme.ts`, wiring every named color (yellow, cream, grey, dark, white, error, success) and every typography, radius, border, shadow, and motion token into the HeroUI / Tailwind theme. No new hex literal MAY be introduced under `packages/design-system/src/heroui-replica/`.

#### Scenario: A new hex literal is introduced in the replica
- **WHEN** a file under `packages/design-system/src/heroui-replica/` contains a string matching `/#[0-9a-fA-F]{3,8}\b/` that is not imported from `@unveiled/design-system/lib/design-tokens`
- **THEN** `bun --filter @unveiled/design-system run heroui-design-system-replica:check` MUST fail and identify the file and line.

#### Scenario: A registered component override is missing
- **WHEN** `packages/design-system/src/heroui-replica/theme.ts` does not register a theme entry for one of `Button`, `Card`, `Badge`, `Modal`, `Drawer`, `Tabs`, `Menu`, `Toast`, `TextInput`, `SelectInput`, `TextArea`, `Panel`, `StatPanel`, `StatePanel`, `Field`, `Divider`, `TableShell`, or `TableRow`
- **THEN** `bun --filter @unveiled/design-system run heroui-design-system-replica:check` MUST fail and name the missing primitive.

#### Scenario: A design-token color is not wired into the theme
- **WHEN** a color name in `design-tokens.json` (yellow, cream, grey, dark, white, error, success) is not present as a key in the HeroUI theme colors
- **THEN** `bun --filter @unveiled/design-system run heroui-design-system-replica:check` MUST fail and name the missing color.

### Requirement: The design-system overview is the Ladle landing page

The system MUST ship `src/components/ui/heroui-replica/design-system-overview.ladle.tsx`, which renders a single Ladle page laid out in a `<main role="main">` element with an `<h1>` heading "Unveiled Design System (HeroUI)" and a `<nav>` of anchor links, where each anchor link navigates to a section that renders a `Hero<Name>` primitive from the replica.

#### Scenario: The overview file is missing
- **WHEN** `src/components/ui/heroui-replica/design-system-overview.ladle.tsx` does not exist
- **THEN** `bun run heroui-design-system-replica:check` MUST fail

#### Scenario: The overview page lacks the required landmark and heading
- **WHEN** `design-system-overview.ladle.tsx` renders without a `<main role="main">` element, without an `<h1>` whose text is exactly "Unveiled Design System (HeroUI)", or without a `<nav>` element containing at least one anchor link
- **THEN** `bun run heroui-design-system-replica:check` MUST fail and identify the missing landmark

#### Scenario: The overview omits a replica primitive
- **WHEN** a `Hero<Name>.tsx` exists in the replica but `design-system-overview.ladle.tsx` does not render it
- **THEN** `bun run heroui-design-system-replica:check` MUST fail and name the omitted primitive
