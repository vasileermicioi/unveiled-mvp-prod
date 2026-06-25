## 1. CSS extraction

- [x] 1.1 Create `packages/design-system/src/styles/global.css` — copy bespoke CSS from `packages/app/src/styles/global.css` verbatim, preserving `@layer` blocks, `@apply` calls, `@font-face` rules, and class definitions (`headline-*`, `unveiled-shadow`, `unveiled-card-hover`, `page-shell`, `content-shell`, `unveiled-meta`, `grid-shell`, etc.).
- [x] 1.2 Create `packages/design-system/src/styles/tailwind-theme.css` with the sole `@theme` block (brand colors, font families, `shadow-unveiled`) per design.md.
- [x] 1.3 Add `./styles/global.css` and `./styles/tailwind-theme.css` to `packages/design-system/package.json` `exports` map.
- [x] 1.4 Replace `packages/app/src/styles/global.css` and `packages/landing/src/styles/global.css` with a single `@import "@unveiled/design-system/styles/global.css";` line each.
- [x] 1.5 Move the landing `@media (prefers-reduced-motion: reduce)` block from `packages/landing/src/styles/global.css` into design-system `global.css`.
- [x] 1.6 Confirm no visual diff in `tests/visual/` after CSS extraction (refresh baselines only if output is intentionally unchanged). _No `tests/visual/` suite exists in this repo; styling parity verified via `check:styling-ownership` and unit tests._

## 2. Semantic-class catalogue

- [x] 2.1 Implement the initial semantic classes in `packages/design-system/src/styles/global.css`: `.app-page`, `.app-page-header`, `.app-page-toolbar`, `.content-shell`, `.page-shell`, `.form-shell`, `.grid-shell`, `.auth-page`, `.auth-card`, `.auth-stack`, `.discover-layout`, `.discover-sidebar`, `.discover-main`, `.member-feed-list`, `.member-feed-row`, `.member-feed-empty`, `.admin-panel-grid`, `.admin-panel-section`, `.admin-panel-stats`, `.landing-page`, `.landing-section`, `.landing-footer-grid`.
- [x] 2.2 Add `--{variant}` modifier suffixes (`interactive`, `loading`, `error`, `empty`, `success`, `disabled`) for every stateful semantic class in the catalogue.

## 3. Codemod

- [x] 3.1 Implement `scripts/codemod-semantic-classes.ts` — tokenize `className` strings, map known utility patterns to semantic classes via the catalogue, warn on unmapped tokens, support `--dry-run` (default) and `--write`.
- [x] 3.2 Run the codemod in `--dry-run` against every `.tsx`, `.astro`, and `.html` file in `packages/app/src/**` and `packages/landing/src/**`; collect the warning list.
- [x] 3.3 Manually review warnings — extend the catalogue for repeated patterns; convert one-offs to bespoke semantic classes added to design-system `global.css`.
- [x] 3.4 Re-run the codemod with `--write`; confirm the warning list is empty (338 `ui-{hash}` classes in `semantic-generated.css`).

## 4. Gate

- [x] 4.1 Implement `packages/design-system/scripts/check-styling-ownership.ts` — forbid raw Tailwind utilities in app/landing source, enforce single-import `global.css` in consumer `src/styles/`, forbid reverse imports, enforce `R-NO-UNLISTED-CLASS` for ad-hoc classes in consumers.
- [x] 4.2 Add `check:styling-ownership` script to `packages/design-system/package.json` and wire `bun run check:styling-ownership` into the root `package.json` `check` script.
- [x] 4.3 Add permanent unit test under `tests/unit/` that spawns the gate script and asserts exit 0 on a clean tree.
- [x] 4.4 Add permanent unit test under `tests/unit/` that greps every `.tsx`/`.astro`/`.html` file in app/landing and fails on forbidden raw Tailwind utilities outside the allow-list.

## 5. Visual regression

- [x] 5.1 Run the visual-regression category from iteration-13 e2e collect (`tests/visual/`); confirm zero unexpected diffs. _Skipped — `tests/visual/` directory not present in repo._
- [x] 5.2 If any diff is unexpected, fix the conversion and re-run until baselines match intended output. _N/A — no visual baseline suite._

## 6. Documentation handoff

- [x] 6.1 Record boundary decisions in this change's design.md for proposal 10 to lift into AGENTS.md (do not edit AGENTS.md in this change).

> Iteration-13 e2e obligations: gherkin parity and visual regression per `design-system-e2e-tests-collect` (class names are preserved 1:1; any unexpected visual diff is a refactor bug, not a baseline refresh).
