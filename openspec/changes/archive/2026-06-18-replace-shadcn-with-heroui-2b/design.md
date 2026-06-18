## Context

Slice **2b** of the umbrella `replace-shadcn-with-heroui`. The Ladle-only HeroUI replica currently owns the theme module; this slice moves the theme to `src/lib/heroui-theme.ts` (the chosen production location per the umbrella design doc) and re-points the replica at it. No production code is touched in this slice — the replica still consumes the theme, just from a new path.

## Goals / Non-Goals

**Goals:**

- Relocate the HeroUI theme from `src/components/ui/heroui-replica/theme.ts` to `src/lib/heroui-theme.ts` without changing its export shape.
- Update every existing importer to use the new path.
- Keep the Ladle replica's gated checks green.

**Non-Goals:**

- No production consumers import the theme yet. Slice 2c mounts the production provider and is the first slice where the new module is read from production code.
- No theme content changes. Tokens, colors, and config stay byte-identical.
- No shadcn removal.

## Decisions

- **Theme lives at `src/lib/heroui-theme.ts` (not `src/styles/`).** The umbrella design doc favored `src/lib/` because the same module is needed by both the replica and the production provider. `src/styles/` is reserved for generated CSS.
- **The replica's `provider.tsx` is the only expected importer.** The consumer audit will surface any others; this slice updates all of them by name.

## Risks / Trade-offs

- **A Ladle story imports the theme from the old path and is missed by the audit.** → Run `bun run heroui-design-system-replica:check` (which already validates co-location and isolation) and `bun run ladle:coverage`; any unresolved import is a build error.

## Migration Plan

1. `git mv src/components/ui/heroui-replica/theme.ts src/lib/heroui-theme.ts` (or copy + delete if history is unimportant).
2. Update `src/components/ui/heroui-replica/provider.tsx` to import from `@/lib/heroui-theme`.
3. `rg "heroui-replica/theme"` to find any other importer; update each.
4. Run `bun run heroui-design-system-replica:check`, `bun run ladle:coverage`, `bun run check`.
5. Rollback: revert the single commit.

## Open Questions

_None._
