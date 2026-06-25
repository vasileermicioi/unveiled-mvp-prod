## ADDED Requirements

### Requirement: Iteration 13 Visual Regression Source Of Truth

The visual-regression baselines under `tests/visual/**` SHALL remain the canonical visual-diff surface for every iteration-13 refactor that changes rendered DOM, and every such refactor SHALL cite the `design-system-e2e-tests-collect` OpenSpec change rather than restating the baseline directory, the diff workflow, or the refresh policy in each proposal.

#### Scenario: Refactor proposal cites the consolidation change

- **WHEN** an iteration-13 refactor proposal changes rendered DOM across public, member, partner, or admin surfaces
- **THEN** the proposal references `design-system-e2e-tests-collect` by name
- **AND** the proposal does not restate the baseline directory, the diff workflow, or the refresh policy inline

#### Scenario: Visual baselines are refreshed only on design change

- **WHEN** a proposal produces an unintended visual diff against `tests/visual/**`
- **THEN** the proposal fixes the refactor, not the baselines
- **AND** baseline refreshes are reserved for proposals whose change is a deliberate design update (per the design-token catalogue and `docs/architecture.md`)