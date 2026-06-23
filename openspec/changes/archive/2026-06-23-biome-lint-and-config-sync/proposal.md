## Why

`bun run check` includes `biome check .` as one of its gates, but running it today fails with **99 errors** and **211 warnings**: ~80 auto-fixable formatting and linting issues (`Sort these imports`, `Sort these exports`, unused imports, formatter discrepancies) plus ~20 configuration warnings caused by a `$schema` version drift (`biome.json` references `2.4.13` while the installed CLI is `2.5.0`) and the deprecated `recommended` field (the modern syntax is `preset`). Because `biome check` is the second gate in `bun run check` (right after `astro-check-proxied`), this single failing gate blocks the entire pipeline. The mechanical auto-fixes plus a small config sync make the gate a *true* gate again, with no behavior change to the application.

## What Changes

- Run `bunx biome check --write .` to auto-fix the ~80 import-sort, export-sort, unused-import, and formatting issues across `packages/`, `scripts/`, `tests/`, `architecture/`, and `openspec/`.
- Update `biome.json`:
  - Change `"$schema"` to match the installed Biome CLI version (currently `2.5.0`).
  - Replace the deprecated `recommended` field with `preset: { recommended: true }` (or remove it if the default already enables the recommended ruleset).
- Run `bunx biome migrate` (if available) to apply any further automated config migrations.
- Re-run `bunx biome check .` and assert zero errors and zero (or only documented baseline) warnings.
- Document the local workflow: contributors run `bun run format` (which calls `biome check --write`) before `bun run check`, so the check gate is a real verification, not a noise generator.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `monorepo-tooling`: the `biome check` gate becomes a true gate — `biome check .` reports zero errors and zero (or only documented baseline) warnings. The config schema version matches the installed CLI version, and the deprecated `recommended` field is replaced with the modern `preset` syntax.

### Removed Capabilities

_None._

## Impact

- **New files:** _none._
- **Modified files:**
  - `biome.json` — `$schema` updated to match the installed CLI; `recommended` replaced with `preset`.
  - Many files across `packages/`, `scripts/`, `tests/`, `architecture/`, and `openspec/` — auto-fixed by `biome check --write` (mechanical: import/export sort, unused-import removal, formatting).
  - `scripts/check-legacy-ui-references.ts` + `openspec/specs/monorepo-tooling/spec.md` — the `monorepo-tooling/` spec legitimately names the `mantine`/`shadcn`/`*-replica/` rule set that this gate enforces, so the spec path is added to the allowlist (same pattern the previous commit used for `design-system-package/` and `heroui-ladle-design-system/`).
- **Removed files:** _none._
- **Dependencies changed:** _none._ (Biome is already a devDependency; the CLI version is already `2.5.0`.)
- **Risks:**
  - **Large auto-fix diff.** `biome check --write` may modify 50+ files. Mitigation: the diff is mechanical (import sort, formatting, provably-unused imports) and can be reviewed in one pass. The `bun run check` gate verifies the result.
  - **Unused-import removal breaks runtime.** If Biome removes an import the codebase still relies on (e.g. a side-effect import), the app could break. Mitigation: `noUnusedImports` only removes imports that are provably unused; side-effect imports are preserved. The `bun run check` and `bun test` gates verify the app still works.
