## Context

Slice **2e** of the umbrella `replace-shadcn-with-heroui`. `Button` is on HeroUI (slice 2d); this slice rebuilds the rest of the production primitives exported from `unveiled-primitives.tsx` on top of HeroUI. The wrapper pattern (Unveiled prop names → HeroUI style props, preserved `data-testid`, preserved selector contract) is the same pattern slice 2d established.

## Goals / Non-Goals

**Goals:**

- Rebuild each of `Panel`, `Card`, `Badge`, `StatPanel`, `Field`, `TextInput`, `SelectInput`, `TextArea`, `Divider`, `StatePanel`, `TableShell`, `TableRow` on HeroUI.
- Preserve the public prop surface for every primitive.
- Preserve `data-testid` and the proximity + layout selector contract.
- Pass `bun run check`, the matching Ladle stories, and the matching gherkin scenarios.

**Non-Goals:**

- No consumer changes. Slice 2g walks the call sites.
- No new primitives for previously shimmed surfaces (`Modal`, `Drawer`, `Tabs`, `Menu`, `Toast`). Slice 2f adds those.
- No shadcn package removal. Slice 2h audits and removes.

## Decisions

- **Per-primitive commits.** Each primitive lands as its own commit so the Ladle story, the gherkin scenario, and the visual diff are reviewable in isolation. If one primitive regresses, only that commit reverts.
- **Where HeroUI has no direct equivalent (e.g. `StatPanel`, `TableShell`), use a thin HeroUI-styled wrapper.** The wrapper is a Tailwind-styled element that reuses HeroUI's theme tokens; the public prop surface is preserved.
- **Prop translation lives inside the wrapper.** `tone`, `shadow`, `interactive`, `state` are Unveiled-specific and map to HeroUI style props (or to Tailwind classes when no HeroUI equivalent exists). HeroUI's prop names do not leak into the app.

## Risks / Trade-offs

- **Twelve primitives in one change is a large diff.** → Mitigated by per-primitive commits and a Ladle + gherkin check after each.
- **A primitive that relies on Radix-specific behaviour (e.g. `Select` portal) does not have a clean HeroUI equivalent.** → Use HeroUI's `Select`; if visual parity regresses, pause and ask before shipping.
- **`data-testid` collisions if a primitive re-emits one its child also emits.** → Pass `data-testid` only to the outer element; let the gherkin suite flag any breakage.

## Migration Plan

1. Rewrite the first primitive in `unveiled-primitives.tsx` (suggested order: simplest first — `Divider`, `Badge`, `Panel`; forms last because they have the most variants).
2. Run `bun run check`.
3. Run the matching Ladle story and the matching gherkin scenario.
4. Repeat for the next primitive until all 12 are on HeroUI.
5. Rollback: revert the offending primitive's commit. The remaining primitives stay on HeroUI.

## Open Questions

- **For primitives that HeroUI does not have a direct equivalent for (`StatPanel`, `TableShell`, `TableRow`), should the wrapper use HeroUI's `Table` family or a plain Tailwind element with HeroUI tokens?** Resolve during the wrapper implementation; default is "plain Tailwind with HeroUI tokens" because `TableShell` is a styled wrapper, not a table primitive.
