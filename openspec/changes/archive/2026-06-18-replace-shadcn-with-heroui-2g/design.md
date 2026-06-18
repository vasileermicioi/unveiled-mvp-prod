## Context

Slice **2g** of the umbrella `replace-shadcn-with-heroui`. The primitives are on HeroUI (slices 2d, 2e, 2f). This slice walks the consumers and resolves prop-level mismatches. The public prop surface was preserved by the wrapper slices, so most call sites need no edit; the audit is for shadcn-specific patterns (e.g. `as={Slot}`, `cva(...)`, `cn(...)` helpers) and for any prop the wrapper could not preserve verbatim.

## Goals / Non-Goals

**Goals:**

- Walk every consumer directory and convert old-primitive imports to the new HeroUI-backed ones.
- Resolve any prop-level mismatch (`tone`, `shadow`, `interactive`, `state`) at the call site.
- Confirm the audit `rg "@/components/ui/(button|unveiled-primitives)" src/` returns hits only inside `src/components/ui/`.
- Pass `bun run check`, `bun run test:e2e`, and `bun run test:ladle`.

**Non-Goals:**

- No new primitives. Slice 2f is complete.
- No package removal. Slice 2h audits and removes shadcn-only packages.
- No new behavior. This slice is a mechanical migration; the umbrella's spec deltas are unchanged.

## Decisions

- **Walk is per-directory in dependency order: `src/components/unveiled/` → `src/components/payments/` → `src/components/providers/` → `src/pages/` → `src/layouts/`.** Each directory's commits land together so the diff is reviewable per surface.
- **Prop mismatches are resolved at the call site, not by widening the wrapper.** The umbrella's "preserve the public prop surface" decision is final; if a call site needs HeroUI-native style props, the call site is the right place to put them.
- **Test failure policy: stop and report.** Per your decision, `bun run test:e2e` and `bun run test:ladle` failures pause the slice; I will not silently rewrite gherkin scenarios or rewrite the wrapper to mask a break.

## Risks / Trade-offs

- **A consumer imports a deep path that the wrapper no longer exports.** → If the wrapper cannot preserve the import, expose the missing symbol from the wrapper; record it in the PR description.
- **A gherkin scenario fails because the visual diff between shadcn and HeroUI is large enough to shift a layout selector.** → Pause, report, and decide together whether to update the scenario or the wrapper.
- **The `rg` audit returns a hit in a place that is genuinely a consumer (e.g. a Storybook story).** → Stop and resolve; do not silence the audit.

## Migration Plan

1. Walk `src/components/unveiled/`. Convert imports, resolve prop mismatches. Run `bun run check`. Commit.
2. Walk `src/components/payments/`. Same.
3. Walk `src/components/providers/`. Same.
4. Walk `src/pages/`. Same.
5. Walk `src/layouts/`. Same.
6. Run the final `rg` audit.
7. Run `bun run test:e2e` and `bun run test:ladle`. On failure, stop and report.
8. Rollback: revert the offending directory's commit. The primitives stay on HeroUI; the consumer reverts to its prior import.

## Open Questions

_None._
