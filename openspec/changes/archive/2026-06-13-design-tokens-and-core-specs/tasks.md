## 1. Author `design-tokens.json`

- [x] 1.1 Create `design-tokens.json` at the repo root using the W3C DTCG format with groups for color (brand, semantic, status), typography, spacing, radius, border, shadow, motion, breakpoint, and z-index
- [x] 1.2 Add `$description` fields to every group explaining its purpose and the values it covers
- [x] 1.3 Confirm the values match the existing hard-coded values in `src/styles/global.css` and `src/components/ui/unveiled-primitives.tsx` so the migration is byte-identical

## 2. Generator and Drift Check Scripts

- [x] 2.1 Create `scripts/generate-design-tokens.ts` that reads `design-tokens.json` and emits `src/styles/generated/tokens.css` (CSS custom properties on `:root` using the `--unveiled-*` prefix)
- [x] 2.2 Extend `scripts/generate-design-tokens.ts` to also emit a `.d.ts` companion so the typed enum module can import the JSON-shaped types
- [x] 2.3 Create `scripts/check-design-tokens.ts` that diffs the generated CSS against the JSON and exits non-zero on drift
- [x] 2.4 Add `tokens:gen` and `tokens:check` scripts to `package.json`
- [x] 2.5 Wire `bun run tokens:check` into `bun run check` so drift fails the build
- [x] 2.6 Run `bun run tokens:gen` to commit the initial `src/styles/generated/tokens.css`
- [x] 2.7 Add `src/styles/generated/**` to the Biome ignore list in `biome.json`

## 3. Typed Enum Module

- [x] 3.1 Create `src/lib/design-tokens.ts` that imports the generated `.d.ts` companion and exports `as const` objects for `BrandColor`, `SemanticColor`, `StatusColor`, `FontFamily`, `FontSize`, `Spacing`, `Radius`, `Border`, `Shadow`, `MotionDuration`, `MotionEasing`, `Breakpoint`, and `ZIndex`
- [x] 3.2 Derive string-literal union types for each enum (`type BrandColor = (typeof BrandColor)[keyof typeof BrandColor]`)
- [x] 3.3 Add a unit test that asserts each enum matches the corresponding group in `design-tokens.json`

## 4. Wire Tokens Into global.css and Tailwind v4

- [x] 4.1 Update `src/styles/global.css` to import the generated `tokens.css` and replace the existing `:root` block with the generated custom properties
- [x] 4.2 Update the Tailwind v4 `@theme inline` block in `src/styles/global.css` to reference the generated CSS custom properties
- [x] 4.3 Visually verify the brand colors, typography, radii, borders, shadows, and motion values are byte-identical to the previous hard-coded values

## 5. Migrate `unveiled-primitives.tsx` Variants

- [x] 5.1 Replace magic strings in the most-trafficked button, badge, and panel variants with the typed enum members from `src/lib/design-tokens.ts`
- [x] 5.2 Mark any variants that still use magic strings with a `// TODO: port to <EnumName>` comment
- [x] 5.3 Run the existing visual regression / unit tests to confirm no visual drift
- [x] 5.4 Add a Biome lint rule or CI grep that flags new magic strings in `unveiled-primitives.tsx` going forward

## 6. Cross-Cutting Specs Land in Main Spec Tree

- [x] 6.1 Move the new `design-tokens` spec from `openspec/changes/design-tokens-and-core-specs/specs/design-tokens/spec.md` to `openspec/specs/design-tokens/spec.md` (or sync via the archive flow)
- [x] 6.2 Move the new `viewer-session` spec to `openspec/specs/viewer-session/spec.md`
- [x] 6.3 Move the new `routing` spec to `openspec/specs/routing/spec.md`
- [x] 6.4 Move the new `i18n-copy` spec to `openspec/specs/i18n-copy/spec.md`
- [x] 6.5 Confirm the MODIFIED `app-shell` and `ui-system` deltas in `openspec/changes/design-tokens-and-core-specs/specs/` are correctly applied to the main specs at `openspec/specs/app-shell/spec.md` and `openspec/specs/ui-system/spec.md` (or deferred to the archive flow)

## 7. Documentation Update

- [x] 7.1 Update `docs/guidelines.md` to remove the hand-transcribed hex values and pixel measurements
- [x] 7.2 Replace them with references to token names in `design-tokens.json` and the generated CSS variables
- [x] 7.3 Add a "how to add or change a token" section pointing at `design-tokens.json` and the `bun run tokens:gen` / `bun run tokens:check` scripts

## 8. Verification

- [x] 8.1 Run `bun run check` (which now includes `bun run tokens:check`) and resolve any errors
- [x] 8.2 Run `bun run test` and resolve any failures
- [x] 8.3 Manually verify the brand colors, typography, borders, shadows, and motion values render identically to the pre-migration build in both DE and EN
  - Substituted for visual comparison: ran `bun run build` and inspected the compiled CSS bundle (`dist/client/_astro/base-layout.ekMCp80X.css`). All brand and semantic CSS variables resolve to byte-identical hex values (e.g. `--unveiled-color-brand-yellow: #faff86`, `--unveiled-color-brand-dark: #202621`, `--unveiled-color-semantic-muted-foreground: #2026219e` which is `rgb(32 38 33 / 0.62)` shorthand). Every existing utility class (`bg-brand-yellow`, `text-brand-dark`, `border-brand-dark`, etc.) resolves through the same chain.
- [x] 8.4 Open the dev server and trigger a missing-key fallback to confirm the `{i18n.missing:key}` placeholder is visible (if the i18n-copy spec is exercised end-to-end in this iteration)
  - Out of scope for this iteration: the `i18n-copy` spec defines the missing-key contract, but the i18n runtime (`src/lib/i18n.ts`) does not yet implement it. The runtime implementation is a follow-up that lands with the 09-iteration feature work that consumes the spec. The spec file itself is landed in `openspec/specs/i18n-copy/spec.md` as the contract.
