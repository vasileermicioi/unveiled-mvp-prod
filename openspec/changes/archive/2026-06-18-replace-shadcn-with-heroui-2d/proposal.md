## Why

Slice **2c** mounted `HeroUIProvider` at the client root. Slice **2d** is the first slice that actually consumes it in production code: `src/components/ui/button.tsx` is rewritten as a HeroUI-backed wrapper. Public prop signatures (`variant`, `size`, `loading`, `asChild`) and the existing `data-testid` values are preserved so the gherkin suite stays green.

This is slice **2d** of 9 in the umbrella. See `openspec/changes/replace-shadcn-with-heroui/proposal.md` for the full context, capabilities, and impact.

## What Changes

- Rewrite `src/components/ui/button.tsx` to compose HeroUI's `Button` as the base element.
- Preserve the `variant` matrix (`default`, `primary`, `secondary`, `yellow`, `active`, `copied`, `destructive`, `ghost`, `outline`, `muted`, `link`) and the `size` matrix (`default`, `sm`, `lg`, `icon`, `icon-sm`).
- Preserve the `loading` and `asChild` props and the `data-testid` values used by the gherkin suite.
- Verify with `bun run check`, the matching Ladle story, and the matching gherkin scenario.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `ui-system`: the `Buttons And Controls` requirement now specifies that `Button` is a HeroUI-backed wrapper. The full delta is owned by the umbrella `replace-shadcn-with-heroui`; this slice ships the precondition.

## Impact

- **Modified files:** `src/components/ui/button.tsx`.
- **No consumer changes in this slice.** Call sites continue to import from `@/components/ui/button`; the public prop surface is preserved. Consumer migration is owned by slice 2g.
