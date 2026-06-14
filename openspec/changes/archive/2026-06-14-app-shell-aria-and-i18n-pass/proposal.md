## Why

The 09-iteration catalog flags six rows that all touch the **`app-shell`**
capability and are mechanically the same kind of work: the shell's header,
mobile drawer, language toggle, discovery shell, list skeletons, and motion /
viewport surfaces all need ARIA, i18n, and selector-discipline fixes before
10-iteration's gherkin + storybook story can be written for them. Bundling the
six rows into a single umbrella change keeps the review surface tight (one
proposal, one capability delta on `app-shell`) while preserving the per-row
gherkin + storybook story the 10-iteration Definition of Done requires.

The 10-iteration Definition of Done requires every UI surface to be
selector-disciplinable, accessible, bilingual, and traceable through a single
OpenSpec capability. This umbrella ships that for the six absorbed rows at
once: 5 P0 and 1 P1, all touching `app-shell`.

## What Changes

- Refactor the six absorbed surfaces to comply with the proximity + layout
  selector discipline.
- Add the missing `aria-*` attributes, labels, and landmark wrappers required
  for selector-disciplinable selection on every absorbed row.
- Localize any new copy in DE and EN via `src/lib/i18n.ts` (i18n parity unit
  test must pass).
- Add a `<component>.stories.tsx` story for every absorbed row that touches a
  component (`AppShell`, `DiscoveryShell`, `SkeletonLoadersOnEveryListSurface`,
  `PrefersReducedMotionHonored`, `MetaNameViewportAuditedOnEveryRoute`),
  each with at least one `@storybook/test` `play` interaction test.
- Add a `feature.feature` per absorbed row (one happy-path + one edge case)
  using only proximity + layout selectors.
- Update the `app-shell` capability spec with one `## MODIFIED Requirements`
  block per absorbed row.
- Add a `<meta name="viewport">` audit task that covers every Astro route
  page and a `prefers-reduced-motion` honoring task that covers every
  motion surface in the shell.

## Capabilities

### New Capabilities

_None_ — refactor / replace of an existing capability.

### Modified Capabilities

- `app-shell`: six rows add a `## MODIFIED Requirements` block
  (Accessible Shell Header, Accessible Mobile Drawer, Selector-Disciplinable
  Discovery Shell, Skeleton Loaders On Every List Surface, Reduced Motion
  Honored, Viewport Meta Audited).

## Impact

- New files:
  - One OpenSpec change at
    `openspec/changes/app-shell-aria-and-i18n-pass/` containing `proposal.md`,
    `tasks.md`, and `specs/app-shell/spec.md`.
  - One per-feature folder at
    `.development-plan/10-iteration/features/improvements/app-shell-aria-and-i18n-pass/`
    with the umbrella `proposal.md`, umbrella `tasks.md`, and a
    `<row-slug>/` sub-folder per absorbed row (each containing `proposal.md`,
    `tasks.md`, `feature.feature`, `<component>.stories.tsx`, and `specs.md`).
- Modified files: the components the absorbed rows touch (under
  `src/components/unveiled/`), the page-level `.astro` routes that need the
  viewport meta audit, the `openspec/specs/app-shell/spec.md` capability spec,
  and `src/lib/i18n.ts` for any new copy.
- Dependencies: none new.
- Out of scope: any other 09-iteration row whose capability is not in this
  umbrella's absorbed set; those land in their own umbrella.
