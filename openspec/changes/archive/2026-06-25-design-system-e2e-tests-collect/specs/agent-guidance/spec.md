## ADDED Requirements

### Requirement: Iteration 13 E2E Reference Surfaces In AGENTS.md

`AGENTS.md` §7 (Toolchain commands) and §8 (Definition of done) SHALL surface the `design-system-e2e-tests-collect` OpenSpec change as the single source of truth for the iteration-13 gherkin parity, visual-regression, and dev/readyz smoke obligations, and SHALL remove the reference once iteration 13 archives.

#### Scenario: AGENTS.md points contributors at the consolidation change

- **WHEN** a contributor reads `AGENTS.md` during iteration 13
- **THEN** §7 names `bun run test:e2e`, the visual-regression baselines under `tests/visual/**`, and the `/healthz` / `/readyz` smoke checks
- **AND** §7 points contributors at the `design-system-e2e-tests-collect` change as the canonical source of those obligations for the duration of the iteration

#### Scenario: Definition of done defers to the consolidation change

- **WHEN** a contributor reads `AGENTS.md` §8 during iteration 13
- **THEN** the iteration-13 refactor proposals cite the `design-system-e2e-tests-collect` change rather than restating gherkin, visual-regression, or smoke checks
- **AND** once iteration 13 archives, the docs/AGENTS update proposal removes the reference so §8 reverts to the canonical end-to-end checks