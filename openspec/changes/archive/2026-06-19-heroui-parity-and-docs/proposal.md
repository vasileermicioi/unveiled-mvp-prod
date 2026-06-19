## Why

After the production UI migrated from shadcn to HeroUI, the gherkin/Ladle parity
suite, the visual baselines, the canonical docs, the architecture model, and the
active OpenSpec changes still reference the temporary replica, Mantine, or
shadcn. This change closes that loop: parity coverage is rewritten against the
new HeroUI-backed primitives, the Ladle coverage gate and import-graph guard
are updated for the new layout, the canonical docs and LikeC4 model reflect
HeroUI as the production library, and the three umbrella changes
(`heroui-ladle-design-system`, `replace-shadcn-with-heroui`,
`heroui-parity-and-docs`) are validated and archived so the live specs fold
their deltas in.

## What Changes

- **Gherkin and Ladle parity:**
  - Audit every `.feature` and Ladle harness under `tests/features/` for
    scenarios or tags that mention Mantine, shadcn, the
    `mantine-replica/` folder, or the Ladle-only `heroui-replica/` folder.
  - Replace replica story references with production primitive story
    references (`@ladle(component=…, story=…)` tags pointing at the new
    `src/components/ui/` primitives).
  - Add or update feature specs under `tests/features/ui-system/` for the
    HeroUI-backed primitives: Button, Panel, Card, Badge,
    Field/TextInput/SelectInput/TextArea, Modal, Drawer, Tabs, Menu, and
    Toast/Notification.
  - Ensure every new feature spec that carries a `@ladle(…)` tag has a
    co-located `<Component>.ladle.tsx` harness.
- **Ladle coverage gate and import-graph guard:**
  - Update `tests/ladle/coverage.ts` so it walks `src/components/ui/` and
    `tests/features/` correctly for the new HeroUI story paths, and remove
    any special-case handling for the deleted Mantine replica folder.
  - Move the import-graph guard out of the replica folder into a permanent
    location (e.g. `tests/unit/no-ladle-replica-in-production.test.ts`) so
    any future Ladle-only staging folder under `src/components/ui/` is
    unreachable from production entry points.
  - Run `bun run ladle:coverage` until there is no drift.
- **Unit and visual tests:**
  - Update or add visual regression baselines under `tests/visual/` for
    surfaces whose pixel output changed during the HeroUI migration.
- **Canonical docs and architecture:**
  - Update `AGENTS.md` to drop Mantine / shadcn references, document HeroUI
    as the production component library, and reflect the updated
    `ladle:coverage` and replica-check toolchain.
  - Update `docs/guidelines.md` for HeroUI authoring conventions (theming,
    prop forwarding, Ladle story requirements).
  - Update `CONTRIBUTING.md` if it references Mantine, shadcn, the replica
    check scripts, or the old Storybook workflow.
  - Update `architecture/model.ts` so the component-library dependency node
    is HeroUI instead of shadcn/Mantine.
  - Update `openspec/specs/ui-system/spec.md` and
    `openspec/specs/app-shell/spec.md` to require HeroUI-backed primitives
    and Ladle story coverage instead of the old references.
- **OpenSpec archive:**
  - Run `openspec validate` for `heroui-ladle-design-system`,
    `replace-shadcn-with-heroui`, and `heroui-parity-and-docs`.
  - Archive the three changes via `openspec archive` after their PRs merge.
  - Fold the final spec deltas into the live `openspec/specs/ui-system/` and
    `openspec/specs/app-shell/` specs.
  - Retire `openspec/specs/design-system-replica/` once the temporary
    replica capability is no longer referenced.

## Capabilities

### New Capabilities

- `ui-system-heroui-parity`: gherkin-driven parity coverage for every
  HeroUI-backed primitive, guaranteeing accessible labels, keyboard
  behavior, focus states, and visual variants are preserved.

### Modified Capabilities

- `app-shell`: docs and spec references updated so HeroUI is the production
  component library for shell-level containers, navigation variants, and
  shared shell wrappers.
- `ui-system`: spec updated to require HeroUI-backed primitives and Ladle
  story coverage instead of the shadcn/Mantine references left by the
  migration slices.

### Removed Capabilities

- `design-system-replica`: the temporary replica capability is retired once
  the HeroUI migration is complete and the replica folder is gone from the
  production tree.

## Impact

- **New files:**
  - New gherkin `.feature` files and `<Component>.ladle.tsx` harnesses
    under `tests/features/ui-system/`.
  - Updated visual regression baselines under `tests/visual/`.
  - `tests/unit/no-ladle-replica-in-production.test.ts` (permanent
    import-graph guard).
- **Modified files:**
  - `tests/ladle/coverage.ts`
  - `tests/ladle/ladle.spec.ts`
  - `tests/parity/gherkin.spec.ts`
  - `tests/steps/*.ts` selector registries (any Mantine/shadcn-specific
    selectors)
  - `AGENTS.md`
  - `docs/guidelines.md`
  - `CONTRIBUTING.md`
  - `architecture/model.ts`
  - `components.json`
  - `openspec/specs/ui-system/spec.md`
  - `openspec/specs/app-shell/spec.md`
  - `openspec/specs/design-system-replica/spec.md`
- **Removed files:**
  - `src/components/ui/heroui-replica/` once production parity is
    demonstrated and the replica is no longer needed.
  - Any remaining Mantine- or shadcn-specific test files or scripts.
- **Dependencies changed:** none.
- **Risks:**
  - Gherkin scenarios may still depend on shadcn/Radix-specific DOM
    structures. Mitigation: rewrite selectors to use the proximity / aria
    selector discipline already in place under `tests/steps/`.
  - Docs drift if changes are not back-ported to canonical specs.
    Mitigation: require `openspec validate` and `openspec archive` as the
    final step before closing the umbrella.