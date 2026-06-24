## Why

`packages/design-system/src/` mixes atoms with molecules in one
file (`unveiled-primitives.tsx`). Molecules are small compositions of
atoms with one job — `Field` composes label + control + helper,
`StatePanel` composes `Card` (formerly `Panel`, removed by proposal 02)
+ headline + body + action, `StatPanel` composes `Card` + label + value
+ caption, `SelectInput` composes `HeroUISelect` + a list of `SelectItem`s.
Without a molecules layer, the composition rules are invisible and new
contributors cannot tell whether they should put a new component in
`atoms/` or build on top of an atom.

This proposal creates `molecules/` and moves the 8 existing molecules in.
The `Icon` molecule proposed in the previous version of this proposal is
removed: HeroUI 2.x has no `Icon` primitive, and the iteration-13 prompt's
strict reading does not allow the design system to ship non-HeroUI
components. App/landing consumers inline `<svg>` directly with a
`// source: lucide-static` licence-traceability comment.

## What Changes

- Create `packages/design-system/src/molecules/` with one folder per
  molecule: `field/`, `state-panel/`, `stat-panel/`, `select-input/`,
  `toast/`, `drawer/`, `modal/`, `menu/`. Each molecule is a small
  composition of atoms (or, in the case of `toast`/`drawer`/`modal`/`menu`,
  a composition of HeroUI primitives via dedicated atoms that wrap them).
  Molecules MUST NOT import from `@nextui-org/react` or `@heroui/*`
  directly — they compose atoms, which in turn wrap HeroUI primitives.
  The "molecules may import HeroUI" carve-out from the previous version
  of this proposal is REMOVED.
- Move the 8 molecules (`Field`, `StatePanel`, `StatPanel`,
  `SelectInput`, `Toast`, `Drawer`, `Modal`, `Menu`/`MenuTrigger`/
  `MenuContent`/`MenuItem`/`MenuSection`) from their current locations
  (`unveiled-primitives.tsx` for the first four; `toast.tsx`, `drawer.tsx`,
  `modal.tsx`, `menu.tsx` for the rest) into
  `packages/design-system/src/molecules/<molecule>/`. Each molecule gets
  a `<molecule>.tsx`, a `<molecule>.types.ts` (where prop types are
  non-trivial), and a `<molecule>.ladle.tsx`.
- Tighten the `Field` molecule prop type from `children: ReactNode` to
  `children: ReactElement<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>`,
  so the gate can verify a `Field` always wraps an input-like atom.
- Re-export every molecule from `packages/design-system/src/index.ts`
  under a `Molecules` namespace AND keep the flat re-exports from the
  legacy paths for the migration window (proposals 07/08 remove the
  flat re-exports).
- Extend `packages/design-system/scripts/check-atomic-layers.ts` with
  three new rules:
  - `R-MOLECULES-NO-MOLECULE-IMPORT` — any file under `molecules/` may
    import from `./atoms/...` and `./lib/...` only.
  - `R-MOLECULES-NO-HEROUI` — any file under `molecules/` may NOT
    import from `@nextui-org/react`, `@heroui/*`, or any
    `@nextui-org/*` package directly. Molecules compose atoms; the atoms
    wrap HeroUI. (NEW, supersedes the previous "molecules may import
    HeroUI" carve-out.)
  - `R-MOLECULES-NO-ABOVE-IMPORT` — any file under `molecules/` may
    NOT import from `./organisms/...`, `./layouts/...`, or `./pages/...`.
  - `R-MOLECULES-NO-LUCIDE` — no `lucide-react` imports anywhere under
    `molecules/`. The design system has no `Icon` molecule.
  - `R-ORGANISMS-NO-HEROUI` — any file under `organisms/`, `layouts/`,
    or `pages/` may not import from `@nextui-org/react` directly.
    Forward-looking rule, active now.
- No `Icon` molecule is added. HeroUI 2.x has no `Icon` primitive, and
  the iteration-13 prompt's strict reading does not allow the design
  system to ship non-HeroUI components. App/landing consumers inline
  `<svg>` directly with a `// source: lucide-static` comment for
  licence traceability (proposals 07/08 own the convention).
- Wire the new gate rules into `bun run check:atomic-layers` and
  `tests/unit/atomic-layers.test.ts`.
- App-side icon extraction (light): replace the 5 inline icons in
  `packages/app/src/components/unveiled/app-shell.tsx` with inline
  `<svg>` blocks carrying a `// source: lucide-static` comment (the
  final inline-`<svg>` convention is owned by proposals 07/08; this
  proposal only adds the licence-traceability comment to the 5 existing
  inlines in `app-shell.tsx`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `design-system-package`: MODIFIED.
  - **ADDED** requirement `Molecules compose atoms, not HeroUI directly`.
    Enforced by the gate. Removes the previous "molecules may import
    HeroUI" carve-out.
  - **REMOVED** requirement `The Icon molecule is the only icon abstraction`.
    HeroUI 2.x has no `Icon` primitive; the design system does not ship
    an `Icon` molecule. App/landing inline `<svg>` directly; each
    inlined `<svg>` MUST carry a `// source: lucide-static` comment.
  - **MODIFIED** requirement `No third-party UI dependencies in the
    design system`. The design system has **no** third-party UI
    dependencies after proposal 02 drops `@radix-ui/react-slot`. The
    no-Icon molecule rule means no `lucide-react` import either.
  - **MODIFIED** requirement `@unveiled/design-system` exposes the
    production UI primitives: the flat re-export now covers the
    molecules in addition to the atoms; the `Molecules` namespace
    export is added alongside the existing `Atoms` namespace.

## Impact

- Source: `packages/design-system/src/unveiled-primitives.tsx` is
  trimmed to remove `Field`, `StatePanel`, `StatPanel`, `SelectInput`.
  `packages/design-system/src/{toast,drawer,modal,menu}.tsx` are
  removed (their content moves into
  `packages/design-system/src/molecules/<molecule>/`). The
  `packages/design-system/src/molecules/` directory grows from
  `index.ts` (created in proposal 02) to 8 molecule folders.
- Tooling: `packages/design-system/scripts/check-atomic-layers.ts` is
  extended with `R-MOLECULES-NO-MOLECULE-IMPORT`,
  `R-MOLECULES-NO-HEROUI`, `R-MOLECULES-NO-ABOVE-IMPORT`,
  `R-MOLECULES-NO-LUCIDE`, and `R-ORGANISMS-NO-HEROUI`. The
  `tests/unit/atomic-layers.test.ts` permanent unit test is updated
  to assert the new rules pass.
- Call sites: every consumer in `packages/app/src/**` and
  `packages/landing/src/**` continues to compile and run after this
  change lands. The flat re-export in `index.ts` keeps every existing
  import path working. Proposals 07 (app) and 08 (landing) own the
  consumer migration to the `Molecules` namespace and the
  inline-`<svg>` convention.
- Ladle: 8 new molecule stories appear under the `Molecules` group
  alongside the existing `Atoms` group. `bun run ladle:coverage` must
  still pass.
- App/landing: app-side icon extraction (light) only — the 5 inline
  `<svg>` blocks in `packages/app/src/components/unveiled/app-shell.tsx`
  gain a `// source: lucide-static` licence-traceability comment.
  Proposals 07/08 own the full inline-`<svg>` convention and any
  other inlined icons.
