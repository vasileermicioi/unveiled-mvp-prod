## Context

Unveiled's visual language is currently defined in five different places, none of which is authoritative:

- `src/styles/global.css` (Tailwind v4 `@theme` + `:root` custom properties + utility classes)
- `src/components/ui/unveiled-primitives.tsx` (button/badge/panel `cva` variants)
- `src/components.json` (a leftover shadcn config that has been disabled but is still present in the repo)
- `docs/guidelines.md` (narrative brand spec with hand-transcribed hex values)
- `_old_app/index.css` (a stale copy of the legacy stylesheet, never imported but checked in)

This drift creates three concrete problems:

1. A new contributor cannot answer "what is the brand-yellow hex?" from a single file.
2. Downstream surfaces that need to consume the design system (gherkin feature files, LikeC4 model tags, the future partner/admin SDKs, and any future React Native or Vue port) all have to re-derive the same constants by hand.
3. The current `unveiled-primitives.tsx` variants pass magic strings for colors, radii, and shadows; nothing in the type system prevents a variant from referencing a color that has since been renamed or removed.

The iteration plan adds several cross-cutting specs (viewer-session, routing, i18n-copy) and a gherkin layer that references design tokens by name. Both efforts need a machine-readable, version-controlled source of truth for those tokens.

This change introduces a W3C Design Tokens Community Group format file (`design-tokens.json`) as the single source of truth, a small generator that emits CSS custom properties and a typed TypeScript module, and a drift check that fails the build if the generated output ever disagrees with the JSON.

## Goals / Non-Goals

**Goals:**

- A single, machine-readable, version-controlled source of truth for every design token (color, typography, spacing, radius, border, shadow, motion, breakpoint, z-index).
- Tailwind v4 `@theme inline` and `:root` custom properties generated from the same JSON, so CSS and utilities stay aligned with the tokens.
- A typed TypeScript module (`src/lib/design-tokens.ts`) that re-exports the tokens as enums, so variant code in `unveiled-primitives.tsx` can reference `BrandColor.BrandYellow` instead of `"#FACC15"`.
- Three cross-cutting OpenSpec specs (`viewer-session`, `routing`, `i18n-copy`) that downstream proposals (gherkin, LikeC4 tags, partner SDK) can reference by capability name.
- A drift check (`bun run tokens:check`) that fails `bun run check` when the generated `src/styles/generated/tokens.css` is out of sync with `design-tokens.json`.
- Updated `docs/guidelines.md` that points contributors at the JSON, not at a hex value.

**Non-Goals:**

- No runtime behavioral change. The visual output for every existing component MUST be byte-identical after the migration.
- No new design tokens. This change is purely a refactor of how the existing tokens are stored; the palette, radii, shadows, and motion values are not re-tuned.
- No new public-facing page or component.
- No new dependency unless strictly necessary. The generator is small enough to hand-write in ~100 lines; `style-dictionary` and `tinycolor2` are only added if the hand-rolled approach proves insufficient.
- No migration of copy, viewer, or routing code beyond the spec definitions. The spec artifacts define the contract; their consumers land in 09-iteration.

## Decisions

### D1 — W3C DTCG format for `design-tokens.json`

Use the [W3C Design Tokens Community Group format](https://design-tokens.github.io/community-group/format/) (the `$value` / `$type` / `$description` shape) rather than a custom shape or Tailwind's `theme.extend` JS object.

**Rationale:** the DTCG format is a published standard supported by Style Dictionary, Token Studio, and the broader tooling ecosystem. It is JSON, not TypeScript, so it can be consumed by gherkin feature files (which can be generated from it), by the LikeC4 model generator, and by any future SDK in any language, without needing a TS runtime.

**Alternatives considered:**

- A hand-rolled `src/lib/design-tokens.ts` object — rejected because it ties the tokens to the TypeScript runtime, blocks non-JS consumers, and forces the gherkin layer to either re-import TS or maintain a parallel copy.
- Tailwind's `theme.extend` — rejected because Tailwind v4's `@theme` is CSS-side, not data-side, so it cannot be the source of truth that the gherkin layer reads from.

### D2 — Hand-rolled generator, no `style-dictionary` dependency (initially)

Author `scripts/generate-design-tokens.ts` and `scripts/check-design-tokens.ts` as plain TypeScript runnable under Bun. They read `design-tokens.json`, emit `src/styles/generated/tokens.css` (committed) and a `.d.ts` companion that the typed enum module imports.

**Rationale:** the full token surface fits in ~150 lines of code; pulling in `style-dictionary` adds a transitive dependency tree, slows the install, and brings a configuration model that is overkill for this size of project. If the token surface grows past ~200 entries or we add multiple output targets (e.g. iOS/Android XML), we revisit and adopt Style Dictionary.

**Alternatives considered:**

- `style-dictionary` out of the gate — rejected for the reasons above; tracked as a future option.
- A JSON Schema + JSON Schema → CSS codegen tool — rejected; the hand-roll is shorter than the config file the codegen tool would require.

### D3 — Generate to a committed file, not at runtime

The generated `src/styles/generated/tokens.css` is committed to the repo and imported from `src/styles/global.css`. Generation runs on demand via `bun run tokens:gen`; drift is detected by `bun run tokens:check`, which is wired into `bun run check`.

**Rationale:** committing the generated file makes the PR diff explicit (reviewers can see exactly what CSS custom properties changed), avoids a runtime dependency on the JSON file being present in the deploy artefact, and keeps the worker cold start fast. The trade-off is that contributors must remember to regenerate after editing the JSON; the check script catches the slip.

**Alternatives considered:**

- Runtime import in `global.css` via `?raw` or a Vite alias — rejected because the Cloudflare Workers adapter cannot ship the JSON file with the bundle, and dynamic CSS at runtime is not supported by Astro's CSS pipeline.
- A prebuild hook that auto-regenerates — rejected because it hides drift from code review; a checked-in file makes the diff visible.

### D4 — Typed enum module, not just inferred types

`src/lib/design-tokens.ts` re-exports the token groups as `const` objects plus derived types (`type BrandColor = (typeof BrandColor)[keyof typeof BrandColor]`). Component code uses `BrandColor.BrandYellow`, not the raw string `"brand-yellow"`.

**Rationale:** the enums catch typos at compile time, give editors autocomplete, and let `biome` / `tsc` flag a variant that references a removed or renamed token. Inferring types from the JSON's `$value` would be possible, but the explicit `as const` shape is more readable in variant code.

**Alternatives considered:**

- A single `Tokens` namespace with `Tokens.color.brandYellow` — rejected because enums are more discoverable in editor autocomplete and match the shadcn/Radix conventions already used elsewhere in the codebase.

### D5 — Cross-cutting specs authored as new capabilities

The three cross-cutting specs (`viewer-session`, `routing`, `i18n-copy`) are new capabilities rather than additions to existing capabilities like `app-shell` or `auth`.

**Rationale:** each of these specs describes a distinct, reusable contract that more than one downstream proposal will reference. Keeping them as their own capabilities means a future change to the `Viewer` shape (e.g. adding a `Guest` variant) is a delta on `viewer-session`, not a sprawling edit across `app-shell`, `auth`, and `data-access`.

**Alternatives considered:**

- Folding the viewer/session rules into the `app-shell` and `auth` specs — rejected because it duplicates the rules in two places and makes it easy for one of them to drift.
- Putting all three in a single `cross-cutting` capability — rejected because they are unrelated domains (auth vs. routing vs. i18n) and the OpenSpec toolchain treats one capability per file as the convention.

### D6 — Specs use ADDED-only Requirements blocks; modified capabilities use MODIFIED blocks pointing back

`app-shell` and `ui-system` get a `## MODIFIED Requirements` block that references the new specs by capability. The new capabilities themselves use `## ADDED Requirements` blocks with concrete scenarios.

**Rationale:** the MODIFIED blocks satisfy the OpenSpec rule that a change touching an existing capability must declare a delta; pointing at the new specs (rather than restating the rules) keeps `app-shell` and `ui-system` concise and avoids double-bookkeeping.

**Alternatives considered:**

- Restating every viewer/routing/i18n rule inside `app-shell` — rejected because the rules are the authority in their own capabilities; restating them creates two sources of truth.

## Risks / Trade-offs

- **Risk:** Contributors forget to run `bun run tokens:gen` after editing the JSON. → **Mitigation:** `bun run tokens:check` is part of `bun run check` (which already runs in CI and locally before commit).
- **Risk:** A variant in `unveiled-primitives.tsx` references a removed token by magic string, slipping past TypeScript because the JSON's values are strings. → **Mitigation:** the typed enum module forces all new variant code to use the enum; a follow-up task in 09-iteration can sweep magic strings to enum references.
- **Risk:** The generator grows unwieldy as tokens multiply. → **Mitigation:** the generator is split into `lib/emit-css.ts`, `lib/emit-types.ts`, and a small `index.ts` driver; each file is under 100 lines.
- **Risk:** The three new specs become sprawling wishlists and lose their value as contracts. → **Mitigation:** the OpenSpec instructions for spec authoring forbid speculative "future requirement" scenarios; each `#### Scenario` must describe current behavior or a change in this proposal.
- **Risk:** Adding `style-dictionary` later (D2) is a breaking change to the generator's CLI. → **Mitigation:** the generator's public surface is just `tokens:gen` and `tokens:check`; swapping the implementation behind those scripts is invisible to consumers.
- **Risk:** Drift between the new specs and the actual `i18n.ts` / `Viewer` / routing code surfaces later. → **Mitigation:** the existing TypeSpec `bun run specs:check` job does not validate these new capabilities; a follow-up proposal can wire them into a similar check, or rely on the gherkin proposal (`04-gherkin-specs-by-domain.md`) to bind code to spec scenarios.

## Migration Plan

1. Land `design-tokens.json`, the generator scripts, and the typed enum module in a single PR. The generated `tokens.css` is committed; `src/styles/global.css` imports it.
2. Update `unveiled-primitives.tsx` to use the typed enums for the most-trafficked variants (button, badge, panel) in the same PR. Variants that still use magic strings are flagged with a `// TODO: port to BrandColor enum` comment; the 09-iteration work sweeps them.
3. Author the three new specs and the MODIFIED blocks on `app-shell` and `ui-system` in the same PR.
4. Run `bun run check` (which now includes `bun run tokens:check`) and `bun run specs:check`; both must pass.
5. Rollback: revert the PR. The migration is purely additive (new files + a CSS import), and the visual output is byte-identical, so the revert is a clean revert of the single PR.

## Open Questions

- Should `biome.json` ignore the generated `src/styles/generated/**` directory, or should we format it with Biome as if it were hand-written? Current proposal: ignore it, since regenerating must not produce formatting noise.
- Should the typed enum module use `as const` objects or TypeScript `enum`s? `enum` is the more familiar shape but emits runtime code; `as const` is tree-shakeable. Current proposal: `as const` objects with derived types, matching the codebase's existing pattern in `src/lib/unveiled-view-models.ts`.
- Should the design-tokens.json file be the only source for the LikeC4 model's `color` tag values, or should LikeC4 keep its own enum? Decision deferred to the LikeC4 proposal (`01-likec4-architecture-diagrams.md`).
