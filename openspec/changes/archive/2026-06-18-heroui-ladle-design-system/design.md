## Context

The project currently ships a Ladle-only Mantine 9 design-system replica at `src/components/ui/mantine-replica/`. The product decision is to adopt HeroUI as the design system. Before changing any production surface, we need a HeroUI-based replica that renders every existing production primitive in isolation under Ladle, so stakeholders can review and approve the new look-and-feel.

The production app continues to use the existing shadcn-based primitives in `src/components/ui/` while this change is in flight. HeroUI is kept in `devDependencies` so it does not leak into the production bundle.

## Goals / Non-Goals

**Goals:**
- Remove the Mantine replica and all Mantine dev dependencies.
- Add HeroUI as a Ladle-only dev dependency with React 19-compatible versions.
- Build a HeroUI theme that sources every color, typography, radius, border, shadow, and motion value from `design-tokens.json`.
- Provide a HeroUI wrapper and matching Ladle story for every production primitive in `src/components/ui/`, including surfaces previously only modeled in the Mantine replica.
- Provide a single Ladle overview page that renders every HeroUI primitive as the visual contract for the production cutover.
- Prove the replica is unreachable from production entry points via an import-graph test and a check script.

**Non-Goals:**
- Changing any production page, layout, or component.
- Replacing shadcn primitives in `src/components/ui/` outside the replica folder.
- Adding new HTTP routes, Astro actions, database schema changes, or billing changes.

## Decisions

- **HeroUI in `devDependencies` only.** Keeping HeroUI out of `dependencies` guarantees it cannot be accidentally bundled into the SSR production build. Ladle and its stories are built separately, so `devDependencies` are sufficient there.
- **Theme values sourced from `@/lib/design-tokens`.** All colors, radii, shadows, borders, typography scales, and motion tokens used in `heroui-replica/theme.ts` are read from the generated design-token module so no new hex literals are introduced and brand consistency is enforced.
- **One `Hero<Name>.tsx` wrapper per primitive.** Rather than directly referencing HeroUI components in stories, each primitive gets a thin wrapper so the replica can normalize props, sizes, and states to match the production matrix and so the overview page imports a stable interface.
- **Co-located `Hero<Name>.ladle.tsx` stories.** Every wrapper has a matching Ladle file exporting one story per variant × size × state combination, mirroring the existing Mantine replica structure and satisfying `ladle:coverage`.
- **`// @ladle-only` header on every replica file.** This convention makes the Ladle-only intent visible and gives the check script a simple signal to enforce.
- **Import-graph test from production entry points.** `replica-not-imported.test.ts` walks imports starting from `src/pages/`, `src/layouts/`, `src/actions/index.ts`, and the non-replica `src/components/ui/` index to assert that no path resolves into `src/components/ui/heroui-replica/`.

## Risks / Trade-offs

- **HeroUI React 19 compatibility is still maturing.** → Mitigation: pin to a verified release, run the full replica through `bun run check` and `bun run test:ladle`, and keep HeroUI in `devDependencies` until production cutover.
- **Co-locating the replica under `src/components/ui/` makes accidental import easy.** → Mitigation: `// @ladle-only` headers, the import-graph unit test, and the `heroui-design-system-replica:check` script that fails on any production-side import.
- **Theme coverage can drift as design tokens evolve.** → Mitigation: the check script asserts that every token category (color, typography, radius, border, shadow, motion) is mapped in `theme.ts` and that no foreign hex literals exist in the replica folder.

## Migration Plan

1. Remove Mantine packages and the Mantine replica folder.
2. Add HeroUI dev dependencies.
3. Implement `theme.ts`, `provider.tsx`, wrappers, stories, overview, and the import-graph test.
4. Wire the new check scripts in `package.json` and remove the old Mantine replica scripts.
5. Run `bun run check`, `bun run test:ladle`, and `bun run ladle:coverage` until green.
6. Archive the change; production cutover to HeroUI is a separate future change.

## Open Questions

- Which exact HeroUI release has been verified against React 19 in this repo? (To be pinned during implementation.)
- Are there additional production primitives beyond the inventoried shadcn surfaces and Mantine-only surfaces? (To be reconciled against `src/components/ui/` during implementation.)
