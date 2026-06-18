## Why

Slices 2d and 2e replaced the existing primitives on HeroUI. Slice **2f** adds the new production primitives that the umbrella calls for — `Modal`, `Drawer`, `Tabs`, `Menu`, `Toast`/`Notification` — backed by HeroUI and exported from `src/components/ui/`. These replace the Mantine shims that have no counterpart in shadcn.

This is slice **2f** of 9 in the umbrella. See `openspec/changes/replace-shadcn-with-heroui/proposal.md` for the full context, capabilities, and impact.

## What Changes

- Add `src/components/ui/modal.tsx` backed by HeroUI's `Modal` with the existing `open` / `onClose` / `title` / `children` prop surface.
- Add `src/components/ui/drawer.tsx` backed by HeroUI's `Drawer` with the same prop surface.
- Add `src/components/ui/tabs.tsx` backed by HeroUI's `Tabs`.
- Add `src/components/ui/menu.tsx` backed by HeroUI's `Menu`.
- Add `src/components/ui/toast.tsx` backed by HeroUI's toast/notification API.
- Verify with `bun run check`, the matching Ladle stories, and the matching gherkin scenarios after each primitive lands.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `ui-system`: the `Modal And Dialog Components` requirement now specifies that `Modal` and `Drawer` are HeroUI-backed wrappers. The full delta is owned by the umbrella `replace-shadcn-with-heroui`; this slice ships the precondition.

## Impact

- **New files:** `src/components/ui/modal.tsx`, `src/components/ui/drawer.tsx`, `src/components/ui/tabs.tsx`, `src/components/ui/menu.tsx`, `src/components/ui/toast.tsx`.
- **No consumer changes in this slice.** Slice 2g walks the call sites.
