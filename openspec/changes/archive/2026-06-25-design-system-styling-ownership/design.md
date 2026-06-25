## Context

Iteration 13 established that `@unveiled/design-system` owns HeroUI-based primitives, design tokens, and atom chrome. Tokens already generate into `packages/design-system/src/styles/generated/tokens.css` and both Astro apps import them. However, ~1,027 `className=` matches in `packages/app` and `packages/landing` still compose raw Tailwind utilities inline, and `packages/app/src/styles/global.css` (~8 KB) holds bespoke `@layer` rules, custom classes (`headline-xl`, `unveiled-shadow`, `page-shell`, etc.), and a local `@theme` block. The styling boundary is leaky: token renames can silently desync layouts, and there is no CI gate preventing new violations.

This change depends on proposals 02–05 (atoms through layouts/pages extracted with Ladle stories) and blocks proposals 07, 08, and 10.

## Goals / Non-Goals

**Goals:**

- Centralize all CSS rules, Tailwind theme overrides, and semantic layout classes in `packages/design-system/src/styles/`.
- Reduce `packages/{app,landing}/src/styles/global.css` to a single `@import` of design-system global CSS.
- Convert every inline Tailwind utility composition in app/landing to a semantic class with 1:1 visual parity.
- Ship `check-styling-ownership` gate wired into `bun run check` plus permanent unit tests.
- Verify via `tests/visual/` baselines — zero unexpected diffs.

**Non-Goals:**

- Visual redesign or token renames in `design-tokens.json`.
- Removing `cn()` from the public barrel (organisms continue composing modifiers).
- Dark-mode `data-theme` variants (follow-up proposal).
- AGENTS.md update (deferred to proposal 10).

## Decisions

### 1. Semantic-class catalogue over inline utilities

**Decision:** App and landing use named semantic classes (`.app-page`, `.member-feed-row`, etc.) defined in design-system `global.css`, with `--{variant}` modifier suffixes for state.

**Rationale:** Semantic names survive token renames and are grep-able. Modifiers (`member-feed-row--interactive`) let organisms compose state via `cn()` without reintroducing utilities in consumers.

**Alternative considered:** Allow layout utilities (`flex`, `grid`, `gap-*`) in app/landing. Rejected — the prompt requires design-system ownership of all styling; partial allowance would erode the gate.

### 2. Global CSS import chain

**Decision:**

```
packages/{app,landing}/src/styles/global.css
└── @import "@unveiled/design-system/styles/global.css"

packages/design-system/src/styles/global.css
├── @import "./generated/tokens.css"
├── @import "./tailwind-theme.css"
├── @tailwind base / components / utilities
└── semantic + bespoke class definitions
```

**Rationale:** One import point per surface; `@tailwind` directives must run in design-system before semantic classes are defined.

### 3. Tailwind theme in `tailwind-theme.css`

**Decision:** Sole `@theme` block lives at `packages/design-system/src/styles/tailwind-theme.css`, mapping brand colors, fonts, and `shadow-unveiled` from tokens.

**Alternative considered:** Keep `@theme inline` in each app's `global.css`. Rejected — duplicates ownership and conflicts with the one-import rule.

### 4. Mechanical codemod + human review

**Decision:** `scripts/codemod-semantic-classes.ts` tokenizes `className` strings, maps known utility patterns to semantic classes via a catalogue, emits warnings for unmapped tokens, and requires `--write` after review.

**Rationale:** ~1,000 matches are too large for manual-only conversion; conservative codemod avoids silent wrong replacements.

### 5. Gate script location and rules

**Decision:** `packages/design-system/scripts/check-styling-ownership.ts` enforces:

- No forbidden Tailwind utilities in `packages/{app,landing}/src/**` JSX/TSX/Astro/HTML.
- Consumer `src/styles/` contains only `global.css` with `@import` lines to design-system.
- No reverse imports from design-system styles into app/landing.
- `R-NO-UNLISTED-CLASS`: new semantic classes must be added to the catalogue by design-system owners, not ad-hoc in consumers.

**Rationale:** Gate lives with the package that owns the contract; root `check` script fans it out like `check:atomic-layers`.

### 6. Font faces move with global CSS

**Decision:** `@font-face` rules for EKNoticeSans move from `packages/app/src/styles/global.css` into design-system `global.css`, preserving `/app/fonts/...` URLs.

**Rationale:** Font declarations are CSS rules; keeping them in app violates the one-import rule.

## Risks / Trade-offs

- **[Risk] Class collisions after moving bespoke CSS** → Preserve existing class names verbatim; run visual-regression suite and refresh baselines only after confirming parity.
- **[Risk] Codemod leaves unmapped utility strings** → Conservative codemod warns instead of guessing; manual catalogue extension for repeated patterns; gate must pass before merge.
- **[Risk] Variant suffix proliferation** → `R-NO-UNLISTED-CLASS` gate prevents ad-hoc classes in consumers; new variants require catalogue updates in design-system.
- **[Risk] Landing `prefers-reduced-motion` block relocation** → Move the single global block into design-system `global.css`; verify landing gherkin reduced-motion scenario still passes.
- **[Trade-off] Organisms may still use `cn()` with semantic modifiers** → Accepted; the gate targets app/landing only, not design-system internals.

## Migration Plan

1. **CSS extraction** — Create design-system `global.css` and `tailwind-theme.css`; copy bespoke rules from app `global.css`; replace app/landing `global.css` with single import; confirm visual parity.
2. **Semantic catalogue** — Implement initial 18+ classes and variant modifiers in design-system `global.css`.
3. **Codemod pass** — Dry-run codemod, review warnings, extend catalogue, `--write`, confirm empty warning list.
4. **Gate** — Implement `check-styling-ownership.ts`, wire into `check`, add unit tests.
5. **Visual regression** — Run `tests/visual/` category; fix unexpected diffs; refresh baselines.
6. **Rollback** — Revert consumer `global.css` imports and restore inline utilities from git history; gate failure blocks merge so partial state should not reach main.

## Open Questions

- None blocking implementation. Catalogue will grow during codemod warning review; each new class is added to design-system `global.css` and documented in the gate's allow-list.

## AGENTS.md handoff (proposal 10)

Boundary decisions for proposal 10 to lift into `AGENTS.md`:

- **Styling ownership:** `@unveiled/design-system` owns all CSS rules, Tailwind `@theme` overrides (`tailwind-theme.css`), semantic layout classes (`global.css` + `semantic-generated.css`), and atom chrome. App and landing `src/styles/global.css` each contain only `@import "@unveiled/design-system/styles/global.css";`.
- **Consumer rule:** `packages/{app,landing}/src/**` MUST NOT use raw Tailwind utility strings in `className` / `class` attributes. Layout and chrome use semantic classes (`app-page`, `ui-{hash}`, catalogue names) defined in the design system. Organisms in the design system MAY still compose `cn()` with semantic modifiers (`member-feed-row--interactive`).
- **Gate:** `bun run check:styling-ownership` runs in `bun run check`. Violations fail CI with file path and forbidden token.
- **Codemod:** `bun scripts/codemod-semantic-classes.ts` (--dry-run default, `--write` to apply) maps utility strings to semantic classes; unmapped patterns become `ui-{hash}` entries in `semantic-generated.css`.
- **Out of scope for AGENTS until proposal 10:** dark-mode `data-theme` variants, token renames, removing `cn()` from the public barrel.
