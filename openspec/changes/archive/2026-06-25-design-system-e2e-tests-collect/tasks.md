## 1. Change Scaffolding

- [x] 1.1 Land the four artifacts under `openspec/changes/design-system-e2e-tests-collect/` (`proposal.md`, `design.md`, `tasks.md`, and the four spec deltas under `specs/`).
- [x] 1.2 Verify `openspec validate design-system-e2e-tests-collect` exits 0 and `openspec status --change design-system-e2e-tests-collect` reports all artifacts done.

## 2. Rewire Iteration-13 Proposals To Cite The Change

- [x] 2.1 Update the `Definition of done` block of `openspec/changes/archive/2026-06-24-design-system-atoms-layer/` to cite `design-system-e2e-tests-collect` for gherkin parity (no call-site change; visual regression and dev/readyz smoke not required).
- [x] 2.2 Update the `Definition of done` block of `openspec/changes/archive/2026-06-24-design-system-molecules-layer/` to cite `design-system-e2e-tests-collect` for gherkin parity (no call-site change; visual regression and dev/readyz smoke not required).
- [x] 2.3 Update the `Definition of done` block of `openspec/changes/archive/2026-06-24-design-system-organisms-layer/` to cite `design-system-e2e-tests-collect` for gherkin parity (call sites are wired by the app-migration proposal; visual regression and dev/readyz smoke not required for the move itself).
- [x] 2.4 Update the `Definition of done` block of `openspec/changes/archive/2026-06-24-design-system-layouts-and-pages/` to cite `design-system-e2e-tests-collect` for gherkin parity (call sites are wired by the app-migration proposal; visual regression and dev/readyz smoke not required for the move itself).
- [x] 2.5 Update the `Definition of done` block of `openspec/changes/archive/2026-06-25-design-system-styling-ownership/` to cite `design-system-e2e-tests-collect` for gherkin parity and visual regression (class names are preserved 1:1; any unexpected diff is a refactor bug, not a baseline refresh).
- [x] 2.6 Update the `Definition of done` block of `openspec/changes/archive/2025-06-25-app-migrate-fully-to-design-system/` to cite `design-system-e2e-tests-collect` for gherkin parity, visual regression, and dev/readyz smoke (the canonical regression net for the iteration).
- [x] 2.7 Update the `Definition of done` block of `openspec/changes/archive/2026-06-25-landing-migrate-fully-to-design-system/` to cite `design-system-e2e-tests-collect` for gherkin parity, visual regression, and dev/readyz smoke (the landing Astro wrapper is a non-functional change).
- [x] 2.8 Update the `Definition of done` block of `openspec/changes/archive/2026-06-25-heroui-provider-becomes-design-system/` to cite `design-system-e2e-tests-collect` for gherkin parity and dev/readyz smoke (the provider is invisible in the rendered DOM; every themed island must still hydrate).
- [x] 2.9 Update the `Definition of done` block of `openspec/changes/archive/2026-06-25-retire-heroui-replica/` to cite `design-system-e2e-tests-collect` for gherkin parity (every `@ladle(component=…, story=…)` tag must still resolve to a real Ladle story before replica stories are deleted; `bun run ladle:coverage` enforces it).

## 3. AGENTS.md Surface (Owned By The Docs Proposal)

- [x] 3.1 Confirm that `openspec/changes/archive/2026-06-25-docs-architecture-and-agents-update/` adds a reference to `design-system-e2e-tests-collect` in `AGENTS.md` §7 (Toolchain commands) and §8 (Definition of done) so contributors can find the iteration-13 e2e source of truth from the canonical entrypoint.
- [x] 3.2 Confirm that the same docs proposal adds a follow-up task to remove the iteration-13 reference from `AGENTS.md` §7 / §8 once iteration 13 archives, so the canonical entrypoint reverts to the iteration-09 catalog and the standing end-to-end checks.

## 4. Definition Of Done

- [x] 4.1 Every artifact under `openspec/changes/design-system-e2e-tests-collect/` exists and `openspec validate` exits 0.
- [x] 4.2 The four spec deltas under `openspec/changes/design-system-e2e-tests-collect/specs/` each land an `## ADDED Requirements` block that names the consolidation change by slug and does not duplicate the runner, fixture, baseline, or probe contract.
- [x] 4.3 The nine iteration-13 refactor proposals listed in §2 each cite `design-system-e2e-tests-collect` in their `Definition of done` block, with no inlined e2e / visual-regression / smoke details.
- [x] 4.4 The docs-architecture-and-agents-update proposal for iteration 13 references the consolidation change in `AGENTS.md` §7 / §8 and adds a revert task bound to the iteration-13 archive.
- [x] 4.5 No source code, fixture, baseline, or runner configuration is modified by this change; `git diff --stat` against `main` shows changes limited to `openspec/changes/design-system-e2e-tests-collect/**` plus the rewired `Definition of done` blocks in the archived iteration-13 proposals.
- [x] 4.6 `bun run check` still passes locally after the rewires (no formatter, lint, or type regressions introduced by the rewired prose).