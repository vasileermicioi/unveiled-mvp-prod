## Why

Slice **2a** made HeroUI resolvable from production code. The HeroUI theme still lives inside the Ladle-only replica (`src/components/ui/heroui-replica/theme.ts`), which is gated by `bun run heroui-design-system-replica:check`. Slice **2b** moves the theme to a production module and points the replica at it, so the production provider (slice 2c) can import it without crossing the Ladle gate.

This is slice **2b** of 9 in the umbrella. See `openspec/changes/replace-shadcn-with-heroui/proposal.md` for the full context, capabilities, and impact.

## What Changes

- Move `src/components/ui/heroui-replica/theme.ts` to `src/lib/heroui-theme.ts`.
- Update `src/components/ui/heroui-replica/provider.tsx` (and any other Ladle-replica importer of the theme) to import from the production module.
- Confirm the Ladle replica is unaffected (`bun run heroui-design-system-replica:check` + `bun run ladle:coverage`).

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

_None._ The theme module's contract (its export shape) is preserved verbatim; only its location changes. Spec-level requirements for `app-shell` and `ui-system` are owned by later slices and the umbrella.

## Impact

- **New files:** `src/lib/heroui-theme.ts`.
- **Modified files:** `src/components/ui/heroui-replica/provider.tsx` (and any other Ladle-replica importer).
- **Removed files:** `src/components/ui/heroui-replica/theme.ts` (replaced by the production module).
- The `heroui-replica/` directory otherwise remains (Ladle-only) and stays gated.
