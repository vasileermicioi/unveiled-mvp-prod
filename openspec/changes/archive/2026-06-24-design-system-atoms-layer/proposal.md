## Why

`packages/design-system/src/` is currently a flat dump of 9 single files plus one
mega-file (`unveiled-primitives.tsx`, 414 lines) that re-exports 14 atoms. There
is no atomic-design layer boundary, no per-atom folder convention, and no
enforceable rule that ties atoms to HeroUI. The iteration-13 prompt is strict:
**all components are based on HeroUI; new components exist only in extreme cases
where HeroUI has no equivalent, and "extreme case" does not cover plain-React
components or third-party UI dependencies**. Six components in the current
package violate that rule — `Button.asChild` (uses `@radix-ui/react-slot`),
`Badge`, `Panel`, `TableShell`, `TableRow`, and `SafeImage` — and the existing
capability spec has no enforcement. This proposal moves the surviving atoms
into a real `packages/design-system/src/atoms/` layer with one folder per
atom, removes the six violators, and ships a gate script that makes the
HeroUI-only rule enforceable in CI.

## What Changes

- **BREAKING** (in-package): Remove `Button.asChild` and the
  `@radix-ui/react-slot` dependency. Consumers that need a `<Button>` rendered
  as an `<a>` switch to a styled `<a>` or to `HeroUIButton` directly.
- **BREAKING** (in-package): Remove the design-system `Badge`, `Panel`,
  `TableShell`, `TableRow`, and `SafeImage` components. Consumers use
  `HeroUIBadge` / `HeroUIChip`, `HeroUICard` / `Card` atom, `HeroUITable`,
  and plain `<img>` with `onError` respectively. Call-site migration is owned
  by proposals 07 (app) and 08 (landing); this proposal only removes the
  components, the barrel re-exports, and the `safe-image.test.tsx` companion.
  During the migration window the five removed names are re-exported from a
  legacy shim (`src/_legacy.tsx`) so consumers keep compiling. Proposals
  07/08 delete the shim and replace every call site.
- Add `packages/design-system/src/atoms/<atom>/<atom>.tsx`,
  `<atom>.types.ts`, `<atom>.ladle.tsx`, and (where the atom has non-trivial
  logic) `<atom>.test.tsx` for every surviving atom: `button`, `card`,
  `divider`, `tabs`, `text-input`, `text-area`, `select-item`, plus a
  `table-primitive` folder that groups the pass-through HeroUI Table
  re-exports.
- Replace `packages/design-system/src/index.ts` with the new barrel:
  flat re-exports of every atom (temporary, removed in proposal 07) plus an
  `Atoms` namespace export. Keep legacy molecules (`Drawer`, `Menu*`, `Modal`,
  `Toast`, `Field`, `StatePanel`, `StatPanel`, `SelectInput`) re-exported from
  their current paths so call sites keep compiling unchanged. Keep the five
  removed primitives re-exported from `src/_legacy.tsx` for the migration
  window.
- Add `packages/design-system/scripts/check-atomic-layers.ts` (gate) that
  enforces: atoms may import from `lib/` and `@nextui-org/react` only; atoms
  may not import from any higher layer; non-HeroUI third-party UI dependencies
  are forbidden; every `<atom>.tsx` MUST contain a `from "@nextui-org/react"`
  import (or be a HeroUI pass-through re-export); every atom is reachable from
  the barrel; every atom has a `*.ladle.tsx` or `*.test.tsx` companion.
- Wire the gate into `bun run check` (per-package + root) and add a permanent
  unit test under `tests/unit/` that spawns the gate and asserts exit 0.
- Add `packages/design-system/src/atoms/__overview__/overview.ladle.tsx` — a
  real atoms-grid story. The legacy replica overview in `heroui-replica/`
  stays in place until proposal 11 deletes it.
- Create empty `molecules/`, `organisms/`, `layouts/`, `pages/` directories
  under `packages/design-system/src/` so the layer boundaries are visible
  immediately (proposals 03–05 populate them).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `design-system-package`: MODIFIED. Add three requirements and modify the
  existing "exposes the production UI primitives" requirement to (a) make the
  HeroUI-only rule for atoms enforceable via the new gate, (b) codify the
  prompt's strict "no documented extreme cases for non-HeroUI components or
  third-party UI dependencies" wording, (c) require every atom to have a Ladle
  story or unit test companion, and (d) document the six removed components
  and their HeroUI / plain-element replacements.

## Impact

- Source: `packages/design-system/src/` is restructured (`atoms/<atom>/...`,
  empty `molecules/`, `organisms/`, `layouts/`, `pages/`). `button.tsx`,
  `tabs.tsx`, `safe-image.tsx`, `safe-image.test.tsx`, and
  `unveiled-primitives.tsx` are split or deleted. `index.ts` is rewritten.
- Dependencies: `@radix-ui/react-slot` removed from `packages/app/` (the
  `app/package.json` lockfile is regenerated). The HeroUI / class-variance /
  clsx / tailwind-merge / react / react-dom deps are now declared by
  `@unveiled/design-system` (the package now owns them rather than relying
  on hoisted resolution from `app/package.json`).
- Tooling: new gate script `packages/design-system/scripts/check-atomic-layers.ts`;
  new `check:atomic-layers` package script; new root script line in the
  umbrella `check`; new `tests/unit/atomic-layers.test.ts` permanent unit
  test.
- Call sites: this proposal migrates 5 in-package `<Button asChild>` consumers
  (3 in `packages/app`, 2 in `packages/landing`) to styled `<a>` elements.
  All other consumer code is unchanged in this proposal — the flat re-export
  in `index.ts` and the `_legacy.tsx` shim keep every consumer compiling
  until proposals 07/08 replace them.
- Ladle: new atom stories appear under the `Atoms` group alongside the
  existing replica stories. `bun run ladle:coverage` must still pass.