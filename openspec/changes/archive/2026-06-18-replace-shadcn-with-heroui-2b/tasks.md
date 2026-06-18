## 1. Move the HeroUI theme to a production module

- [x] 1.1 Move `src/components/ui/heroui-replica/theme.ts` to `src/lib/heroui-theme.ts`.
- [x] 1.2 Update `src/components/ui/heroui-replica/provider.tsx` (and any other importer found by `rg "heroui-replica/theme"`) to import from `@/lib/heroui-theme`.
- [x] 1.3 Run `bun run heroui-design-system-replica:check` and `bun run ladle:coverage` to confirm the Ladle replica is unaffected.
- [x] 1.4 Run `bun run check` to confirm the relocation is non-breaking.
