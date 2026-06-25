## Why

The design system owns design tokens but not the styling boundary: ~1,000 inline Tailwind utility strings in `packages/app` and `packages/landing`, bespoke `@layer` rules in `packages/app/src/styles/global.css`, and no enforcement gate mean token renames can silently desync layouts. App and landing must consume semantic classes from the design system only — not raw HeroUI, not raw Tailwind utilities.

## What Changes

- Move all bespoke CSS from `packages/app/src/styles/global.css` into `packages/design-system/src/styles/global.css`.
- Add `packages/design-system/src/styles/tailwind-theme.css` as the single `@theme` block for Tailwind v4 overrides.
- Introduce an initial catalogue of semantic layout classes (`.app-page`, `.content-shell`, `.discover-layout`, `.landing-section`, etc.) with `--{variant}` modifier suffixes for state.
- Replace every inline Tailwind utility `className` in `packages/app` and `packages/landing` with semantic classes from the design system (1:1 visual parity; no redesign).
- Reduce `packages/{app,landing}/src/styles/global.css` to a single `@import "@unveiled/design-system/styles/global.css";` line each.
- Add `packages/design-system/scripts/check-styling-ownership.ts` and wire `bun run check:styling-ownership` into `bun run check`.
- Add `scripts/codemod-semantic-classes.ts` for mechanical conversion (dry-run by default; `--write` after review).
- Add permanent unit tests under `tests/unit/` that assert the gate passes and forbidden utilities are absent in app/landing.
- Verify via visual-regression baselines in `tests/visual/` — zero unexpected diffs.

## Capabilities

### New Capabilities

_None — this change extends existing design-system and package capabilities rather than introducing a new capability folder._

### Modified Capabilities

- `design-system-package`: Design tokens become the enforced styling source; the package owns global CSS, Tailwind theme, semantic layout classes, and the `check:styling-ownership` gate.
- `app-package`: App `global.css` becomes a single import of design-system global CSS; app source files use semantic classes only.
- `landing-package`: Landing `global.css` becomes a single import of design-system global CSS; landing source files use semantic classes only.
- `design-tokens`: Tailwind v4 `@theme` overrides move from per-app `global.css` into `packages/design-system/src/styles/tailwind-theme.css`.

## Impact

- `packages/design-system/src/styles/` — new `global.css`, `tailwind-theme.css`; exports map updated.
- `packages/app/src/styles/global.css` and `packages/landing/src/styles/global.css` — reduced to one-line imports.
- Every `.tsx`, `.astro`, and `.html` file under `packages/app/src/**` and `packages/landing/src/**` — `className` strings converted to semantic classes.
- Root `package.json` — `check:styling-ownership` added to `check` script.
- `tests/unit/` — new gate tests; `tests/visual/` — baselines refreshed after conversion.
- `scripts/codemod-semantic-classes.ts` — new codemod (not wired into CI; human-reviewed).
- Out of scope: visual redesign, token renames in `design-tokens.json`, removing `cn()` from the public barrel, dark-mode variants, AGENTS.md update (deferred to proposal 10).
