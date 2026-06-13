## Why

Visual and interaction decisions for Unveiled are currently scattered across:

- `src/styles/global.css` (Tailwind v4 theme, CSS custom properties, utility classes)
- `src/components/ui/unveiled-primitives.tsx` (button/badge/panel variants)
- `src/components.json` (shadcn config — disabled in practice but still present)
- `docs/guidelines.md` (narrative description of brand colors, typography, borders, shadows)
- `_old_app/index.css` (legacy reference, never imported)

This is the only place where a new contributor has to grep four files to answer "what is the brand-yellow hex?". Worse, there is no machine-readable spec for the design system, so the gherkin feature files (proposal `04-gherkin-specs-by-domain.md`), the LikeC4 model (proposal `01-likec4-architecture-diagrams.md`), the future partner/admin SDKs, and any future React Native or Vue port all have to re-derive the same constants.

This proposal introduces a single source of truth for the design system: a W3C Design Tokens Community Group format file (`design-tokens.json`) plus a short companion TypeScript module (`src/lib/design-tokens.ts`) that re-exports the tokens with type-safe enums. Tailwind v4 already supports design tokens via `@theme`, so we map the JSON into CSS custom properties with a small build step. Future proposals (gherkin, LikeC4, partner SDK) consume the same JSON.

The proposal also adds the three cross-cutting specs that every later proposal will need:

- A **viewer/session spec** (the `Viewer` discriminated union reused by every page)
- A **routing spec** (the canonical `/[lang]/...` route table and the auth/middleware guard rules)
- A **i18n copy spec** (the `i18n.ts` dictionary shape, the URL → cookie → DB preference resolution order, the missing-key fallbacks)

These three specs are the connective tissue between the architecture (proposal 01), the contract (proposal 02), the gherkin features (proposal 04), and the 09-iteration feature work.

## What Changes

- Add `design-tokens.json` (W3C DTCG format) at repo root containing:
  - **Color**: brand palette (`brand-yellow`, `brand-cream`, `brand-grey`, `brand-dark`, `brand-white`, `brand-error`, `brand-success`), semantic colors (`background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`), status colors
  - **Typography**: font families (`font-display`, `font-body`), weights, sizes (`text-xs` … `headline-xl`), letter spacings, line heights, text cases
  - **Spacing**: `1` … `16` (rem-based, 4 px grid)
  - **Radius**: `sm` (2 px), `md` (4 px), `lg` (8 px), `none`, `full`
  - **Border**: `unveiled` (3 px mobile / 4 px desktop), `input`, `card`
  - **Shadow**: `unveiled-sm` (4 px offset), `unveiled` (6 px), `unveiled-lg` (12 px), and the hover state (`unveiled-hover`)
  - **Motion**: durations (`fast` 120 ms, `base` 180 ms, `slow` 240 ms), easings (`easeOut`, `easeInOut`), and a single "card hover" transition
  - **Breakpoint**: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536
  - **Z-index**: `base`, `dropdown`, `sticky`, `modal`, `toast`
- Add `src/lib/design-tokens.ts` that imports the JSON and exports typed enums (`BrandColor`, `Spacing`, `Radius`, `Shadow`, `Breakpoint`, `MotionDuration`, `MotionEasing`).
- Update `src/styles/global.css` to declare the CSS custom properties from `design-tokens.json` via a `bun run tokens:gen` step. The current `:root` block is replaced with the generated output.
- Update `tailwind.config` (Tailwind v4 `@theme inline`) to consume the same generated variables.
- Update `src/components/ui/unveiled-primitives.tsx` so each variant reads from the typed enums instead of magic strings.
- Add the three cross-cutting specs:
  - `openspec/specs/viewer-session/spec.md` (new capability)
  - `openspec/specs/routing/spec.md` (new capability)
  - `openspec/specs/i18n-copy/spec.md` (new capability)
- Add `bun run tokens:gen` and `bun run tokens:check` scripts; the check fails on drift.
- Update `docs/guidelines.md` to point at `design-tokens.json` and the generated CSS.

## Capabilities

### New Capabilities

- `design-tokens`: W3C DTCG design tokens for color, typography, spacing, radius, border, shadow, motion, breakpoint, and z-index, generated into CSS custom properties and typed TypeScript enums, with a drift check that fails `bun run check` on mismatch.
- `viewer-session`: The canonical `Viewer` discriminated union and the rules for hydrating it from Better Auth + Drizzle, the role/permission matrix, the redirect-after-login table, and the requirements for any page that renders viewer-aware navigation.
- `routing`: The canonical `/[lang]/...` route table, the public vs. member vs. partner vs. admin surface map, the middleware guard order, and the rules for adding a new route (must appear in this spec, in the LikeC4 model, and in the TypeSpec contract).
- `i18n-copy`: The shape of the `i18n.ts` dictionary, the URL → cookie → DB preference resolution order, the DE/EN parity rules, the missing-key fallback (`{i18n.missing:key}`), and the rules for adding copy (must be added to both languages before merging).

### Modified Capabilities

- `app-shell`: The shell's color, typography, border, shadow, and motion tokens SHALL come from `design-tokens.json`. The shell's nav items and language toggle SHALL be wired through the `viewer-session` and `i18n-copy` specs.
- `ui-system`: Every UI primitive variant SHALL reference a typed design-token enum, not a magic string or raw hex.

## Impact

- New devDeps: `style-dictionary` (optional; we can hand-write the generator as ~100 lines if we want zero new deps), `tinycolor2` (only if we need to derive status colors from brand colors at build time).
- New files: `design-tokens.json`, `src/lib/design-tokens.ts`, `scripts/generate-design-tokens.ts`, `scripts/check-design-tokens.ts`, `src/styles/generated/tokens.css` (committed), `openspec/specs/viewer-session/spec.md`, `openspec/specs/routing/spec.md`, `openspec/specs/i18n-copy/spec.md`.
- New scripts: `tokens:gen`, `tokens:check`.
- Modified files: `src/styles/global.css`, `src/components/ui/unveiled-primitives.tsx`, `docs/guidelines.md`, `package.json`, `biome.json` (ignore `src/styles/generated/**`), `openspec/specs/app-shell/spec.md`, `openspec/specs/ui-system/spec.md` (both get a `MODIFIED Requirements` block pointing at the new specs).
- No database change, no runtime semantic change in this iteration. The gherkin proposal (`04-gherkin-specs-by-domain.md`) and 09-iteration features consume the new tokens/capabilities.
