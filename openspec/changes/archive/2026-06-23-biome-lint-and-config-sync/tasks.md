## 1. Sync `biome.json` to the installed CLI version and modern `preset` syntax

- [x] 1.1 Update `biome.json` `$schema` to `https://biomejs.dev/schemas/2.5.0/schema.json` (matching the installed Biome CLI version reported by `bunx biome --version`).
- [x] 1.2 Replace the deprecated `linter.rules.recommended: true` field with the modern `preset` syntax (for example `linter.rules.preset.recommended: true`) OR remove the field entirely and rely on the default recommended ruleset.
- [x] 1.3 Run `bunx biome migrate` (if the CLI exposes the command) to apply any further automated config migrations Biome 2.5.0 recommends.

## 2. Auto-fix the mechanical lint/format drift in one pass

- [x] 2.1 Run `bunx biome check --write .` from the repo root to auto-fix the import-sort, export-sort, unused-import, and formatting drift.
- [x] 2.2 Inspect the resulting `git status` to confirm the diff is mechanical (no logic changes) and the file count is in the expected range.
- [x] 2.3 Spot-check a handful of auto-fixed files (one per affected package, plus `scripts/`, `tests/`, `architecture/`, `openspec/`) to confirm the fixes are benign — for example, import order, removed unused imports, and quote/semicolon/trailing-comma formatting.

## 3. Verify the gates are green and the spec is satisfied

- [x] 3.1 Run `bunx biome check .` and confirm it exits 0 with zero errors and zero (or only documented baseline) warnings.
- [x] 3.2 Run `bun run check` end-to-end and confirm the full pipeline exits 0 (astro check + biome + specs + tokens + ladle coverage + wrangler + arch).
- [x] 3.3 Run `bun test` (or `bun run test:workspaces` if the project uses it) and confirm the unit suite still passes after the auto-fix. _(Verified pre-existing failures in `packages/app/src/components/unveiled/discovery-map.test.tsx` are unrelated to this change — confirmed by stashing the diff and reproducing the same failures on `main`. 314/326 pass.)_
- [x] 3.4 Run `openspec validate biome-lint-and-config-sync` and confirm it exits 0.

## 4. Document the contributor workflow

- [x] 4.1 Confirm `AGENTS.md` already documents `bun run format` as the auto-fix command and `bun run check` as the verification gate; updated the pinned-version reference from "Biome 2.4" to the CLI-reported version.
- [x] 4.2 In the PR description, note the large auto-fix diff is mechanical and the `bun run check` + `bun test` gates verify the result. _(Note for the human reviewer: in practice no auto-fix was needed — the biome drift was already resolved by a prior commit; this change only syncs the config schema and removes the deprecated `recommended` field, plus the allowlist update for `monorepo-tooling/`.)_

## 5. Archive the change

- [ ] 5.1 Once the PR merges, run `openspec archive biome-lint-and-config-sync` to move the change into `openspec/changes/archive/<date>-biome-lint-and-config-sync/` and fold the spec delta into `openspec/specs/monorepo-tooling/spec.md`.
