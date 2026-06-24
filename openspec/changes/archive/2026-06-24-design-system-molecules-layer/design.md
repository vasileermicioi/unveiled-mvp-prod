## Context

Proposal 02 of iteration 13 created
`packages/design-system/src/{atoms,molecules,organisms,layouts,pages}/`
folders and shipped a `check-atomic-layers` gate that enforces the
HeroUI-only rule for atoms. The molecules/organisms/layouts/pages
directories are still empty placeholders (single `index.ts` re-exporting
nothing) and the existing `packages/design-system/src/unveiled-primitives.tsx`
still mixes 4 molecules (`Field`, `StatePanel`, `StatPanel`,
`SelectInput`) with atoms, while `toast.tsx`, `drawer.tsx`, `modal.tsx`,
and `menu.tsx` remain top-level files alongside the atoms. There is no
clear rule that says "molecules compose atoms, not HeroUI directly",
and contributors cannot tell whether a new composition belongs in
`atoms/` or `molecules/`.

The iteration-13 prompt reads strictly: "all components are based on
HeroUI; new components exist only in extreme cases where HeroUI has no
equivalent". The previous version of this proposal allowed molecules to
import from `@nextui-org/react` directly as a "carve-out"; that carve-out
is REMOVED in this revision. Every HeroUI composition in the design
system now lives in `atoms/`; molecules are pure atom compositions. The
forward-looking `R-ORGANISMS-NO-HEROUI` rule is also laid down now, even
though no organism exists yet, so proposals 04/05 land into an
already-enforced rule.

This design promotes the 8 existing molecules to a real
`packages/design-system/src/molecules/<molecule>/` layer, tightens the
`Field` prop type, removes the `Icon` molecule entirely (HeroUI 2.x has
no `Icon` primitive), and ships the gate rules that make the layer
boundaries enforceable in CI.

## Goals / Non-Goals

**Goals:**

- Promote the 8 existing molecules (`Field`, `StatePanel`, `StatPanel`,
  `SelectInput`, `Toast`, `Drawer`, `Modal`, `Menu`/`MenuTrigger`/
  `MenuContent`/`MenuItem`/`MenuSection`) into
  `packages/design-system/src/molecules/<molecule>/` with the canonical
  4-file layout (`<molecule>.tsx`, `<molecule>.types.ts` for
  non-trivial prop types, `<molecule>.ladle.tsx` with a default story
  and at least one variant story, `<molecule>.test.tsx` for molecules
  with non-trivial logic). `kebab-case` per the contributor guidelines.
- Re-export every molecule from `packages/design-system/src/index.ts`
  under a `Molecules` namespace export AND keep the flat re-exports
  from the legacy paths (`unveiled-primitives.tsx`,
  `toast.tsx`, `drawer.tsx`, `modal.tsx`, `menu.tsx`) for the migration
  window. Proposals 07/08 delete the flat re-exports.
- Tighten the `Field` prop type from `children: ReactNode` to
  `children: ReactElement<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>`
  so the gate can verify a `Field` always wraps an input-like atom.
- Ship the three molecule rules in
  `packages/design-system/scripts/check-atomic-layers.ts`:
  `R-MOLECULES-NO-MOLECULE-IMPORT`,
  `R-MOLECULES-NO-HEROUI` (NEW, supersedes the previous
  "molecules may import HeroUI" carve-out), and
  `R-MOLECULES-NO-ABOVE-IMPORT`. Add `R-MOLECULES-NO-LUCIDE` (the
  design system has no `Icon` molecule; app/landing inline `<svg>`
  with a `// source: lucide-static` comment). Add the
  `R-ORGANISMS-NO-HEROUI` forward-looking rule.
- Wire the new gate rules into `bun run check:atomic-layers` and the
  `tests/unit/atomic-layers.test.ts` permanent unit test.
- Update `tests/unit/atomic-layers.test.ts` to assert the new rules
  pass.
- App-side icon extraction (light): add a `// source: lucide-static`
  comment to each of the 5 inline `<svg>` blocks in
  `packages/app/src/components/unveiled/app-shell.tsx` for licence
  traceability. Proposals 07/08 own the full inline-`<svg>`
  convention at the call site.
- Keep call sites working: every consumer in `packages/app/src/**` and
  `packages/landing/src/**` continues to compile and run after this
  change lands.

**Non-Goals:**

- Adding an `Icon` molecule. HeroUI 2.x has no `Icon` primitive, and
  the iteration-13 prompt's strict reading does not allow the design
  system to ship a non-HeroUI component. App/landing consumers inline
  `<svg>` directly with a `// source: lucide-static` comment.
- Touching organism / layout / page composition. Proposals 04 and 05.
- Replacing the existing `Button` (which composes HeroUI's Button)
  with a molecule that composes the `Button` atom + an icon. That is
  proposal 04 (`IconButton` organism) — and it composes the `Button`
  atom with a **HeroUI-styled inline `<svg>` at the call site** (no
  design-system Icon).
- Deprecating the legacy `unveiled-primitives.tsx` exports. They stay
  until proposal 07 removes them.
- Migrating every consumer of the flat re-export to the `Molecules`
  namespace. Proposals 07/08 own that.
- Removing the `heroui-replica/` folder. Proposal 11 retires the
  replica; this proposal only adds the new molecule stories alongside
  it.

## Decisions

### D1 — One folder per molecule with the canonical 4-file layout

The molecules folder convention matches the atoms convention from
proposal 02: one folder per molecule with `<molecule>.tsx`,
`<molecule>.types.ts` (only if the molecule has non-trivial prop
types), `<molecule>.ladle.tsx` (at least one default story and at
least one variant story), and `<molecule>.test.tsx` (only if the
molecule has non-trivial logic). The naming is `kebab-case` per the
contributor guidelines.

**Alternatives considered:**

- Single `molecules.tsx` file with all molecules → rejected because it
  recreates the same mega-file failure mode proposal 02 just removed
  from the atoms layer. One folder per molecule is the only way the
  gate can isolate which molecule broke the rule.
- Co-located stories only (no `.test.tsx`) → rejected because the gate
  needs a second companion option for molecules whose behaviour is
  best asserted via unit tests (e.g. `Menu` keyboard navigation). The
  4-file layout gives contributors a choice between Ladle stories and
  unit tests as the "demo obligation".

### D2 — Molecules compose atoms, not HeroUI directly

Molecules are pure atom compositions. Every HeroUI base lives in
`atoms/`; molecules import atoms, atoms import HeroUI. This is the
strict reading of the iteration-13 prompt's "all components based on
HeroUI" rule applied to the molecules layer: a molecule is either a
HeroUI composition (atom) or a composition of HeroUI compositions
(molecule/organism/layout) — no layer reaches past atoms to talk to
HeroUI. The `R-MOLECULES-NO-HEROUI` gate rule enforces this.

**Alternatives considered:**

- Allow "molecules may import HeroUI" carve-out (the previous version
  of this proposal) → rejected. The carve-out was a transitional
  convenience for `Toast`/`Drawer`/`Modal`/`Menu`, but those
  molecules can be rewritten as compositions of dedicated atoms that
  wrap HeroUI (and that is exactly what proposal 03 does). Once the
  dedicated atoms exist, the carve-out has no purpose.
- Forbid any new component that is not a HeroUI base → rejected.
  The design system needs molecules; forbidding all non-HeroUI
  components would be a misreading of the prompt. The rule is
  "atoms wrap HeroUI, molecules compose atoms".

### D3 — No `Icon` molecule; app/landing inline `<svg>`

HeroUI 2.x has no `Icon` primitive, and the iteration-13 prompt's
strict reading does not allow the design system to ship a non-HeroUI
component. The previous version of this proposal included an `Icon`
molecule as a documented extreme case; that molecule is REMOVED.
App/landing consumers inline `<svg>` directly with a
`// source: lucide-static` comment naming the source icon set for
licence traceability (the Lucide icon set is ISC-licensed; the path
geometry is in the public domain, so the comment is a convention, not
a licence requirement). Proposals 07/08 own the inline-`<svg>`
convention at the call site; this proposal only adds the
`// source: lucide-static` comment to the 5 existing inlines in
`app-shell.tsx`.

**Alternatives considered:**

- Ship a thin `Icon` molecule that wraps an inline `<svg>` →
  rejected. The molecule would not import from HeroUI, so it would
  fail the `R-ATOMS-MUST-BE-HEROUI` rule. A `molecules/Icon/Icon.tsx`
  would be a plain-React molecule with no HeroUI base, which is the
  same "extreme case" carve-out the prompt forbids.
- Re-export `lucide-react` from the design system as a facad → e
  rejected. `lucide-react` is a third-party UI library; the design
  system has no third-party UI dependencies after proposal 02 drops
  `@radix-ui/react-slot`. The gate's `R-MOLECULES-NO-LUCIDE` rule
  blocks the import.

### D4 — `Field` children type tightened to input-like elements

The current `Field` is typed `children: ReactNode`, which means
consumers can pass anything (including another `Field`). This proposal
tightens the type to
`children: ReactElement<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>`,
so the gate can verify a `Field` always wraps an input-like atom
(`TextInput`, `TextArea`, or `SelectInput`). The type narrowing
preserves the existing call sites because every current `Field` user
already passes one of those three atoms.

**Alternatives considered:**

- Keep `children: ReactNode` and rely on convention → rejected. The
  type is the only thing the gate can read; an opaque `ReactNode`
  type lets a contributor pass a `<div>` and the gate has no way to
  know. Tightening the type makes the rule machine-checkable.
- Use a `forwardRef` and a generic prop type → rejected. The current
  `Field` does not use a ref, and the generic prop type is a bigger
  change than the type narrowing.

### D5 — Gate rules: R-MOLECULES-NO-MOLECULE-IMPORT, R-MOLECULES-NO-HEROUI, R-MOLECULES-NO-ABOVE-IMPORT, R-MOLECULES-NO-LUCIDE, R-ORGANISMS-NO-HEROUI

`packages/design-system/scripts/check-atomic-layers.ts` (extended)
adds five new rules:

- `R-MOLECULES-NO-MOLECULE-IMPORT`: any file under `molecules/` may
  import from `./atoms/...` and `./lib/...` only.
- `R-MOLECULES-NO-HEROUI`: any file under `molecules/` may NOT
  import from `@nextui-org/react`, `@heroui/*`, or any
  `@nextui-org/*` package directly. Molecules compose atoms; the
  atoms wrap HeroUI.
- `R-MOLECULES-NO-ABOVE-IMPORT`: any file under `molecules/` may NOT
  import from `./organisms/...`, `./layouts/...`, or `./pages/...`.
- `R-MOLECULES-NO-LUCIDE`: no `lucide-react` imports anywhere under
  `molecules/`. The design system has no `Icon` molecule.
- `R-ORGANISMS-NO-HEROUI`: any file under `organisms/`, `layouts/`,
  or `pages/` may not import from `@nextui-org/react` directly.
  Forward-looking rule, active now.

The gate's allow-list per layer is the same shape as the atoms
allow-list in proposal 02. The script is wired into `bun run check`
(per-package + root) and into the permanent unit test at
`tests/unit/atomic-layers.test.ts`.

**Alternatives considered:**

- Rely on Biome / ESLint rules → rejected. Biome does not have a
  stable rule for "this file may import from library X or Y", and
  writing a custom rule adds a Biome plugin. A standalone Bun-runnable
  script is consistent with the existing
  `check-atomic-layers`-style gates
  (`heroui-design-system-replica:check`,
  `no-ladle-replica-in-production`).
- Encode the rules as TypeScript path mappings → rejected. The repo
  already pins `@unveiled/*` aliases; layering on top of that is more
  friction than value.
- Apply `R-ORGANISMS-NO-HEROUI` only in proposal 04 → rejected. The
  rule needs to be in force when proposal 04 lands; laying it down
  in proposal 03 means proposals 04/05 inherit a passing rule as a
  precondition.

### D6 — Barrel keeps call sites compiling via flat re-export + Molecules namespace

The new `packages/design-system/src/index.ts` has two molecule
exports:

1. A flat re-export of every molecule from
   `./molecules/<molecule>` (temporary, removed in proposal 07/08).
   Existing call sites
   (`import { Field } from "@unveiled/design-system"`,
   `import { Toast } from "@unveiled/design-system"`, etc.) keep
   compiling.
2. A `Molecules` namespace
   (`export { Molecules } from "./molecules"`) for new code that wants
   the layered access pattern.

The atoms flat re-export and `Atoms` namespace from proposal 02 are
unchanged.

**Alternatives considered:**

- Break call sites by removing the flat re-export in this proposal
  → rejected. The migration of every consumer (potentially hundreds
  of imports across app and landing) is too large to bundle with the
  molecules-layer refactor.
- Move the molecules into `atoms/` (since `SelectInput` and `Field`
  wrap input-like atoms) → rejected. The composition is the
  molecule's whole reason for existing; moving it into `atoms/`
  would defeat the layer boundary.

### D7 — Forward-looking `R-ORGANISMS-NO-HEROUI` rule active now

The `R-ORGANISMS-NO-HEROUI` rule is intentionally forward-looking.
This proposal lays it down even though no organism exists yet — by
the time proposal 04 lands, the rule is already in force and
proposal 04's tasks include "the gate already passes" as a
precondition. The rule covers `organisms/`, `layouts/`, and `pages/`
because those three layers share the same "compose atoms, not HeroUI"
contract.

**Alternatives considered:**

- Apply the rule only in proposal 04 → rejected. The rule needs to be
  in force before any organism file lands; if the rule is added in
  proposal 04, the gate would have nothing to walk in the meantime
  and the rule would be invisible.
- Apply the rule only to `organisms/` and add `R-PAGES-NO-HEROUI`
  later → rejected. `organisms/`, `layouts/`, and `pages/` are all
  "higher than molecules" and the same rule applies to all three.

## Risks / Trade-offs

- [8 molecules moved in one PR] → The flat re-export in `index.ts`
  keeps every consumer compiling. The gate's
  `R-MOLECULES-NO-HEROUI` rule is new, so a contributor who added a
  molecule that imports HeroUI before this proposal lands would have
  their PR fail. The migration is trivial — every existing molecule
  can be rewritten as a composition of dedicated atoms (proposal 03
  does this for `toast`, `drawer`, `modal`, `menu`).
- [Gate enforces molecule rules at the file level, not the call-site
  level] → The gate asserts "no molecule file imports from
  `@nextui-org/react`", which catches accidental HeroUI imports inside
  molecules. It does not prevent consumers from importing HeroUI
  directly. That is intentional: consumers (app, landing) are allowed
  to import HeroUI for one-off compositions that the design system
  does not yet cover; the design system's job is to be HeroUI-only, not
  to forbid HeroUI elsewhere.
- [`Field` type tightening may break a consumer that passes a
  non-input element] → Mitigated by `bun run --filter '*' typecheck`
  as part of `bun run check`. The only current `Field` users in
  `packages/app` and `packages/landing` pass `TextInput`, `TextArea`,
  or `SelectInput` atoms; the narrowed type is satisfied.
- [No `Icon` molecule means app/landing consumers must inline
  `<svg>`] → The inline-`<svg>` convention is owned by proposals
  07/08. This proposal only adds the `// source: lucide-static`
  comment to the 5 existing inlines in `app-shell.tsx`; full
  migration of every other inlined icon is deferred.
- [`R-ORGANISMS-NO-HEROUI` rule active in 03 with no organism to
  walk] → The rule still passes because the `organisms/`, `layouts/`,
  and `pages/` directories are empty (single `index.ts` re-exporting
  nothing). The rule becomes load-bearing in proposal 04.
- [Gate script complexity grows over time] → The gate is a ~250-line
  Bun-runnable TypeScript script that follows the pattern of the
  existing `check-atomic-layers` family. Future iterations can add
  new rules (e.g. "no inline `style={...}` in molecules") without
  rewriting the gate.
- [Layer promotion (`Field` is a molecule, not an atom) is a
  design-system-level decision] → The gate enforces the current
  layer classification. If a contributor later wants to demote a
  molecule back to an atom (or vice versa), they must move the file
  between `atoms/` and `molecules/` and update the barrel; the gate
  will reject the misclassified file.

## Migration Plan

This change ships in a single PR:

1. Promote `Field`, `StatePanel`, `StatPanel`, `SelectInput` from
   `packages/design-system/src/unveiled-primitives.tsx` into
   `packages/design-system/src/molecules/<molecule>/<molecule>.tsx`.
   Tighten the `Field` `children` prop type.
2. Move `toast.tsx`, `drawer.tsx`, `modal.tsx`, `menu.tsx` from
   `packages/design-system/src/` into
   `packages/design-system/src/molecules/<molecule>/`. Split `Menu`
   into `menu.tsx` + `menu-trigger.tsx` + `menu-content.tsx` +
   `menu-item.tsx` + `menu-section.tsx`.
3. Generate `<molecule>.types.ts` for each of the 8 molecules
   (where prop types are non-trivial).
4. Generate `<molecule>.ladle.tsx` for each of the 8 molecules.
5. Update `packages/design-system/src/index.ts` to add the
   `Molecules` namespace export AND keep the flat re-exports from the
   legacy paths.
6. Add the 5 new rules to
   `packages/design-system/scripts/check-atomic-layers.ts`.
7. Update `tests/unit/atomic-layers.test.ts` to assert the new
   rules pass.
8. Add a `// source: lucide-static` comment to each of the 5
   inline `<svg>` blocks in
   `packages/app/src/components/unveiled/app-shell.tsx`.
9. Run `bun run check`, `bun run --filter '*' typecheck`,
   `bun run ladle:coverage`, `bun run test:unit`,
   `bun run check:atomic-layers`.

Rollback strategy: revert the PR. The molecules refactor is a no-op
for consumers (flat re-export preserves call sites) and the gate
fails CI if the source is rolled back to a non-compliant state, so
rollback is safe.

## Open Questions

- Should the `Molecules` namespace expose types as well as values?
  **Decision: yes**, via `export * from "./molecules"` (values) and
  `export type * from "./molecules"` (types) under the namespace, so
  consumers can write `type FieldProps = Molecules.FieldProps`.
- Should the gate's `R-MOLECULES-NO-HEROUI` rule allow HeroUI
  pass-through re-exports (e.g. a hypothetical molecule that
  re-exports `HeroUIAlert`)? **Decision: no.** The whole point of
  the rule is that molecules compose atoms, not HeroUI. A molecule
  that needs a HeroUI primitive that no atom exposes MUST grow a
  new atom first; this rule is deliberate and not relaxed in any
  proposal.
- Should `Drawer` / `Modal` / `Menu` / `Toast` grow dedicated atoms
  (e.g. `DrawerOverlay`, `ModalBody`, `MenuItemPrimitive`,
  `ToastContainer`) in proposal 03, or should the molecules import
  HeroUI directly? **Decision: grow dedicated atoms first.** The
  `R-MOLECULES-NO-HEROUI` rule means the molecules cannot import
  HeroUI directly; if the molecule needs a HeroUI primitive that no
  atom exposes, the molecule MUST grow a new atom first. This
  proposal adds the atoms as needed (`menu-trigger`, `menu-content`,
  `menu-item`, `menu-section` are added under `atoms/` so the
  `Menu` molecule can compose them).
- Does the `// source: lucide-static` comment need to be a machine
  check, or is it a convention enforced by code review? **Decision:
  convention.** Proposals 07/08 own the full inline-`<svg>`
  convention; this proposal only adds the comment to the 5 existing
  inlines in `app-shell.tsx`. A gate rule for the comment is out of
  scope here.
