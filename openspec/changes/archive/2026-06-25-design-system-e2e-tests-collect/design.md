## Context

Iteration 13 is a multi-proposal refactor that introduces the `@unveiled/design-system` package and rewires every UI primitive across `packages/app` and `packages/landing`. The proposal set (atoms layer, molecules layer, organisms layer, layouts and pages, styling ownership, app migration, landing migration, theme-provider move, and replica retirement) is interdependent: every proposal in the set touches rendered DOM, every one of them lists `bun run test:e2e`, visual-regression diffs, and dev/readyz smoke in its `Definition of done` block, and every one of them expects the gherkin feature tree, the visual baselines, and the orchestrator's `/healthz` and `/readyz` endpoints to keep working unchanged.

The duplication creates two risks. First, an e2e-infra change (a new orchestrator port, a new browser, a new fixture layout, a new visual baseline, a new health-probe contract) has to be reflected in many proposals in lockstep. Second, contributors reviewing any one proposal see the runner contract inlined rather than as a single canonical reference, so the contract drifts between proposals and the resulting PRs disagree about which fixtures, selectors, or smoke checks are authoritative.

This change codifies the iteration-13 end-to-end surface in one place — the gherkin parity suite, the visual-regression baselines, and the dev/readyz smoke — and rewires the other iteration-13 proposals to cite it by name. The intent is the same pattern the iteration-09 catalog and the iteration-12 `add-legacy-parity-regression-suite` change used: one proposal owns the e2e contract, the others reference it.

## Goals / Non-Goals

**Goals:**

- Make the iteration-13 gherkin parity runner (`tests/parity/gherkin.spec.ts`), the visual-regression baselines (`tests/visual/**`), and the dev/readyz smoke (`bun run dev` + `curl /healthz` + `curl /readyz`) collectively authoritative for every iteration-13 refactor.
- Rewire every iteration-13 refactor proposal whose `Definition of done` block restates e2e, visual-regression, or smoke details to cite this change by name instead.
- Add a proposal-to-e2e cross-reference table that names which e2e category each iteration-13 proposal is responsible for keeping green, so reviewers can spot-check responsibility quickly.
- Codify the cross-cutting e2e rules that already live in `AGENTS.md` §9 / §10 / §11 (no `data-testid` in production code, no `getByText` chains in gherkin, semantic-selector discipline, `@ladle(component=…, story=…)` tags resolve to a real Ladle story) as the iteration-13 reference for reviewers.
- Document the boundary that visual baselines are refreshed only on design change (owned by `docs/architecture.md` and the design-token catalogue), never to mask a refactor regression.

**Non-Goals:**

- Writing any new gherkin feature files, Playwright specs, visual baselines, fixture seeders, or `bun:test` suites.
- Changing the gherkin runner, the visual-regression harness, the Ladle coverage gate, the orchestrator's `/healthz` and `/readyz`, the orchestrator's dev proxy, or any source code under `packages/app`, `packages/landing`, `packages/design-system`, or `packages/orchestrator`.
- Refreshing visual baselines or running e2e suites from this change; the responsibility for keeping each suite green lives with the proposal that produces the change.
- Replacing the existing iteration-09 catalog or iteration-12 `add-legacy-parity-regression-suite` change; this change is iteration-13-only and supersedes neither.

## Decisions

1. Treat the gherkin runner, the visual baselines, and the dev/readyz smoke as the three e2e categories for iteration 13.

   The three categories map to existing artefacts (`tests/parity/gherkin.spec.ts`, `tests/visual/**`, `bun run dev` plus the orchestrator probes). Every iteration-13 refactor that touches rendered DOM, hydration, or theme is responsible for keeping all three green; refactors that move atoms or molecules without touching rendered DOM only have to keep the gherkin suite green. The category list is documented once and referenced by every other proposal.

   Alternatives considered:
   - One unified category that conflates all three: too coarse for proposal-level responsibility attribution; reviewers would have to re-derive which sub-surface a refactor actually changed.
   - Per-proposal e2e ownership files: splits the same ownership across many files and re-introduces the duplication this change is meant to remove.

2. Cite the change by name from each iteration-13 proposal rather than from a shared markdown table.

   Each proposal's `Definition of done` block reads `e2e per design-system-e2e-tests-collect` so the citation survives archive (the proposal moves to `openspec/changes/archive/` but the prose stays). A shared markdown table that lives outside the proposals would not travel with them and would go stale the moment a proposal archives.

   Alternatives considered:
   - A standalone `docs/e2e-iteration-13.md` doc: equivalent in effect, but docs drift faster than proposal prose and require their own AGENTS.md surface to be discoverable.
   - Inline the e2e obligations in every proposal: the current state; explicitly rejected because it duplicates the contract.

3. Keep the AGENTS.md reference inside iteration 13 and remove it once iteration 13 archives.

   The `docs-architecture-and-agents-update` proposal for iteration 13 already updates `AGENTS.md` §7 and §8 to surface this change as the iteration-13 e2e source of truth. Once iteration 13 archives, that same update pass removes the reference so §8 reverts to the canonical end-to-end checks defined by the iteration-09 catalog and `AGENTS.md` §8. The reference is bounded by the iteration, not permanent.

   Alternatives considered:
   - Permanent AGENTS.md reference: would muddy the canonical end-to-end contract after the iteration ends and would invite the same drift this change is meant to remove in a later iteration.

4. Leave the visual-baseline refresh policy codified in the change rather than moved to a separate proposal.

   The "refresh baselines only when the design itself changed" rule is iteration-13-specific because iteration-13 includes design-token renames that legitimately produce visual diffs. Codifying it here keeps the rule adjacent to the proposals that need it and avoids splitting the iteration-13 e2e contract across two changes.

   Alternatives considered:
   - Move the rule into `docs/architecture.md` directly: equivalent in effect, but `docs/architecture.md` is updated by the docs-architecture-and-agents-update proposal as part of iteration 13 anyway, so the rule would land in two places.

5. Do not modify any source code from this change.

   The proposal explicitly states it codifies the existing e2e surface rather than extending it. Writing source code from this change would entangle the iteration-13 e2e contract with the refactor that uses it, which defeats the purpose of having a separate consolidation change. If a reviewer spots a runner, fixture, or baseline gap during review, the fix lands in the proposal that produced the gap, not here.

   Alternatives considered:
   - Use this change to fix runner, fixture, or baseline gaps: tempting, but it couples the contract to the refactor that exposed it and makes archive-time replay ambiguous.

## Risks / Trade-offs

- [Citation drift between proposals] → The proposal-to-e2e cross-reference table in `tasks.md` is the canonical mapping; reviewers reject proposals whose `Definition of done` block omits the citation or claims a different category.
- [Visual baselines refreshed in the wrong proposal] → The change states that baseline refreshes are reserved for design changes; any refactor proposal that touches a baseline must justify the refresh in its `proposal.md` and reference the design-token catalogue entry that owns the change.
- [AGENTS.md reference outlives the iteration] → The docs-architecture-and-agents-update proposal for iteration 13 owns the AGENTS.md revert; this change's tasks include a verification step that the AGENTS.md revert landed.
- [Iteration-13 reviewers skip the citation] → The `Definition of done` checks for the affected archived proposals must explicitly cite this change; reviewers reject proposals that restate the e2e obligations inline rather than citing by name.
- [The change becomes a catch-all for unrelated e2e cleanup] → The proposal explicitly states no new fixtures, no new baselines, no new runner config; any drive-by fix must move to its own proposal or the refactor proposal that exposed the gap.

## Migration Plan

1. Land this change first, ahead of the iteration-13 refactor proposals that will cite it. The cite-by-name pattern only works once the change exists in the repo.
2. Update each iteration-13 refactor proposal's `Definition of done` block to cite `design-system-e2e-tests-collect` by name, replacing any inlined e2e / visual-regression / smoke text. The mapping lives in `tasks.md` so the rewiring is mechanical.
3. The docs-architecture-and-agents-update proposal updates `AGENTS.md` §7 and §8 to surface the change as the iteration-13 e2e source of truth. Once iteration 13 archives, that proposal also owns the revert.
4. No runtime / production change is required; the change is paperwork plus spec deltas.
5. Roll back by reverting the proposal rewires and the spec deltas; no source code, no fixtures, no baselines, and no runner configuration were touched, so rollback is purely textual.

## Open Questions

- Whether the proposal-to-e2e cross-reference table should also surface in a Ladle / Playwright selector helper so contributors can pull up the obligations for a proposal from the runner output. (Out of scope for this change; revisit after iteration 13 archives if the pattern is needed again.)
- Whether the iteration-13 e2e consolidation should be lifted into a permanent capability folder (e.g. `iteration-13-catalog`) once the iteration ends, so future iterations can reuse the cite-by-name pattern with a single-line reference instead of repeating the proposal scaffolding. (Defer until at least one post-iteration-13 cycle has run.)