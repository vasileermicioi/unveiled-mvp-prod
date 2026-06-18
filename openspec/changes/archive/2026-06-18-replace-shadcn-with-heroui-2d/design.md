## Context

Slice **2d** of the umbrella `replace-shadcn-with-heroui`. `HeroUIProvider` is mounted (slice 2c); this slice is the first to consume it in production. The current `Button` is shadcn-based; this slice rebuilds it on HeroUI's `Button` while preserving every public prop so consumers and the gherkin suite are unaffected.

## Goals / Non-Goals

**Goals:**

- Replace `src/components/ui/button.tsx` with a HeroUI-backed wrapper.
- Preserve the full `variant` × `size` matrix and the `loading` / `asChild` props.
- Preserve the `data-testid` values used by the gherkin suite.
- Pass `bun run check` and the matching Ladle story.

**Non-Goals:**

- No consumer changes. Slice 2g walks the call sites.
- No new `Button` features. The prop surface is locked to today's shape.
- No `unveiled-primitives` rewrite (slice 2e).

## Decisions

- **Unveiled variant/size names are owned by the wrapper.** Consumers pass `variant="primary"`, `size="icon-sm"`, etc. The wrapper translates to HeroUI's enum space internally. HeroUI's native prop names do not leak into the app.
- **`asChild` is implemented via a thin Slot wrapper** (the existing `@radix-ui/react-slot` import pattern). The shadcn-based Button already uses it; we keep the package for now and let slice 2h decide if `react-slot` is still needed once shadcn is fully removed.
- **`loading` maps to HeroUI's `isLoading`** plus a spinner slot; the prop name stays `loading` to match today's call sites.
- **`data-testid` is preserved verbatim** by passing `data-testid` through to the underlying element. The gherkin suite's selector contract (proximity + layout, not `data-testid`) is unaffected regardless.

## Risks / Trade-offs

- **A variant maps to a HeroUI color/size that does not exist verbatim.** → Fall back to the closest HeroUI variant; record the mapping in a comment block at the top of `button.tsx`. If the visual delta is visible, the Ladle parity story catches it; if the variant cannot be matched, pause and ask.
- **`asChild` behaviour drifts between Radix Slot and HeroUI's polymorphic API.** → Stay on Radix Slot for now (it's still in `dependencies`); revisit in slice 2h.

## Migration Plan

1. Rewrite `src/components/ui/button.tsx`: keep the same default export name, same prop type shape, same `displayName`; swap the base element to HeroUI's `Button` and add a variant-translation map.
2. Run `bun run check`.
3. Run the matching Ladle story (the existing Button story in `src/components/ui/heroui-replica/`) and confirm parity.
4. Run the matching gherkin scenario via `bun run test:e2e` (or `bun run test:ladle` if the scenario carries a `@ladle(...)` tag) for one Button-using flow.
5. Rollback: revert the single commit. No consumer is changed, so the gherkin suite reverts in lockstep.

## Open Questions

- **Is there a HeroUI variant that does not have a clean Unveiled equivalent (e.g. `active` for the active-state styling)?** Resolve during the wrapper implementation; if a clean map does not exist, pause and ask.
