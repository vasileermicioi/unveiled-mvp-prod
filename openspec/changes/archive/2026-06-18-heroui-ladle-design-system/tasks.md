## 1. Remove Mantine replica and dependencies

- [ ] 1.1 Delete `src/components/ui/mantine-replica/` and any Mantine replica scripts under `scripts/`.
- [ ] 1.2 Remove `@mantine/core`, `@mantine/hooks`, and `@mantine/notifications` from `devDependencies` in `package.json`.
- [ ] 1.3 Remove `design-system-replica:check` and `check:replica` scripts from `package.json`.
- [ ] 1.4 Run `bun install` and verify `grep -R "@mantine" src/components/ui/ package.json bun.lock` returns zero matches.

## 2. Add HeroUI Ladle-only dependencies

- [ ] 2.1 Add React 19-compatible HeroUI packages under `devDependencies` in `package.json`.
- [ ] 2.2 Run `bun install` and verify the lockfile updates without conflicts.
- [ ] 2.3 Confirm HeroUI packages do not appear in `dependencies`.

## 3. Create HeroUI replica workspace

- [ ] 3.1 Create `src/components/ui/heroui-replica/` directory.
- [ ] 3.2 Create `src/components/ui/heroui-replica/theme.ts` mapping every color, typography, radius, border, shadow, and motion token from `design-tokens.json` into the HeroUI / Tailwind theme with no new hex literals.
- [ ] 3.3 Create `src/components/ui/heroui-replica/provider.tsx` exporting `<HeroUIReplicaProvider>` that wraps `HeroUIProvider` with the Unveiled theme.

## 4. Build HeroUI wrappers and stories

- [ ] 4.1 Inventory every production primitive in `src/components/ui/` and create/update `.development-plan/11-iteration/features/improvements/heroui-design-system-replica/INVENTORY.md`.
- [ ] 4.2 Create a `Hero<Name>.tsx` wrapper in `src/components/ui/heroui-replica/` for each shadcn primitive: `Button`, `Panel`, `Card`, `Badge`, `StatPanel`, `Field`, `TextInput`, `SelectInput`, `TextArea`, `Divider`, `StatePanel`, `TableShell`, `TableRow`.
- [ ] 4.3 Create a `Hero<Name>.tsx` wrapper for each surface previously only in the Mantine replica: `Modal`, `Drawer`, `Tabs`, `Menu`, `Notification`/`Toast`.
- [ ] 4.4 Create a co-located `Hero<Name>.ladle.tsx` for every `Hero<Name>.tsx`, exporting one story per variant × size × state combination.
- [ ] 4.5 Ensure every replica file starts with `// @ladle-only` on its first non-blank line.

## 5. Add design-system overview and isolation tests

- [ ] 5.1 Create `src/components/ui/heroui-replica/design-system-overview.ladle.tsx` rendering every `Hero<Name>` primitive inside a `<main role="main">` with an `<h1>` "Unveiled Design System (HeroUI)" and a `<nav>` of anchor links.
- [ ] 5.2 Create `src/components/ui/heroui-replica/replica-not-imported.test.ts` that walks the production import graph and asserts `heroui-replica/` is unreachable.

## 6. Add coverage and check scripts

- [ ] 6.1 Add `heroui-design-system-replica:check` script to `package.json` that asserts co-location, theme coverage, no hex literals, overview completeness, and import isolation.
- [ ] 6.2 Add `check:heroui-replica` umbrella script to `package.json` that runs the replica check, `ladle:coverage`, and `bun run check`.

## 7. Verify and close

- [ ] 7.1 Run `bun run heroui-design-system-replica:check` until it passes.
- [ ] 7.2 Run `bun run ladle:coverage` and confirm every `Hero<Name>.ladle.tsx` is referenced with no drift.
- [ ] 7.3 Run `bun run test:ladle` and confirm HeroUI stories render.
- [ ] 7.4 Run `bun run check` and resolve any failures.
- [ ] 7.5 Update `AGENTS.md` if toolchain commands or definition of done changed.
- [ ] 7.6 Run `openspec validate heroui-ladle-design-system` and resolve any errors.
