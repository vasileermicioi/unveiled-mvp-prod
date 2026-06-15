## Context

Three OpenSpec changes in this iteration introduce Ladle (replacing Storybook) and Hero UI (replacing shadcn/ui). Before those migrations ship, all documentation and remaining 10-iteration specs must be updated to reflect the new naming and philosophy, ensuring the team works against a consistent contract.

## Goals / Non-Goals

**Goals:**
- Update `AGENTS.md` to document Ladle as the storybook replacement, Hero UI as the component library, and the Playwright + proximity selector discipline.
- Update `docs/guidelines.md` to reflect the new component authoring model and testing conventions.
- Update `CONTRIBUTING.md` references to Storybook and shadcn/ui.
- Update all remaining 10-iteration spec files (09–31) to reference Ladle and Hero UI instead of Storybook and shadcn/ui.
- Update `openspec/specs/app-shell/spec.md` to reflect the new naming convention.

**Non-Goals:**
- Actual Ladle migration (separate change `ladle-migration`).
- Actual Hero UI component rewrite (separate change `hero-ui-migration`).
- No functional requirements change — this is purely a naming and documentation update.

## Decisions

1. **Ladle replaces Storybook**: Storybook → Ladle in all documentation, specs, and toolchain references.
2. **Hero UI replaces shadcn/ui**: shadcn/ui → Hero UI in all documentation and specs.
3. **Playwright + proximity selectors**: Testing discipline uses `getFieldNearestTo`, `getButtonNearestTo`, `getLinkNearestTo`, and layout selectors (`getByRole`, `getByLabel`, `getByLandmark`, `getInside`) instead of `data-testid` or CSS class selectors.

## Risks / Trade-offs

- **Risk**: Multiple files must be updated consistently. → Mitigation: Use search-and-replace patterns; verify with `bun run check`.
- **Risk**: Some specs may have implicit dependencies on Storybook/shadcn/ui conventions not yet documented. → Mitigation: Review each spec for mention of these tools and update accordingly.