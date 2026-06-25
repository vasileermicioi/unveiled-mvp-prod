## Why

Iteration 13 is a multi-proposal refactor that extracts a design system and rewires every UI primitive across `packages/app` and `packages/landing`. Every proposal in this cycle lists `bun run test:e2e`, visual-regression diffs, and dev/readyz smoke checks in its own `Definition of done` block, which duplicates the same test surface, the same fixtures, and the same infra decisions across many proposals. When the e2e infra changes (a new orchestrator port, a new browser, a new fixture layout, a new visual baseline, a new health-probe contract), every proposal that mentions it has to be edited in lockstep. The change is the single source of truth for the iteration-13 end-to-end surface so each refactor proposal can cite it once and keep moving.

## What Changes

- Codify the iteration-13 end-to-end surface in one place: the gherkin parity suite (`bun run test:e2e`), the visual-regression baselines (`tests/visual/**`), and the dev/readyz smoke (`bun run dev` + `curl /healthz` / `/readyz`).
- Document the cross-cutting rules that every iteration-13 proposal must honour through the e2e surface: no `data-testid` in production code, no `getByText` chains in gherkin, semantic-selector discipline, AGENTS.md as the canonical entrypoint, and `@ladle(component=…, story=…)` tags that resolve to a real Ladle story.
- Add a proposal-to-e2e cross-reference table that names exactly which e2e categories each of proposals 02, 03, 04, 05, 06, 07, 08, 09, 10, and 11 is responsible for keeping green.
- Make the e2e obligations of iteration-13 proposals 02, 03, 04, 05, 06, 07, 08, 09, and 11 reference this change by name instead of inlining the e2e / visual-regression / smoke details. Proposal 10 owns the AGENTS.md update that surfaces this change to all contributors.
- State explicitly that this change does not write new test fixtures, does not refresh visual baselines, and does not move any e2e infrastructure; the existing suites under `tests/parity/**`, `tests/visual/**`, and `tests/steps/**` remain the source of truth for test code.

## Capabilities

### New Capabilities

- None — this change codifies existing end-to-end behaviour and cross-references it from existing capability specs rather than introducing a new capability folder.

### Modified Capabilities

- `e2e-gherkin-playwright`: require that the runner at `tests/parity/gherkin.spec.ts` is the single owner of the per-domain feature tree under `tests/features/**` for iteration 13 and that the iteration-13 proposals each cite the new e2e consolidation proposal rather than restating runner assumptions.
- `pages`: require that `tests/visual/**` remains the canonical visual-regression surface for every iteration-13 refactor that changes rendered DOM (the styling-ownership, app-migration, and landing-migration proposals), and that baselines are refreshed only when the design itself changes, not when a proposal slips.
- `routing-orchestrator`: require that the orchestrator's `/healthz` and `/readyz` endpoints stay green throughout iteration 13 and that every iteration-13 proposal that touches a downstream Worker (app, landing) is responsible for confirming `/readyz` still returns `200` end-to-end before merging.
- `agent-guidance`: require that `AGENTS.md` §7 (toolchain commands) and §8 (definition of done) point contributors at the iteration-13 e2e consolidation proposal as the single source of truth for gherkin parity, visual regression, and dev/readyz smoke during this iteration, and that the reference is removed once iteration 13 archives.

## Impact

- `openspec/changes/archive/2026-06-24-design-system-atoms-layer/`, `2026-06-24-design-system-molecules-layer/`, `2026-06-24-design-system-organisms-layer/`, `2026-06-24-design-system-layouts-and-pages/`, `2026-06-25-design-system-styling-ownership/`, `2026-06-25-app-migrate-fully-to-design-system/`, `2026-06-25-landing-migrate-fully-to-design-system/`, `2026-06-25-heroui-provider-becomes-design-system/`, and `2026-06-25-retire-heroui-replica/` — each proposal's `Definition of done` block replaces any inline e2e / visual-regression / smoke text with a single reference: "e2e per `design-system-e2e-tests-collect`".
- `openspec/changes/archive/2026-06-25-docs-architecture-and-agents-update/` — that proposal owns the AGENTS.md §7 / §8 update that surfaces this change's filename as the iteration-13 e2e source of truth.
- `openspec/specs/e2e-gherkin-playwright/spec.md`, `openspec/specs/pages/spec.md`, `openspec/specs/routing-orchestrator/spec.md`, `openspec/specs/agent-guidance/spec.md` — each gains an `## MODIFIED Requirements` delta that references the new consolidation proposal.
- Out of scope: any new test fixtures, any new gherkin feature files, any visual-baseline refresh, any new Playwright runner configuration, any orchestrator probe change, and any source-code change under `packages/app`, `packages/landing`, or `packages/design-system`. The gherkin runner, the visual-regression harness, the Ladle coverage gate, the orchestrator's `/healthz` and `/readyz`, and `AGENTS.md` itself are owned by other proposals in this iteration.