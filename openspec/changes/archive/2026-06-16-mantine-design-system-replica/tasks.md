## 1. Inventory the production surface

- [x] 1.1 Walk every file under `src/components/ui/` and list exported names, props, variants, and sizes
- [x] 1.2 Walk every file under `src/components/`, `src/pages/`, and `src/layouts/` that imports from `@/components/ui` and record the surface it consumes
- [x] 1.3 Record brand tokens consumed per surface (yellow, cream, grey, dark, white, error, success, `unveiled-shadow`)
- [x] 1.4 Write `INVENTORY.md` at `.development-plan/10-iteration/features/improvements/mantine-design-system-replica/INVENTORY.md` with one row per surface and a `proves` checkbox
- [x] 2.1 Add `@mantine/core`, `@mantine/hooks`, and `@mantine/notifications` to `package.json` under `devDependencies`
- [x] 2.2 Pin to the versions the next change will move to `dependencies`
- [x] 2.3 Add a `peerDependency` declaration comment in the new code noting the next change promotes these to `dependencies`
- [x] 2.4 Run `bun install` and confirm the lockfile is in sync
- [x] 3.1 Create `src/components/ui/mantine-replica/theme.ts` with `unveiledMantineTheme` from `createTheme`
- [x] 3.2 Wire every color in `design-tokens.json` into `theme.colors` (10-shade tuples) and `theme.other` (singletons) without introducing a new hex literal
- [x] 3.3 Set `defaultRadius: 0`, `black: theme.other.brandDark`, `white: theme.other.brandWhite`, `fontFamily` from `src/styles/global.css`
- [x] 3.4 Register `theme.components` overrides for `Button`, `Badge`, `TextInput`, `Textarea`, `Select`, `Card`, `Paper`, `Divider`, `Modal`, `Drawer`, `Popover`, `Tabs`, `Menu`, `Notification` (4px solid brand border, uppercase tracking, hard `4px 4px 0 0` shadow on hover/active, `bg-brand-yellow / text-brand-dark` active state)
- [x] 3.5 Create `src/components/ui/mantine-replica/provider.tsx` exporting `<MantineReplicaProvider>` that wraps `MantineProvider` with `unveiledMantineTheme`
- [x] 3.6 Create `src/components/ui/mantine-replica/cn.ts` re-exporting `cn` from `@/lib/utils` and adding the `withMantine(props, style, classNames)` helper
- [x] 3.7 Add a `// @ladle-only` header to `theme.ts`, `provider.tsx`, and `cn.ts`

## 4. Build the Mantine primitive wrappers

- [x] 4.1 Create `MantineButton.tsx` wrapping Mantine `Button`, re-exporting the production variant/size names and forwarding `loading` and `asChild`
- [x] 4.2 Create `MantinePanel.tsx` wrapping Mantine `Paper` with the 4px border + hard shadow override
- [x] 4.3 Create `MantineCard.tsx` wrapping Mantine `Card` with an `interactive` prop forwarding to `classNames.root`
- [x] 4.4 Create `MantineBadge.tsx` wrapping Mantine `Badge` with the uppercase tracking override
- [x] 4.5 Create `MantineTextInput.tsx`, `MantineSelectInput.tsx`, `MantineTextArea.tsx` wrapping Mantine `TextInput`, `Select`, `Textarea` with the brand override
- [x] 4.6 Create `MantineDivider.tsx` wrapping Mantine `Divider` with `color: brand.dark`, `size: 4`
- [x] 4.7 Create `MantineStatPanel.tsx`, `MantineField.tsx`, `MantineStatePanel.tsx`, `MantineTableShell.tsx`, `MantineTableRow.tsx` keeping the current shape and swapping the inner `Card` / `Panel` to `MantineCard` / `MantinePanel`
- [x] 4.8 Create `MantineModal.tsx`, `MantineDrawer.tsx`, `MantineTabs.tsx`, `MantineMenu.tsx`, `MantineNotification.tsx` as new Mantine wrappers with the brand override
- [x] 4.9 Add a `// @ladle-only` header to every `Mantine<Name>.tsx`

## 5. Ship the Ladle stories

- [x] 5.1 Create `MantineButton.ladle.tsx` exporting `Default`, `Primary`, `Secondary`, `Yellow`, `Active`, `Copied`, `Destructive`, `Ghost`, `Outline`, `Muted`, `Link`, `Loading`, `Disabled`, `AsChild`
- [x] 5.2 Create `MantinePanel.ladle.tsx` exporting `White`, `Yellow`, `Cream`, `Grey`, `Dark`, `WithShadow`, `WithoutShadow`, `AsForm`
- [x] 5.3 Create `MantineBadge.ladle.tsx` exporting one story per `tone` value
- [x] 5.4 Create `MantineCard.ladle.tsx` exporting `Static`, `Interactive`
- [x] 5.5 Create `MantineTextInput.ladle.tsx` exporting `Empty`, `Filled`, `Error`, `Helper`, `Disabled`
- [x] 5.6 Create `MantineSelect.ladle.tsx` exporting `Closed`, `Open`, `Selected`, `Disabled`
- [x] 5.7 Create `MantineModal.ladle.tsx` exporting `Small`, `Medium`, `Large`, `WithForm`, `WithFooter`
- [x] 5.8 Create `MantineDrawer.ladle.tsx` exporting `Left`, `Right`, `WithForm`
- [x] 5.9 Create `MantineTabs.ladle.tsx` exporting `Horizontal`, `Vertical`
- [x] 5.10 Create `MantineMenu.ladle.tsx` exporting `Closed`, `Open`, `Nested`
- [x] 5.11 Create `MantineNotification.ladle.tsx` exporting `Info`, `Success`, `Error`, `Warning`
- [x] 5.12 Create `MantineStatePanel.ladle.tsx` exporting `Empty`, `Loading`, `Error`, `Success`
- [x] 5.13 Create `MantineTableShell.ladle.tsx` exporting `Empty`, `Populated`
- [x] 5.14 Create `MantineStatPanel.ladle.tsx` exporting `Default`, `WithCaption`
- [x] 5.15 Create `MantineField.ladle.tsx` exporting `Empty`, `WithError`, `WithHelper`
- [x] 5.16 Render every story on a `bg-brand-grey` background inside a container that applies the `unveiled-shadow` token
- [x] 5.17 Set `parameters.ladle.skipCoverage = true` on every replica `Mantine<Name>.ladle.tsx` (replica stories are design proofs with no gherkin scenarios; `design-system-replica:check` is the coverage gate)

## 6. Ship the design-system overview

- [x] 6.1 Create `src/components/ui/mantine-replica/design-system-overview.ladle.tsx` rendering a `<main role="main">` with a `<h1>` heading "Unveiled Design System (Mantine replica)"
- [x] 6.2 Add a `<nav>` of anchor links, one per `Mantine<Name>` primitive
- [x] 6.3 Render every `Mantine<Name>` primitive on the page so the visual contract is exhaustive
- [x] 6.4 Verify `bun run ladle build` produces `public/ladle/mantine-replica--design-system-overview`

## 7. Add the import-graph isolation test

- [x] 7.1 Create `src/components/ui/mantine-replica/replica-not-imported.test.ts`
- [x] 7.2 Walk the import graph from the production entry points (`src/pages/`, `src/components/`, `src/layouts/`) and assert no module under `src/components/ui/mantine-replica/` is reached
- [x] 7.3 Run the test under `bun run check` and confirm it passes

## 8. Add the design-system replica check script

- [x] 8.1 Add `design-system-replica:check` script to `package.json`
- [x] 8.2 Implement the check: every `Mantine<Name>.tsx` has a co-located `Mantine<Name>.ladle.tsx` file
- [x] 8.3 Implement the check: every variant registered in `theme.ts` is exercised by at least one Ladle story
- [x] 8.4 Implement the check: every `Mantine<Name>.tsx` has a `// @ladle-only` header
- [x] 8.5 Implement the check: no hex literal (`/#[0-9a-fA-F]{3,8}\b/`) is introduced under `src/components/ui/mantine-replica/`
- [x] 8.6 Implement the check: every `Mantine<Name>.tsx` appears in `design-system-overview.ladle.tsx`
- [x] 8.7 Implement the check: `INVENTORY.md` lists every primitive in `src/components/ui/` outside the replica folder
- [x] 8.8 Add `check:replica` umbrella script to `package.json` chaining `design-system-replica:check` + `ladle:coverage` + `check`
- [x] 8.9 Verify the `ladle:coverage` walker descends into `src/components/ui/mantine-replica/` and adjust `tests/ladle/coverage.ts` if needed

## 9. Verify the production app is untouched

- [x] 9.1 Confirm no file under `src/components/ui/` outside the replica folder is modified
- [x] 9.2 Confirm no file under `src/components/unveiled/`, `src/components/payments/`, `src/components/providers/`, `src/pages/`, or `src/layouts/` is modified
- [x] 9.3 Confirm `design-tokens.json` is unchanged
- [x] 9.4 Confirm `AGENTS.md`, `docs/guidelines.md`, `CONTRIBUTING.md`, `architecture/model.ts`, and `openspec/specs/app-shell/spec.md` are unchanged
- [x] 9.5 Confirm `package.json` only gains the three `@mantine/*` dev dependencies and the two new scripts
- [x] 10.1 Run `bun run design-system-replica:check` and confirm it passes
- [x] 10.2 Run `bun run ladle:coverage` and confirm it lists every `Mantine<Name>.ladle.tsx` with no drift
- [x] 10.3 Run `bun run ladle build` and confirm `public/ladle/mantine-replica--design-system-overview` is present
- [x] 10.4 Run `bun run test:ladle` and confirm the gherkin scenarios that reference a `Mantine<Name>` story pass
- [x] 10.5 Run `bun run check` and confirm it passes
- [x] 10.6 Run `bun run dev` and confirm the production app boots with the replica unreachable and the visual surface byte-identical to the pre-change state
- [x] 10.7 Spot-check that `MantineButton`, `MantinePanel`, `MantineCard`, `MantineBadge`, `MantineTextInput`, `MantineSelectInput`, `MantineModal`, `MantineDrawer`, `MantineTabs`, `MantineMenu`, `MantineNotification`, `MantineStatePanel`, `MantineTableShell`, `MantineStatPanel`, and `MantineField` stories match the look and feel of the production shadcn surface
