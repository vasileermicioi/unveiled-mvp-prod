## Why

Slice **2d** rebuilt `Button` on HeroUI. Slice **2e** does the same for the rest of the primitives that ship from `src/components/ui/unveiled-primitives.tsx` — `Panel`, `Card`, `Badge`, `StatPanel`, `Field`, `TextInput`, `SelectInput`, `TextArea`, `Divider`, `StatePanel`, `TableShell`, `TableRow`. Public prop signatures and the proximity + layout selector contract are preserved so the gherkin suite stays green.

This is slice **2e** of 9 in the umbrella. See `openspec/changes/replace-shadcn-with-heroui/proposal.md` for the full context, capabilities, and impact.

## What Changes

- Rewrite `src/components/ui/unveiled-primitives.tsx` so each of the 12 listed primitives composes the corresponding HeroUI component (or a thin HeroUI-styled wrapper where no direct HeroUI equivalent exists).
- Preserve the public `variant`, `tone`, `shadow`, `interactive`, and `state` props by translating them to HeroUI style props internally.
- Preserve the `data-testid` values and the proximity + layout selector contract used by the gherkin suite.
- Verify with `bun run check`, the matching Ladle stories, and the matching gherkin scenarios after each primitive lands.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `ui-system`: `Forms`, `Empty, Loading, And Error States`, and `Skeleton Loading Primitives` now specify that the listed primitives are HeroUI-backed wrappers. The full delta is owned by the umbrella `replace-shadcn-with-heroui`; this slice ships the precondition.

## Impact

- **Modified files:** `src/components/ui/unveiled-primitives.tsx`.
- **No consumer changes in this slice.** Slice 2g walks the call sites.
