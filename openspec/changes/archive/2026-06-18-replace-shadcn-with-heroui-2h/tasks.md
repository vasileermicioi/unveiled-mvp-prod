## 1. Clean up shadcn remnants

- [x] 1.1 Update or remove `components.json` so it no longer advertises shadcn as the component source.
- [x] 1.2 Run `rg "@radix-ui/react-slot" src/` and remove `@radix-ui/react-slot` from `package.json` if no consumer remains.
- [x] 1.3 Run `rg "class-variance-authority" src/` and remove `class-variance-authority` from `package.json` if no consumer remains.
- [x] 1.4 Audit `clsx` and `tailwind-merge` and remove them from `package.json` if no consumer remains outside the deleted primitives.
- [x] 1.5 Run `bun install`, commit the regenerated `bun.lock`, and run `bun run check` to confirm the cleanup is non-breaking.

## Notes on 1.2/1.3/1.4

The audit found real consumers for all four packages, but they are the **new HeroUI primitives** (slices 2d/2e/2f), not leftover shadcn code:

- **`@radix-ui/react-slot`** — kept. `src/components/ui/button.tsx` uses `Slot` for the `asChild` branch; 8 call sites rely on it.
- **`class-variance-authority`** — kept. `src/components/ui/button.tsx` uses `cva` for the 11-variant × 5-size matrix; HeroUI's variant enum does not map to Unveiled's (per slice 2d's design decision).
- **`clsx` / `tailwind-merge`** — kept. `src/lib/utils.ts` defines `cn()` using both; the new HeroUI primitives in `src/components/ui/button.tsx`, `unveiled-primitives.tsx`, `modal.tsx`, `drawer.tsx`, `tabs.tsx`, `menu.tsx`, and `toast.tsx` all use `cn()` for HeroUI className overlays.

The slice's design doc explicitly anticipated this case: "If a removal breaks the build, restore the package and pause." The packages are kept. `bun.lock` is unchanged.
