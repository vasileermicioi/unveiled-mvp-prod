## Why

Slices 2d, 2e, 2f rebuilt the production primitives on HeroUI. The call sites in `src/components/unveiled/`, `src/components/payments/`, `src/components/providers/`, `src/pages/`, and `src/layouts/` still import from the old paths and pass the old prop names. Slice **2g** walks every consumer, resolves prop mismatches (`tone`, `shadow`, `interactive`, `state`), and confirms no shadcn-specific pattern remains.

This is slice **2g** of 9 in the umbrella. See `openspec/changes/replace-shadcn-with-heroui/proposal.md` for the full context, capabilities, and impact.

## What Changes

- Walk `src/components/unveiled/`, `src/components/payments/`, `src/components/providers/`, `src/pages/`, and `src/layouts/`. Convert every import from the old primitives to the new HeroUI-backed primitives.
- Resolve prop mismatches (`tone`, `shadow`, `interactive`, `state`) at the call site, mapping to the new style-prop surface.
- Confirm via `rg "@/components/ui/(button|unveiled-primitives)" src/` that every remaining hit is inside `src/components/ui/` itself.
- Verify with `bun run check`, `bun run test:e2e`, and `bun run test:ladle`.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

_None._ Consumer migration is an implementation detail, not a spec-level capability change. The umbrella owns the capability deltas; this slice makes the call sites match.

## Impact

- **Modified files:** every consumer file in `src/components/unveiled/`, `src/components/payments/`, `src/components/providers/`, `src/pages/`, `src/layouts/` that imports the old primitives.
- **No new files.** No new packages.
