## Why

Slices 2a and 2b made HeroUI resolvable and gave its theme a production home. Slice **2c** mounts `HeroUIProvider` at the client root so every later slice (Button, unveiled-primitives, the new Modal/Drawer/Tabs/Menu/Toast) can use HeroUI components without repeating the provider at every call site. Per the umbrella design doc, the provider lives in a dedicated module — `src/components/providers/heroui-provider.tsx` — and is mounted from `src/components/unveiled/app-shell.tsx`.

This is slice **2c** of 9 in the umbrella. See `openspec/changes/replace-shadcn-with-heroui/proposal.md` for the full context, capabilities, and impact.

## What Changes

- Add `src/components/providers/heroui-provider.tsx`: a client component that wraps children in `HeroUIProvider` and applies the production theme from `@/lib/heroui-theme`.
- Mount `HeroUIProvider` from `src/components/unveiled/app-shell.tsx`.
- Audit every island that wraps a HeroUI client-only surface and gate it with `client:only="react"` (or a `useEffect`-gated dynamic import) so SSR on Cloudflare Workers does not crash.
- Verify SSR with `bun run build`.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `app-shell`: the client root provider stack now mounts `HeroUIProvider`, and the global theme configuration is sourced from `src/lib/heroui-theme.ts` (the full delta for this capability is owned by the umbrella `replace-shadcn-with-heroui`; this slice adds the precondition the later primitive slices depend on).

## Impact

- **New files:** `src/components/providers/heroui-provider.tsx`.
- **Modified files:** `src/components/unveiled/app-shell.tsx`, and any island that wraps a HeroUI client-only surface (gated with `client:only="react"`).
- **Dependencies:** if slice 2c's `bun run build` reveals a missing runtime peer (e.g. `framer-motion`), add it to `dependencies` in this slice.
