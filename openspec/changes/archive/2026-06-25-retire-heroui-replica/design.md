## Context

`packages/design-system/src/heroui-replica/` was introduced in the iteration-13 plan (proposal §02, archived as `2026-06-18-heroui-ladle-design-system`) as a Ladle-only visual reference: 18 `Hero*.ladle.tsx` stories that mount raw HeroUI primitives to give contributors a quick visual sanity check. The folder was kept deliberately isolated from production: every file carries a `// @ladle-only` header, no production entry point may import from `@unveiled/design-system/heroui-replica`, and the `heroui-design-system-replica:check` script enforces the gate. The script checks co-location of every `Hero*.ladle.tsx` file with its `Hero*.tsx` primitive, theme-coverage parity with the design tokens, no hex literals, overview-completeness (one story per atom), and import isolation.

After proposals 02–10, every atom/molecule in the replica has a real, equivalent component in the design system, backed by a Ladle story of its own. Specifically:

- Every `Hero*.tsx` has an equivalent under `packages/design-system/src/atoms/<atom>/<atom>.tsx` or `packages/design-system/src/molecules/<molecule>/<molecule>.tsx` (e.g. `HeroButton` → `atoms/button/button.tsx`, `HeroField` → `molecules/field/field.tsx`).
- Every `Hero*.ladle.tsx` has an equivalent `<atom>.ladle.tsx` / `<molecule>.ladle.tsx` story, and the `Atoms / Overview` / `Molecules / Overview` groups mount one instance of every atom/molecule.
- The `design-system-overview.ladle.tsx` has been superseded by `packages/design-system/src/atoms/__overview__/overview.ladle.tsx`, which renders with the actual brand tokens instead of the HeroUI defaults.
- Change `2026-06-25-heroui-provider-becomes-design-system` (proposal 09) moved the `NextUIProvider` wrapper into `packages/design-system/src/providers/theme-provider.tsx` and reduced the replica's `provider.tsx` to a 4-line re-export shim — the only remaining consumer of the replica.

The replica is now redundant (every story has an equivalent), a maintenance hazard (HeroUI version bumps force replica updates unrelated to production), and a coverage burden on `bun run ladle:coverage`. This proposal retires it.

The state of the gates today:

- `check:atomic-layers` rejects any cross-layer import in `packages/design-system/src/{molecules,organisms,layouts,pages}/` that targets `./heroui-replica/...` (because the path is not on the allow-list).
- `tests/unit/design-system-hero-ui-boundary.test.ts` (added by proposal 09) rejects any file outside `packages/design-system/**` importing `@nextui-org/react` or `@heroui/*`.
- `tests/unit/app-design-system-import-boundary.test.ts` and `tests/unit/landing-design-system-import-boundary.test.ts` reject any `@unveiled/design-system/heroui-replica/*` import.
- The only remaining replica-specific gates are `packages/design-system/scripts/check-heroui-design-system-replica.ts` (co-location, theme coverage, hex literals, overview completeness) and `tests/unit/no-ladle-replica-in-production.test.ts` (production-import guard). Both become dead code once the folder is deleted.

## Goals / Non-Goals

**Goals:**

- Delete `packages/design-system/src/heroui-replica/` in its entirety (37 files).
- Delete `packages/design-system/scripts/check-heroui-design-system-replica.ts` and the `heroui-design-system-replica:check` script in both `package.json` files.
- Remove the `./heroui-replica` export from `packages/design-system/package.json`.
- Delete `tests/unit/no-ladle-replica-in-production.test.ts`; its invariant is subsumed by `check:atomic-layers` and the proposal-09 HeroUI-boundary test.
- Update the `bun run check:heroui-replica` umbrella to `bun run ladle:coverage && bun run check`.
- Update `AGENTS.md` to remove the replica references and the `// @ladle-only` policy exemption.
- Leave `bun run ladle:coverage`, `bun run ladle`, `bun run ladle:build` green; the remaining stories (atoms, molecules, organisms, layouts, pages, gherkin `@ladle` components, smoke stories) must still be discoverable.

**Non-Goals:**

- Replacing the replica's `design-system-overview.ladle.tsx` with the new `atoms/__overview__/overview.ladle.tsx` from proposal 02. That move already happened.
- Removing the `@ladle-only` invariant on `pages/` (kept; it's the new equivalent of the replica invariant and is enforced by `check-atomic-layers`).
- Updating the LikeC4 model. The model already excludes the replica (it's an internal implementation detail).
- Renaming the `HeroUIReplicaProvider` symbol or removing its re-export from the replica `index.ts` — both go away with the folder.
- Touching any production code under `packages/app/src/**` or `packages/landing/src/**` (no consumer imports the replica today).

## Decisions

### Decision: Delete the entire `heroui-replica/` directory in one commit

The 37 files are removed in a single `rm -rf packages/design-system/src/heroui-replica/` step. The deletion list (per iteration-13 plan §11):

```
packages/design-system/src/heroui-replica/
├── HeroBadge.{tsx,ladle.tsx}
├── HeroButton.{tsx,ladle.tsx}
├── HeroCard.{tsx,ladle.tsx}
├── HeroDivider.{tsx,ladle.tsx}
├── HeroDrawer.{tsx,ladle.tsx}
├── HeroField.{tsx,ladle.tsx}
├── HeroMenu.{tsx,ladle.tsx}
├── HeroModal.{tsx,ladle.tsx}
├── HeroPanel.{tsx,ladle.tsx}
├── HeroSelectInput.{tsx,ladle.tsx}
├── HeroStatPanel.{tsx,ladle.tsx}
├── HeroStatePanel.{tsx,ladle.tsx}
├── HeroTableShell.{tsx,ladle.tsx}
├── HeroTabs.{tsx,ladle.tsx}
├── HeroTextArea.{tsx,ladle.tsx}
├── HeroTextInput.{tsx,ladle.tsx}
├── HeroToast.{tsx,ladle.tsx}
├── design-system-overview.ladle.tsx
├── index.ts
├── provider.tsx               # 4-line re-export shim from proposal 09
└── story-backdrop.tsx
```

**Rationale:** the replica is an all-or-nothing surface — partial deletion leaves orphan imports in `provider.tsx` and `index.ts`. The gate script's co-location rule (every `Hero*.ladle.tsx` must sit next to a `Hero*.tsx`) is what made the folder cohesive; without the gate, partial deletion produces misleading "missing companion" failures. One `rm -rf` is the simplest atomic operation.

**Alternatives considered:**

- Keep the `provider.tsx` shim as a `// @ladle-only` re-export for any future Ladle story that needs HeroUI context outside the replica. Rejected: every Ladle story in the design system today mounts `UnveiledThemeProvider` directly from `@unveiled/design-system` (proposal 09). No consumer remains.
- Keep `HeroUITokens` (`heroUITokens` re-exported from `index.ts`) as a tiny utility in `lib/`. Rejected: nothing outside the replica imports `heroUITokens`. Grep confirms zero consumers.
- Keep `story-backdrop.tsx` (the `AtomStoryBackdrop` component) and move it under `packages/design-system/src/atoms/backdrop/`. Rejected: `backdrop/` already exists and exports its own `AtomStoryBackdrop`. The replica's `story-backdrop.tsx` is a duplicate that nothing imports.

### Decision: Drop the `heroui-replica` export from `packages/design-system/package.json`

Remove the line `"./heroui-replica": "./src/heroui-replica/index.ts"` from `exports`. The `tests/unit/app-design-system-import-boundary.test.ts` and `tests/unit/landing-design-system-import-boundary.test.ts` tests already forbid `@unveiled/design-system/heroui-replica/*` imports; the export becomes unused.

**Rationale:** keeping a dead export is a maintenance hazard (a future contributor might assume the replica is still available and start writing stories against it). The export is removed at the same time as the folder so the API surface stays honest.

**Alternatives considered:**

- Mark the export as deprecated with a comment. Rejected: there are no consumers; the deprecation has no audience.
- Move the export to a `replica` (no heroui prefix) sub-path. Rejected: the name `heroui-replica` already leaks the implementation detail; renaming without removing perpetuates the leak.

### Decision: Drop `heroui-design-system-replica:check` from both `package.json` files

Remove the script from `packages/design-system/package.json` (where it ran `bun scripts/check-heroui-design-system-replica.ts`) and from the root `package.json` (where it ran the same script via `bun packages/design-system/scripts/check-heroui-design-system-replica.ts`). Update the root `bun run check:heroui-replica` umbrella to `bun run ladle:coverage && bun run check` (the umbrella keeps its name for continuity; it is the iteration-13 plan's "replica coverage check" minus the now-retired replica check).

**Rationale:** the gate is dead code with the folder gone. Running it would error with "script not found" — confusing for future contributors. Removing it is the honest outcome.

**Alternatives considered:**

- Rename the umbrella to `bun run check:ladle-coverage`. Rejected: out of scope (the umbrella name is a CI alias, not a contract surface).
- Replace the script with a no-op that prints "replica retired". Rejected: dead code is a worse signal than absence.

### Decision: Delete `tests/unit/no-ladle-replica-in-production.test.ts`

The test walks 17 production entry points and asserts no entry imports a `*-replica/` path. After this change:

- `check:atomic-layers` already rejects any cross-layer import in `packages/design-system/src/{molecules,organisms,layouts,pages}/` that targets `./heroui-replica/...`.
- `tests/unit/design-system-hero-ui-boundary.test.ts` (proposal 09) rejects any file outside `packages/design-system/**` importing `@nextui-org/react` or `@heroui/*` — the replica's only non-trivial dependency.
- `tests/unit/app-design-system-import-boundary.test.ts` and `tests/unit/landing-design-system-import-boundary.test.ts` reject any `@unveiled/design-system/heroui-replica/*` import.

The replica-specific test becomes a strict subset of those four gates. Deleting it is honest.

**Rationale:** keeping the test would force the test to maintain a list of "all paths that match `*-replica/`", a brittle pattern. With the folder gone, the pattern cannot match anything new.

**Alternatives considered:**

- Keep the test as a forward-looking guard against any future `*-replica/` folder. Rejected: `check:atomic-layers` already rejects `./heroui-replica/...` because the path is not on the allow-list; the cross-layer rule covers any future folder named `*-replica` as well (the regex matches the directory name, not a specific one).
- Refactor the test to be generic ("no file imports a path matching `*-replica/`"). Rejected: same coverage, more code; the four existing gates already cover the case.

### Decision: Update `AGENTS.md` to remove replica references

Four sections need edits:

- §3 file layout: remove the `heroui-replica/` entry from the `packages/design-system/src/` tree and the `gate scripts (atomic layers, styling ownership, replica, tokens, coverage)` comment in the `scripts/` line.
- §4 conventions: remove the `// @ladle-only` policy exemption (the only permitted exception was for `src/components/ui/heroui-replica/`).
- §7 toolchain commands: remove the entries for `bun run heroui-design-system-replica:check` and update the `bun run check:heroui-replica` entry to read `bun run ladle:coverage + bun run check`.
- §7 (test:unit row): remove the `tests/unit/no-ladle-replica-in-production.test.ts` reference.

**Rationale:** AGENTS.md is the canonical contributor manual (per `openspec/config.yaml`); leaving replica references would mislead future contributors into looking for a folder that no longer exists.

### Decision: Drop the `MODIFIED Requirements` for `Replica provider is a re-export of the production provider`

The `design-system-package` spec has a `Replica provider is a re-export of the production provider` scenario inside the `HeroUI is a private implementation detail of the design system` requirement (added in proposal 09). With the replica deleted, that scenario is moot — the file it references (`packages/design-system/src/heroui-replica/provider.tsx`) no longer exists. The scenario is removed as part of the MODIFIED block in this change's spec delta. The remainder of the requirement (no HeroUI import escapes the design system; boundary test runs as part of `bun run check`) is unaffected.

## Risks / Trade-offs

- **Gherkin coverage drift** → if a gherkin feature file references `@ladle(component=HeroButton, story=...)` and the new `Button.ladle.tsx` exports a story with a different name, the coverage script will flag a drift. Mitigation: a precondition in §1 of `tasks.md` runs `bun run ladle:coverage` and confirms exit 0 before the deletion. A grep of `tests/features/**/@ladle(component=Hero*)` returns three matches in `tests/features/shell/heroes/hero-cta.feature` referencing `HeroCta` (an organism from proposal 04), not the replica — confirmed by inspecting the file. No replica stories are referenced by gherkin.
- **Ladle sidebar regression** → the sidebar groups stories by file path; deleting the replica shrinks the sidebar. The remaining groups (Atoms, Molecules, Organisms, Templates, Pages) are intentional. Mitigation: `bun run ladle` is run as part of verification; the sidebar must still list every non-replica story.
- **`HeroUIReplicaProvider` consumers** → the provider shim from proposal 09 was re-exported from the replica. After deleting the replica, the shim's only consumer is gone. Mitigation: the proposal-09 HeroUI-boundary test (`tests/unit/design-system-hero-ui-boundary.test.ts`) confirms no other file imports `HeroUIReplicaProvider`; the deletion precondition re-runs the test as part of the gate.
- **Coverage-script imports** → `packages/design-system/scripts/coverage.ts` (which `bun run ladle:coverage` invokes) walks `packages/design-system/src/`, `tests/features/`, and `tests/ladle/`. If the script had a hardcoded `heroui-replica/` glob, the deletion would silently miss the replica stories. Mitigation: tasks §1.2 greps the coverage script for `heroui-replica` and confirms zero hits (the script walks by directory, not by glob name).
- **TypeScript project references** → `packages/design-system/tsconfig.json` might include the replica folder via a wildcard. Mitigation: the tsconfig uses `include: ["src/**/*.ts", "src/**/*.tsx"]` (a non-recursive wildcard), so removing the folder removes it from the project; `bun run --filter @unveiled/design-system typecheck` is run as part of verification.
- **Biome formatting** → Biome's formatter might re-introduce formatting on the (now empty) directory. Mitigation: deletion is `rm -rf`, not "move to trash"; Biome does not recreate empty directories.

## Migration Plan

1. Preconditions (§1 of `tasks.md`): confirm `bun run ladle:coverage` exits 0 (no replica story is referenced by gherkin), grep the repo for `import .* from .*heroui-replica` and resolve any matches, grep the coverage script for `heroui-replica`.
2. Deletion (§2 of `tasks.md`): `rm -rf packages/design-system/src/heroui-replica/`, `rm packages/design-system/scripts/check-heroui-design-system-replica.ts`, `rm tests/unit/no-ladle-replica-in-production.test.ts`, remove the `heroui-replica` export from `packages/design-system/package.json`.
3. Script updates (§3 of `tasks.md`): remove `heroui-design-system-replica:check` from root and design-system `package.json`; simplify `check:heroui-replica` to `bun run ladle:coverage && bun run check`.
4. Docs (§4 of `tasks.md`): update `AGENTS.md` §3, §4, §7 to remove replica references.
5. Verification (§5 of `tasks.md`): `bun run check`, `bun run ladle:coverage`, `bun run test:ladle`, `bun run check:atomic-layers`, `bun run check:styling-ownership`, `bun run arch:check`, `bun run specs:check`, and the e2e suite per `12-design-system-e2e-tests-collect.md`.

Rollback: `git checkout openspec/changes/retire-heroui-replica/`'s parent commit restores the deleted files (assuming the deletion has not been committed). If the deletion is already committed, `git revert` is the rollback path; the repo's CI green-state is recoverable in one revert because no other change is dependent on the replica's absence.

## Open Questions

None. The deletion list is locked in by iteration-13 plan §11, the export / script removals are mechanical, and the AGENTS.md updates are textual. The `MODIFIED Requirements` block in the spec delta covers every section that referenced the replica.
