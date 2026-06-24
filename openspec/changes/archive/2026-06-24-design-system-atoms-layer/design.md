## Context

`packages/design-system/src/` is a flat dump of 9 single files plus a 414-line
`unveiled-primitives.tsx` that re-exports 14 atoms. The atomic-design mental
model the iteration-13 prompt asked for is not reflected on disk: there is no
`atoms/`, `molecules/`, `organisms/`, `layouts/`, or `pages/` directory, no
per-atom folder convention, no `index.ts` per layer, and no enforcement that
ties atoms to HeroUI. Six components violate the prompt's strict "all
components based on HeroUI" rule (`Button.asChild` via `@radix-ui/react-slot`,
`Badge`, `Panel`, `TableShell`, `TableRow`, `SafeImage`). The current
`heroui-design-system-replica:check` gate is scoped to the replica folder
only; nothing enforces the HeroUI-only rule for the production atoms. The
existing `design-system-package` capability spec describes "preserve the
public prop surface" but has no requirement that says "atoms are HeroUI
wrappers" or that names the removed components.

This design establishes the atoms layer (proposal 02 of iteration 13),
codifies the prompt's strict reading, removes the six violators, and ships a
gate that future atoms cannot bypass.

## Goals / Non-Goals

**Goals:**

- Move every surviving atom (`Button`, `Card`, `Divider`, `Tabs`/`Tab`,
  `TextInput`, `TextArea`, `SelectItem`, the HeroUI Table pass-through
  re-exports) into `packages/design-system/src/atoms/<atom>/` with the
  canonical 4-file layout (`<atom>.tsx`, `<atom>.types.ts` only when the
  prop types are non-trivial, `<atom>.ladle.tsx`, `<atom>.test.tsx` only
  when the atom has non-trivial logic).
- Remove `Button.asChild`, `Badge`, `Panel`, `TableShell`, `TableRow`,
  `SafeImage`, and the `@radix-ui/react-slot` dependency from the design
  system. Document the HeroUI / plain-element replacement for each.
- Rewrite `packages/design-system/src/index.ts` so it has a flat re-export of
  every atom (temporary, removed in proposal 07) plus an `Atoms` namespace,
  and so it keeps re-exporting every legacy molecule (`Drawer`, `Menu*`,
  `Modal`, `Toast`, `Field`, `StatePanel`, `StatPanel`, `SelectInput`) from
  their current paths during the migration window.
- Create empty `molecules/`, `organisms/`, `layouts/`, `pages/` directories
  under `packages/design-system/src/` so the layer boundaries are visible.
- Ship `packages/design-system/scripts/check-atomic-layers.ts` and wire it
  into `bun run check` (root + per-package) so the HeroUI-only rule is
  enforceable in CI.
- Ship a real atoms-overview Ladle story at
  `packages/design-system/src/atoms/__overview__/overview.ladle.tsx` and
  leave the legacy replica overview in place until proposal 11 deletes it.
- Keep call sites working: every consumer in `packages/app/src/**` and
  `packages/landing/src/**` MUST continue to compile and run after this
  change lands. The migration of removed-component consumers is owned by
  proposals 07 and 08. This proposal ships a legacy shim
  (`src/_legacy.tsx`) that re-exports the five removed primitives during the
  migration window and migrates 5 in-package `<Button asChild>` consumers
  to styled `<a>` elements so the design system can drop the prop.

**Non-Goals:**

- Promoting molecules (`Field`, `StatePanel`, `StatPanel`, `SelectInput`,
  `Toast`, `Drawer`, `Modal`, `Menu*`) into `molecules/`. That is proposal 03.
- Removing the `heroui-replica/` folder. Proposal 11 retires the replica;
  proposal 02 only adds the new atom stories alongside it.
- Changing the visual output, class names, or HeroUI composition of any
  surviving atom. This is a refactor, not a redesign.
- Removing the flat re-export in `index.ts`. Proposal 07 owns that deletion.
- Migrating every consumer of `Panel`, `Badge`, `TableShell`, `TableRow`,
  `SafeImage` in `packages/app` and `packages/landing`. Proposals 07 and 08
  own consumer migration.

## Decisions

### D1 — One folder per atom with the canonical 4-file layout

The atoms folder convention is fixed: `<atom>.tsx`, `<atom>.types.ts` (only
if the atom has non-trivial prop types), `<atom>.ladle.tsx` (at least one
default story and at least one variant story), `<atom>.test.tsx` (only if
the atom has non-trivial logic). The naming is `kebab-case` per the
contributor guidelines. This matches the HeroUI documentation style and
makes the gate's companion-file check trivially enforceable.

**Alternatives considered:**

- Co-located stories only (no `.test.tsx`) → rejected because the gate needs
  a second companion option for atoms whose behaviour is best asserted via
  unit tests (e.g. `TextInput` value coercion). The 4-file layout gives
  contributors a choice between Ladle stories and unit tests as the "demo
  obligation".
- Single flat `atoms.tsx` file with all atoms → rejected because it is
  exactly the failure mode that created the current 414-line
  `unveiled-primitives.tsx` mega-file. One folder per atom is the only way
  the gate can isolate which atom broke the rule.

### D2 — Strict HeroUI-only reading of the prompt, with documented removals

The iteration-13 prompt reads: "I want to have all components based on
HeroUI, only in extreme cases to design new ones." We interpret "extreme
cases" narrowly: HeroUI is the only UI base library; if HeroUI has no
equivalent for a primitive the package wants, the primitive is REMOVED and
consumers fall back to a HeroUI primitive or a plain element. The 6
components that violate this rule today (`Button.asChild`, `Badge`,
`Panel`, `TableShell`, `TableRow`, `SafeImage`) are removed in this
proposal. The migration of every consumer is deferred to proposals 07 and
08.

To keep the migration window tractable, the 5 removed primitives
(`Badge`, `Panel`, `TableShell`, `TableRow`, `SafeImage`) are re-exported
from a new `packages/design-system/src/_legacy.tsx` shim for the duration
of the window. Proposals 07 and 08 delete the shim. This is documented
as a temporary bridge in the spec and the proposal.

**Alternatives considered:**

- Allow "documented extreme case" exceptions for plain-React components →
  rejected. The prompt does not give plain-React atoms an exemption; the
  whole point is component-driven development against HeroUI primitives.
  Adding exceptions creates a slippery slope and makes the gate a
  negotiation rather than a check.
- Replace `SafeImage` with a molecule that wraps HeroUI `Image` →
  rejected. HeroUI `Image` exists but the current `SafeImage` is a
  plain-`<img>` with an `onError` fallback; if we keep the fallback, we
  introduce a plain-React atom. If we drop the fallback, we drop the
  component's value. Removing the component and using a plain `<img>`
  with `onError` at the call site is the cleanest path.
- Replace `Badge` / `Panel` / `TableShell` / `TableRow` with
  design-system atoms that wrap HeroUI primitives → rejected. We do have
  HeroUI equivalents (`HeroUIBadge`, `HeroUICard`, `HeroUITable`,
  `HeroUITableRow`); consumers import them directly. Adding a
  design-system layer between the consumer and HeroUI is exactly the kind
  of plain-React atom the prompt forbids.

### D3 — Gate script enforces the HeroUI-only rule

The new gate `packages/design-system/scripts/check-atomic-layers.ts` walks
every `.tsx` under `packages/design-system/src/{atoms,molecules,organisms,layouts,pages}/`,
parses each file's imports (using the same regex-based scanner used by the
existing `heroui-design-system-replica:check` and `no-ladle-replica-in-production`
scripts), and rejects:

- atoms importing from a higher layer (`./molecules/...`,
  `./organisms/...`, `./layouts/...`, `./pages/...`);
- atoms importing from `./heroui-replica/...`;
- atoms importing from a non-HeroUI third-party UI library
  (`@radix-ui/*`, `@headlessui/*`, `react-aria`, `@mui/*`,
  `@chakra-ui/*`);
- atoms that do NOT import from `@nextui-org/react` (or are not a HeroUI
  pass-through re-export);
- higher layers importing from `@nextui-org/react` or `@heroui/*`
  directly (atoms-only);
- atoms whose sibling `<atom>.ladle.tsx` or `<atom>.test.tsx` companion
  is missing.

The script is wired into `packages/design-system/package.json` as
`scripts.check:atomic-layers`, into the root `package.json` `check` script
as a step, and into the permanent unit suite at
`tests/unit/atomic-layers.test.ts`.

**Alternatives considered:**

- Rely on ESLint / Biome rules → rejected. Biome does not have a stable
  rule for "this file must import from library X or Y", and writing a
  custom rule adds a Biome plugin. A standalone Bun-runnable script is
  consistent with the existing `check-atomic-layers`-style gates
  (`heroui-design-system-replica:check`, `no-ladle-replica-in-production`).
- Use TypeScript path-mapping to forbid imports → rejected. The repo
  already pins `@unveiled/*` aliases; layering on top of that is more
  friction than value.

### D4 — Barrel keeps call sites compiling via flat re-export + Atoms namespace

The new `index.ts` has two exports:

1. A flat re-export of every atom from `./atoms/<atom>` (temporary,
   removed in proposal 07). Existing call sites
   (`import { Button } from "@unveiled/design-system"`) keep compiling.
2. An `Atoms` namespace (`export { Atoms } from "./atoms"`) for new code
   that wants the layered access pattern.

The legacy molecules (`Drawer`, `Menu*`, `Modal`, `Toast`, `Field`,
`StatePanel`, `StatPanel`, `SelectInput`) are re-exported from their
current paths in `src/` (not from `atoms/`) so proposal 03 can move them
into `molecules/` without touching this proposal.

The 5 removed primitives (`Badge`, `Panel`, `TableShell`, `TableRow`,
`SafeImage`) are re-exported from `src/_legacy.tsx` for the migration
window. Proposals 07 and 08 delete the shim.

**Alternatives considered:**

- Break call sites by removing the flat re-export in this proposal →
  rejected. The migration of every consumer (potentially hundreds of
  imports) is too large to bundle with the atoms-layer refactor.
- Move the legacy molecules into `atoms/` (since `SelectItem` and
  `TextInput` are atomic) → rejected. Proposal 03 owns the promotion of
  `SelectInput` to molecule and the demotion of `Panel` / `TextArea` /
  `TextInput` is unnecessary churn.

### D5 — Empty layer directories created up front

`packages/design-system/src/{molecules,organisms,layouts,pages}/` are
created as empty directories (with a one-line `index.ts` re-exporting
nothing) so the layer boundaries are visible in the tree on day 1. The
gate script's allow-list only takes effect after these directories exist;
without them, the gate would have nothing to walk in higher layers and
would silently pass.

**Alternatives considered:**

- Create the layer directories only when their proposal lands → rejected.
  The gate needs to walk higher layers to enforce "molecules may not
  import HeroUI directly". If the directory does not exist, the gate has
  nothing to walk and the rule is invisible.

### D6 — `@radix-ui/react-slot` removed entirely (no allow-list)

The `@radix-ui/react-slot` dependency is removed from
`packages/app/package.json` and from the root `bun.lock`. No
allow-list entry, no documented exception. The gate's third-party UI
dependency check covers all third-party UI libraries; the dependency is
dropped as part of the `Button` refactor. The HeroUI / class-variance /
clsx / tailwind-merge / react / react-dom deps are now declared by
`@unveiled/design-system` (previously the design-system package relied
on hoisted resolution from `app/package.json`).

**Alternatives considered:**

- Keep `@radix-ui/react-slot` for one "extreme case" → rejected. The
  prompt's "extreme cases" wording does not cover third-party UI
  dependencies; allowing Radix would invite the same justification for
  Headless UI, React Aria, etc.

## Risks / Trade-offs

- [Six components removed without consumer migration in this proposal] →
  The flat re-export in `index.ts` plus the `_legacy.tsx` shim keep every
  consumer compiling today. Proposals 07 and 08 own the consumer
  migration; until they land, those names are reachable through the shim.
- [Gate enforces HeroUI-only at the file level, not the call-site level] →
  The gate asserts "every atom imports from `@nextui-org/react`", which
  catches accidental third-party UI imports inside atoms. It does not
  prevent consumers from importing HeroUI directly. That is intentional:
  consumers (app, landing) are allowed to import HeroUI for one-off
  compositions that the design system does not yet cover; the design
  system's job is to be HeroUI-only, not to forbid HeroUI elsewhere.
- [Atom stories may overlap with replica stories] → The new
  `atoms/<atom>/<atom>.ladle.tsx` stories duplicate the visual stories in
  `heroui-replica/` for now. Ladle renders both; the gate only asserts
  companion-file presence. Proposal 11 retires the replica.
- [`@radix-ui/react-slot` removal may break a transitive consumer outside
  the design-system package] → Mitigated by `bun install` after the
  removal and `bun run --filter '*' typecheck` as part of `bun run check`.
  No other package depends on `@radix-ui/react-slot` directly; the only
  consumer is `packages/design-system/src/button.tsx` (now removed).
- [Gate script complexity grows over time] → The gate is a ~150-line
  Bun-runnable TypeScript script that follows the pattern of the existing
  `check-atomic-layers` family. Future iterations can add new rules
  (e.g. "no inline `style={...}` in atoms") without rewriting the gate.
- [Layer promotion (TextInput → molecule?) is deferred] → The gate
  enforces the current layer classification. If a contributor later wants
  to promote `TextInput` to a molecule, they must move the file out of
  `atoms/` and update the barrel; the gate will reject the new molecule's
  atom-level imports.

## Migration Plan

This change ships in a single PR:

1. Create the `atoms/<atom>/` folders with empty placeholders.
2. Move / split the surviving atoms into their new files (no visual change).
3. Delete `Button.asChild`, `Badge`, `Panel`, `TableShell`, `TableRow`,
   `SafeImage` (the in-package definition; `safe-image.tsx`,
   `safe-image.test.tsx` files are deleted; `Panel`, `Badge`,
   `TableShell`, `TableRow`, `SafeImage` are kept in a `src/_legacy.tsx`
   shim for the migration window).
4. Remove `@radix-ui/react-slot` from `packages/app/package.json` and
   regenerate `bun.lock`.
5. Rewrite `packages/design-system/src/index.ts` (flat re-export + Atoms
   namespace + legacy molecule re-exports + legacy shim re-exports).
6. Migrate 5 in-package `<Button asChild>` consumers (3 in
   `packages/app`, 2 in `packages/landing`) to styled `<a>` elements.
7. Create empty `molecules/`, `organisms/`, `layouts/`, `pages/` directories.
8. Ship `packages/design-system/scripts/check-atomic-layers.ts` and wire
   it into `bun run check` (per-package + root).
9. Ship `tests/unit/atomic-layers.test.ts` permanent unit test.
10. Ship `packages/design-system/src/atoms/__overview__/overview.ladle.tsx`.
11. Run `bun run check`, `bun run --filter '*' typecheck`,
    `bun run ladle:coverage`, `bun run test:unit`, and
    `bun run test:e2e` (against the port-4320 proxy).

Rollback strategy: revert the PR. The atoms refactor is a no-op for
consumers (flat re-export + legacy shim preserves call sites) and the gate
fails CI if the source is rolled back to a non-compliant state, so
rollback is safe.

## Open Questions

- Should the gate's "atom must import from `@nextui-org/react`" rule allow
  HeroUI pass-through re-exports (e.g. the `table-primitive` folder that
  re-exports `HeroUITable` etc.)? **Decision: yes**, via a single
  `// @atoms-re-export` opt-out marker comment that the gate recognises, so
  the Table primitives can ship under `atoms/` without each one re-importing
  `@nextui-org/react`. Documented in the gate script.
- Should the `Atoms` namespace expose types as well as values? **Decision:
  yes**, via `export * from "./atoms"` (values) and `export type * from
  "./atoms"` (types) under the namespace, so consumers can write
  `type ButtonProps = Atoms.ButtonProps`.
- Does proposal 03 want `TextInput` and `TextArea` promoted to molecules
  (because they wrap HeroUI inputs with `onValueChange` coercion logic)?
  **Decision: deferred to proposal 03.** This proposal keeps them in
  `atoms/` per the existing classification in the plan. If proposal 03
  promotes them, the gate's "atoms may not import from higher layers" rule
  already handles the move (the gate has nothing to update; only the file
  path and the barrel change).