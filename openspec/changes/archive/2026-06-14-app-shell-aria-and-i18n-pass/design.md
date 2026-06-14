## Context

The 09-iteration catalog (`09-iteration/01-review-existing-features.md` and
`09-iteration/02-remaining-features-to-prod.md`) lists six rows that all
touch the `app-shell` capability and are mechanically the same kind of
work: ARIA wiring, bilingual copy routing, and selector-discipline
compliance for the shell's shared surfaces. A prior single-row change
(`openspec/changes/archive/2026-06-14-app-shell-aria-and-i18n/`) shipped
the header / drawer / language-toggle subset, but the catalog still
flags the rest of the shell — discovery, list skeletons, motion, and the
viewport meta on every route.

This umbrella bundles all six rows into one OpenSpec change so the
review surface stays tight. The umbrella owns one capability delta on
`app-shell` (six `## MODIFIED Requirements` blocks) and produces six
per-feature folders under
`.development-plan/10-iteration/features/improvements/app-shell-aria-and-i18n-pass/`,
each with the gherkin + storybook story the 10-iteration Definition of
Done requires.

The change is an improvement pass: no new routes, no new actions, no
TypeSpec or LikeC4 model changes, and no new external dependencies.

## Goals / Non-Goals

**Goals:**

- Bring the six absorbed shell surfaces to ARIA + i18n + selector-discipline
  parity so the 10-iteration gherkin + storybook stories can be written
  verbatim.
- Wrap every motion-bearing shell element in a `prefers-reduced-motion`
  guard so a system-level "reduce motion" setting disables transitions.
- Audit `<meta name="viewport">` on every Astro route page and pin
  `width=device-width, initial-scale=1` everywhere.
- Keep the per-row gherkin + storybook story as the implementation unit so
  the 10-iteration Definition of Done (gherkin happy path + edge case,
  storybook `play` interaction test, `@story(...)` tag coverage) is met
  per row, not just per umbrella.
- Update the `app-shell` capability spec with one `## MODIFIED Requirements`
  block per absorbed row.

**Non-Goals:**

- Net-new features or routes.
- Changes to TypeSpec, LikeC4, design tokens, or Drizzle schema.
- Re-platforming the shell to a different component library.
- Translation beyond DE / EN (FR / IT / ES are reserved for 11-iteration).
- Multi-region / locale-aware copy beyond the existing URL-prefix
  language model.

## Decisions

### Decision 1: Group all six rows under one `app-shell` capability delta

Six rows, all touching the same capability, with the same kind of work
(ARIA + i18n + selector discipline). One umbrella change keeps the
review surface tight and avoids the ceremony of six near-identical
proposals. Each absorbed row still gets its own per-feature folder
(`.development-plan/10-iteration/features/improvements/app-shell-aria-and-i18n-pass/<row-slug>/`)
with its own gherkin + storybook story.

Alternatives considered:

- **One change per row** — six separate proposals, six separate spec
  deltas, six PRs. More ceremony, slower review, and the same surface
  touched repeatedly.
- **Refactor the whole shell into a new capability** — over-scope for an
  improvement pass; the existing `app-shell` capability already models
  the shell correctly.

### Decision 2: `prefers-reduced-motion` as a media-query guard, not JS

The motion guard is implemented as a single `@media (prefers-reduced-motion:
reduce)` block in the global stylesheet (`src/styles/global.css`) plus a
sentinel CSS class on motion-bearing shell elements. No client-side
JavaScript, no React hook. Reason: the media query is the platform's
authoritative signal, and CSS-only is cheaper than a runtime check.

Alternatives considered:

- **`useReducedMotion()` hook + `framer-motion` `useReducedMotion` prop** —
  pulls in a runtime dependency for what CSS already does natively.
- **Astro `<motion-config>` island** — overkill for a CSS-only check.

### Decision 3: Viewport meta via `src/layouts/base-layout.astro`

The viewport meta audit is implemented by declaring the canonical
viewport meta once in `src/layouts/base-layout.astro` (which is the
mount point for `<head>` on every Astro route page that is not a
redirect). A `bun run lint:viewport` script audits every `.astro`
route page under `src/pages/`, verifies that the layout declares the
canonical content, and fails the build if any route skips the layout
or the layout drifts. Reason: one canonical source beats per-page
repetition, and the lint catches forgotten routes.

Alternatives considered:

- **Per-page meta duplication** — easy to drift, easy to forget on new
  routes.
- **Astro middleware that injects the meta** — middleware can't inject
  into `<head>` after the page renders.
- **A separate `<BaseHead>` component imported by the layout** — adds
  a layer of indirection that the layout does not need; the meta
  lives where `<head>` is mounted.

### Decision 4: Skeleton loaders as a typed `<ListSkeleton>` primitive

Every list surface (events grid, saved events, bookings, operations
tables, member table) imports a single `<ListSkeleton variant="…">`
primitive from `src/components/unveiled/list-seleton.tsx` with a typed
`variant` enum. The primitive uses `aria-busy="true"` and a
`role="status"` + `aria-live="polite"` wrapper so screen readers
announce the loading state. The shell's loading-state wrapper
requirement (in the existing `app-shell` spec) routes through the same
primitive.

Alternatives considered:

- **Per-surface ad-hoc skeletons** — easy to drift on `aria-busy`,
  hard to keep count badge and copy in sync.
- **A library like `react-loading-skeleton`** — adds a dependency for
  something that's a 30-line primitive.

### Decision 5: Selector discipline as the binding contract

Every new gherkin scenario in this umbrella uses only proximity
(`getFieldNearestTo`, `getButtonNearestTo`, `getLinkNearestTo`) and
layout (`getByRole`, `getByLabel`, `getByLandmark`, `getInside`) selectors.
No `data-testid`, no `getByText` chains, no CSS class selectors. The
selector-discipline lint (`tests/steps/lint/selectors.ts`) runs as part
of `bun run check` and fails the build on any forbidden selector.

If a surface cannot be expressed with proximity + layout, the per-row
`tasks.md` MUST include a "Make UI selector-disciplinable" task that
adds the missing `aria-*`, label, or landmark — the spec is not
mergeable until that task is done.

## Risks / Trade-offs

- **Selector-discipline surprises** → some absorbed rows may need an
  intermediate `aria-*` / landmark change before the gherkin can be
  written. The per-row `tasks.md` is the right place to scope that work,
  not the umbrella.
- **Storybook drift** → the `@story(component=…, story=…)` tag schema
  and `bun run storybook:coverage` gate catch missing stories. The
  per-row `tasks.md` lists the story file as a hard deliverable.
- **i18n parity drift** → the typed `shell.*` dictionary shape already
  type-checks DE/EN parity (from the previously archived change). The
  new keys this umbrella adds MUST route through the same shape; the
  i18n parity unit test covers them.
- **Viewport meta on new routes** → a contributor who adds a new route
  page and forgets to import `BaseHead` will be caught by the lint. The
  risk is the lint not catching framework-level edge cases (e.g.
  an `.md` page that doesn't render a `<head>`); the audit script
  includes a defensive `!== undefined` check on `document.head`.
- **Reduced motion + skeleton flash** → if the user has both
  `prefers-reduced-motion` and a list that flashes a skeleton briefly,
  the skeleton still renders. The motion guard disables the fade-in
  transition, not the skeleton itself — the screen reader announcement
  is more useful than a missing visual cue.

## Migration Plan

This is an improvement pass; there is no data migration and no
rollback surface beyond `git revert`. Deploy order:

1. Land the umbrella change with all six rows complete and the
   `app-shell` capability spec updated.
2. `bun run check` + `bun run test:features` + `bun run test:storybook`
   + `bun run test:visual` + `bun run specs:check` + `bun run arch:check`
   + `bun run tokens:check` all green.
3. `openspec archive app-shell-aria-and-i18n-pass` folds the capability
   deltas into the live `openspec/specs/app-shell/spec.md`.
4. The 09-iteration catalog rows for the six absorbed rows flip to
   `status: specced`, then `merged` once the implementation lands.

## Open Questions

- Does the existing storybook setup (from the previously archived
  change) support the new `<ListSkeleton>` primitive out of the box, or
  do we need a `Skeleton` story file with its own args?
- Should the viewport meta lint be a `bun run lint:viewport` script
  wired into `bun run check`, or a one-off unit test under
  `tests/unit/`? (Resolved during implementation; either is fine.)
- Does `prefers-reduced-motion` need to also gate Leaflet map
  animations on the discovery shell? (Out of umbrella scope — Leaflet
  is owned by the discover-map-leaflet archive; coordinate with that
  change if needed.)
