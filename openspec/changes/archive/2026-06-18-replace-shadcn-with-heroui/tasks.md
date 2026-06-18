## 1. Promote HeroUI to production dependencies

- [ ] 1.1 Move `@nextui-org/react` (and any HeroUI peer packages it requires at runtime) from `devDependencies` to `dependencies` in `package.json`.
- [ ] 1.2 Run `bun install` and commit the regenerated `bun.lock`.
- [ ] 1.3 Run `bun run check` and `bun run ladle:coverage` to confirm the dependency move alone is non-breaking.

## 2. Promote the HeroUI theme to a production module

- [ ] 2.1 Move `src/components/ui/heroui-replica/theme.ts` to `src/lib/heroui-theme.ts` (or `src/styles/heroui-theme.ts` — record the final location in the PR description).
- [ ] 2.2 Update `src/components/ui/heroui-replica/provider.tsx` (and any other Ladle-replica importer) to import from the new production module.
- [ ] 2.3 Run `bun run heroui-design-system-replica:check` and `bun run ladle:coverage` to confirm the Ladle replica is unaffected.

## 3. Wire HeroUIProvider into the app shell

- [ ] 3.1 Add `src/components/providers/heroui-provider.tsx` exporting a client component that wraps children in `HeroUIProvider` and applies the production theme.
- [ ] 3.2 Mount `HeroUIProvider` from `src/components/unveiled/app-shell.tsx` (or fold it into `src/components/providers/query-provider.tsx` if that is the chosen location — record the final choice).
- [ ] 3.3 Audit every island that wraps a HeroUI client-only surface and gate it with `client:only="react"` (or a `useEffect`-gated dynamic import).
- [ ] 3.4 Run `bun run build` to confirm SSR on Cloudflare Workers does not crash.

## 4. Rebuild Button on HeroUI

- [ ] 4.1 Rewrite `src/components/ui/button.tsx` to compose HeroUI's `Button` as the base element.
- [ ] 4.2 Preserve the `variant` matrix (`default`, `primary`, `secondary`, `yellow`, `active`, `copied`, `destructive`, `ghost`, `outline`, `muted`, `link`) and the `size` matrix (`default`, `sm`, `lg`, `icon`, `icon-sm`).
- [ ] 4.3 Preserve the `loading` and `asChild` props and the `data-testid` values used by the gherkin suite.
- [ ] 4.4 Run `bun run check`, the matching Ladle story, and the matching gherkin scenario.

## 5. Rebuild unveiled-primitives on HeroUI

- [ ] 5.1 Rewrite `src/components/ui/unveiled-primitives.tsx` so `Panel`, `Card`, `Badge`, `StatPanel`, `Field`, `TextInput`, `SelectInput`, `TextArea`, `Divider`, `StatePanel`, `TableShell`, and `TableRow` compose the corresponding HeroUI components (or thin HeroUI-styled wrappers where no direct HeroUI equivalent exists).
- [ ] 5.2 Preserve the public `variant`, `tone`, `shadow`, `interactive`, and `state` props by translating them to HeroUI style props internally.
- [ ] 5.3 Preserve the `data-testid` values and the proximity + layout selector contract used by the gherkin suite.
- [ ] 5.4 Run `bun run check`, the matching Ladle stories, and the matching gherkin scenarios after each primitive lands.

## 6. Add new production primitives for previously shimmed surfaces

- [ ] 6.1 Add `src/components/ui/modal.tsx` backed by HeroUI's `Modal` with the existing `open` / `onClose` / `title` / `children` prop surface.
- [ ] 6.2 Add `src/components/ui/drawer.tsx` backed by HeroUI's `Drawer` with the same prop surface.
- [ ] 6.3 Add `src/components/ui/tabs.tsx` backed by HeroUI's `Tabs` and migrate the relevant call sites.
- [ ] 6.4 Add `src/components/ui/menu.tsx` backed by HeroUI's `Menu` and migrate the relevant call sites.
- [ ] 6.5 Add `src/components/ui/toast.tsx` backed by HeroUI's toast/notification API and migrate the relevant call sites.
- [ ] 6.6 Run `bun run check`, the matching Ladle stories, and the matching gherkin scenarios after each primitive lands.

## 7. Update every consumer of the old primitives

- [ ] 7.1 Walk `src/components/unveiled/` and convert every import from `@/components/ui/button` and `@/components/ui/unveiled-primitives` to the new HeroUI-backed primitives.
- [ ] 7.2 Walk `src/components/payments/` and do the same.
- [ ] 7.3 Walk `src/components/providers/` and do the same.
- [ ] 7.4 Walk `src/pages/` and `src/layouts/` and convert every remaining shadcn-specific import pattern.
- [ ] 7.5 Resolve prop mismatches (`tone`, `shadow`, `interactive`, `state`) at the call site, mapping to the new style-prop surface.
- [ ] 7.6 Run `rg "@/components/ui/(button|unveiled-primitives)" src/` and confirm every remaining hit is inside `src/components/ui/` itself.
- [ ] 7.7 Run `bun run check`, `bun run test:e2e`, and `bun run test:ladle` after the consumer walk completes.

## 8. Clean up shadcn remnants

- [ ] 8.1 Update or remove `components.json` so it no longer advertises shadcn as the component source.
- [ ] 8.2 Run `rg "@radix-ui/react-slot" src/` and remove `@radix-ui/react-slot` from `package.json` if no consumer remains.
- [ ] 8.3 Run `rg "class-variance-authority" src/` and remove `class-variance-authority` from `package.json` if no consumer remains.
- [ ] 8.4 Audit `clsx` and `tailwind-merge` and remove them from `package.json` if no consumer remains outside the deleted primitives.
- [ ] 8.5 Run `bun install`, commit the regenerated `bun.lock`, and run `bun run check` to confirm the cleanup is non-breaking.

## 9. Final verification and archival

- [ ] 9.1 Run `bun run check` (umbrella: `astro check` + `biome check .` + `specs:check` + `tokens:check` + `ladle:coverage` + `lint:viewport` + the no-console script).
- [ ] 9.2 Run `bun run check:heroui-replica` (umbrella: `heroui-design-system-replica:check` + `ladle:coverage` + `bun run check`).
- [ ] 9.3 Run `bun run test:e2e` and confirm the gherkin parity suite is green.
- [ ] 9.4 Run `bun run test:ladle` and confirm the Ladle interaction tests are green.
- [ ] 9.5 Run `bun run build` and confirm the production bundle is within the existing performance budget.
- [ ] 9.6 Open the change's `proposal.md` and update it (or supersede with a new proposal) if any public prop signature changed, and re-run `openspec validate replace-shadcn-with-heroui`.
- [ ] 9.7 Once the PR merges, run `openspec archive replace-shadcn-with-heroui`.
