## Why

The team needs a decision-grade visual of "what the Unveiled design system would look like in Mantine 9" **before** any production migration begins. The shadcn/ui → Hero UI effort was abandoned because Hero UI's React 19 story is still pre-stable and shadcn/ui is a copy-paste stack that does not give us selector discipline. Mantine 9 is a better candidate, but we want to see it next to the current surface before we commit.

This change is a **proof, not a migration.** It produces a brand-faithful Mantine 9 rendering of every primitive in `src/components/ui/` and ships it as a Ladle-only design system. Nothing in the production app changes. The next change uses the replica as the visual contract to decide whether to replace the shadcn surface.

## What Changes

- Add `@mantine/core`, `@mantine/hooks`, and `@mantine/notifications` as `devDependencies` so the replica can render under Ladle without leaking into the production bundle.
- Inventory every primitive in `src/components/ui/` (and every production consumer) at `.development-plan/10-iteration/features/improvements/mantine-design-system-replica/INVENTORY.md`, recording exported names, props, variants/sizes, and the brand tokens each surface consumes.
- Build a brand-faithful Mantine replica in `src/components/ui/mantine-replica/`, consisting of:
  - A `theme.ts` that wires every color in `design-tokens.json` (yellow, cream, grey, dark, white, error, success) into Mantine color tuples and registers `theme.components` overrides for `Button`, `Badge`, `TextInput`, `Textarea`, `Select`, `Card`, `Paper`, `Divider`, `Modal`, `Drawer`, `Popover`, `Tabs`, `Menu`, and `Notification` to apply the 4px hard border, uppercase tracking, and the hard `4px 4px 0 0` shadow.
  - A `<MantineReplicaProvider>` that mounts `MantineProvider` with that theme, consumed only by Ladle stories in the same folder.
  - A `cn.ts` helper that re-exports `cn` from `@/lib/utils` and adds a `withMantine` merge helper, intended for adoption into `src/lib/utils.ts` by the next change.
  - One `Mantine<OriginalName>.tsx` wrapper per inventoried surface, mapping production variant/size names to Mantine equivalents and forwarding `loading` / `asChild` where relevant.
  - Co-located `Mantine<Name>.ladle.tsx` files that export one Ladle story per `variant` × `size` × `state` combination, mirroring the production matrix.
  - A `design-system-overview.ladle.tsx` that lays out every `Mantine<Name>` primitive on a single Ladle page with a `<main role="main">`, a `<h1>` heading "Unveiled Design System (Mantine replica)", and a `<nav>` of anchor links — the visual contract the team will use to decide on adoption.
  - A `replica-not-imported.test.ts` that walks the production import graph and asserts the replica is never reached.
- Add `bun run design-system-replica:check` and a `bun run check:replica` umbrella that asserts co-location, theme coverage, `ladle:coverage`, and `bun run check`.
- **No** changes to existing files under `src/components/ui/`, `src/components/unveiled/`, `src/components/payments/`, `src/components/providers/`, `src/pages/`, `src/layouts/`, `design-tokens.json`, `AGENTS.md`, `docs/guidelines.md`, `CONTRIBUTING.md`, `architecture/model.ts`, or any capability spec other than the new `design-system-replica` spec.

## Capabilities

### New Capabilities

- `design-system-replica`: a brand-faithful Mantine 9 rendering of every primitive in `src/components/ui/`, viewable in Ladle and not imported by the production app. Enforces Ladle-only isolation, replica coverage of the inventory, brand-token-driven theming, the look-and-feel parity baseline, and the design-system overview as the Ladle landing page.

### Modified Capabilities

- _None._ The production `app-shell` capability is unchanged in this change. The umbrella #32 spec and the abandoned #34 spec are annotated in a follow-up commit to point at the new replica change as the source of truth for the visual decision; this change does not edit them.

## Impact

- **New files:**
  - `src/components/ui/mantine-replica/theme.ts`
  - `src/components/ui/mantine-replica/provider.tsx`
  - `src/components/ui/mantine-replica/cn.ts`
  - `src/components/ui/mantine-replica/Mantine<Name>.tsx` for every inventoried surface (`MantineButton`, `MantinePanel`, `MantineCard`, `MantineBadge`, `MantineTextInput`, `MantineSelectInput`, `MantineTextArea`, `MantineDivider`, `MantineStatPanel`, `MantineField`, `MantineStatePanel`, `MantineTableShell`, `MantineTableRow`, `MantineModal`, `MantineDrawer`, `MantineTabs`, `MantineMenu`, `MantineNotification`)
  - `src/components/ui/mantine-replica/Mantine<Name>.ladle.tsx` for every `Mantine<Name>.tsx`
  - `src/components/ui/mantine-replica/design-system-overview.ladle.tsx`
  - `src/components/ui/mantine-replica/replica-not-imported.test.ts`
  - `.development-plan/10-iteration/features/improvements/mantine-design-system-replica/INVENTORY.md`
  - `openspec/changes/mantine-design-system-replica/{proposal.md, design.md, tasks.md, specs/design-system-replica/spec.md}`
  - `openspec/specs/design-system-replica/spec.md`
- **Modified files:** `package.json` only — adds the three `@mantine/*` dev dependencies, the `design-system-replica:check` script, and the `check:replica` umbrella script.
- **Removed files:** none.
- **Dependencies changed:** `@mantine/core`, `@mantine/hooks`, and `@mantine/notifications` are added under `devDependencies` at the versions pinned in `package.json`.
- **Risks:** minimal. The replica folder is co-located under `src/components/ui/` and could be accidentally imported by future code; the `// @ladle-only` header, the import-graph test, and the new `design-system-replica:check` script guard against that.
