## Context

`bun run check` is the umbrella gate for the repo (defined in the root `package.json` `scripts.check`). It runs, in order: `astro-check-proxied`, `biome check .`, `specs:check`, `tokens:check`, `ladle:coverage`, `wrangler:check`, and `arch:check`. The second of these gates — `biome check .` — is currently broken: it reports 99 errors and 211 warnings. The two root causes are:

1. **Configuration drift.** `biome.json:2` declares `"$schema": "https://biomejs.dev/schemas/2.4.13/schema.json"` but the installed Biome CLI is **2.5.0**. The schema URL is the source of editor IntelliSense, not a runtime guard, but Biome warns about the mismatch. Additionally, `biome.json:57` uses the deprecated `linter.rules.recommended: true` field; Biome 2.x prefers the top-level `linter.rules` driven by `preset: { recommended: true }` (or simply relying on the default ruleset, which already includes the recommended rules).
2. **Mechanical formatting and import-sort drift.** The codebase was migrated into a Bun workspaces monorepo (changes under `openspec/changes/archive/2026-06-19-*` and `2026-06-20-*`) but a single `bunx biome check --write .` was never re-run after the move. As a result, ~80 files have unsorted imports/exports, unused imports, and formatting drift.

Because `biome check` is the second gate in `bun run check`, every other gate downstream is currently invisible. Fixing the config and applying the auto-fixes restores the pipeline.

## Goals / Non-Goals

**Goals:**

- Make `biome check .` a true gate: it exits 0 with zero errors and zero (or only documented baseline) warnings on the current `main`.
- Sync the `biome.json` `$schema` to the installed Biome CLI version (2.5.0).
- Replace the deprecated `linter.rules.recommended: true` field with the modern `preset` syntax (or remove it if the default already enables the recommended ruleset).
- Capture the gate behavior as a new requirement under the `monorepo-tooling` capability so future drift is detectable.
- Document the contributor workflow (`bun run format` before `bun run check`) so the gate stays green.

**Non-Goals:**

- Re-architecting the lint configuration. We are not splitting per-package configs, not adding new rule groups, and not enabling per-package `biome.json` files.
- Adding a husky pre-commit hook in this change. The dev plan flags it as optional; we will leave it for a follow-up.
- Touching any file the Biome config explicitly excludes (`dist`, `.astro`, `drizzle`, `_old_app`, generated artifacts, `.svg`, `.md`, Ladle test stories, etc.). The `biome.json` `files.includes` block is the source of truth for what Biome sees.

## Decisions

### Decision 1: Use `preset: { recommended: true }` rather than relying on the default ruleset

**Choice.** Set `linter.rules.preset.recommended: true` (or the top-level `linter.preset` if Biome 2.5 supports it) and keep an empty `linter.rules` object. The deprecated `linter.rules.recommended: true` field is removed.

**Rationale.** Being explicit about the preset makes the configuration self-documenting — a reader can see the ruleset intent at a glance. It also matches the syntax Biome's own upgrade guides recommend.

**Alternatives considered.**

- *Remove `recommended` entirely and rely on the default.* The Biome 2.x default is already the recommended ruleset, so this would work. We rejected it because it hides the intent: a future contributor reading `biome.json` would not know whether the ruleset is intentional or default.
- *Pin a specific ruleset version.* Biome does not support versioning the ruleset, only the CLI. Not applicable.

### Decision 2: Update `$schema` to match the installed CLI version (2.5.0)

**Choice.** `"$schema": "https://biomejs.dev/schemas/2.5.0/schema.json"`.

**Rationale.** The schema URL drives editor IntelliSense. A mismatch produces noisy warnings and missing completions. The CLI is already 2.5.0 (pinned in `package.json`), so the schema should follow.

**Alternatives considered.**

- *Remove the `$schema` field.* Rejected — losing editor IntelliSense is a step backward.
- *Downgrade the CLI to 2.4.13.* Rejected — the CLI is the canonical version, not the schema.

### Decision 3: Apply `biome check --write` in one pass, then review the diff holistically

**Choice.** Run `bunx biome check --write .` once, commit the resulting diff, and review it as a single mechanical commit (or split by directory if the diff is too large for a single PR review).

**Rationale.** The diff is mechanical (import sort, export sort, formatter, unused-import removal). Reviewing it in one pass is faster than trying to constrain Biome to a subset of files. The `bun run check` and unit-test gates verify the result.

**Alternatives considered.**

- *Run Biome per-file to limit the blast radius.* Rejected — adds overhead with no quality benefit.
- *Run Biome only on touched files in the next PR.* Rejected — leaves the gate broken in the meantime.

### Decision 4: Do not change `package.json` `scripts.check`

**Choice.** Keep the `check` script as-is (it already runs `biome check .` after `astro-check-proxied`).

**Rationale.** The `check` script is intentionally a strict gate. Adding `biome check --write` to it would mask real issues by auto-fixing on every run, which is not what a CI gate should do. Contributors run `bun run format` locally before `bun run check`, which is the established workflow.

**Alternatives considered.**

- *Add `biome check --write` to `check`.* Rejected — would silently modify files in CI, making the gate unreliable.
- *Replace `biome check` with `biome check --write` in the lint script.* Rejected — same reason.

## Risks / Trade-offs

- **[Risk] Auto-fix removes a provably-unused import that is actually needed as a side-effect import.** Biome's `noUnusedImports` only removes imports that have no references in the file; side-effect imports (`import "polyfill"`) are preserved because they are not "unused" in the lint rule's sense. **Mitigation:** `bun run check` and `bun test` both run after the fix; any break surfaces immediately.
- **[Risk] Large auto-fix diff is hard to review.** The diff may touch 50+ files. **Mitigation:** The diff is mechanical. We commit it as a single change with a clear message; the `bun run check` gate verifies the result.
- **[Risk] Biome 2.5.0 introduces new rules that fire on previously-clean code.** **Mitigation:** The 99-error count is the baseline we are fixing. If new rules appear, they would be additive; we accept them and fix them in this change.
- **[Risk] `$schema` is updated before the CLI is pinned in a CI image.** The CLI is already pinned to `2.5.0` in `package.json`; CI uses `bun install` which resolves to the lockfile. No action needed.
- **[Trade-off] We capture the gate as a spec requirement, not as a CI test.** The CI test is `bun run check`. The spec makes the behavior visible to OpenSpec validators so future contributors can see it as a contract.

## Migration Plan

This change has no runtime impact and no deploy order concerns. The steps are:

1. Update `biome.json` (`$schema` + `preset`).
2. Run `bunx biome check --write .`.
3. Run `bunx biome check .` to confirm zero errors and zero (or documented baseline) warnings.
4. Run `bun run check` to confirm the rest of the pipeline still passes.
5. Run `bun test` to confirm the unit suite still passes.
6. Commit `biome.json` and the auto-fixed files in one commit (or split by directory if the reviewer prefers).
7. Archive the change via `openspec archive biome-lint-and-config-sync` once the PR merges.

**Rollback strategy.** Revert the commit. Biome config and formatting changes are isolated to `biome.json` and a mechanical set of file rewrites; reverting the commit restores the previous state.

## Open Questions

_None._ The change is mechanical and the design is fully constrained by the dev-plan file in `.development-plan/12-iteration/13-biome-lint-and-config-sync.md`.
