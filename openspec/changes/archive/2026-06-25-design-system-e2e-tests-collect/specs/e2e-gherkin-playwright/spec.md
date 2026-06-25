## ADDED Requirements

### Requirement: Iteration 13 E2E Consolidation Reference

The per-domain gherkin parity runner at `tests/parity/gherkin.spec.ts` SHALL be cited by every iteration-13 refactor proposal through the `design-system-e2e-tests-collect` OpenSpec change rather than restating runner assumptions, selector discipline, or fixture layout in each proposal.

#### Scenario: Iteration-13 proposal cites the consolidation change

- **WHEN** an iteration-13 refactor proposal lists its gherkin parity obligations in its `Definition of done` block
- **THEN** the proposal references `design-system-e2e-tests-collect` by name
- **AND** the proposal does not restate runner location, selector helpers, or fixture layout inline

#### Scenario: Runner remains the single gherkin entry point

- **WHEN** the gherkin runner executes against the orchestrator's port-4320 dev proxy
- **THEN** it walks every `tests/features/**/*.feature` file under the per-domain tree declared by the `gherkin-domain-features` capability
- **AND** it does not introduce a second runner for the iteration-13 refactors