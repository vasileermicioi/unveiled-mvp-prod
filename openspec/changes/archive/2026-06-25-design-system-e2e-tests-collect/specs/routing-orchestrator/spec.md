## ADDED Requirements

### Requirement: Iteration 13 Dev And Readyz Smoke Source Of Truth

The orchestrator's `/healthz` and `/readyz` endpoints SHALL stay green throughout iteration 13, and every iteration-13 refactor proposal that touches a downstream Worker (the app Astro Worker or the landing Astro Worker) SHALL cite the `design-system-e2e-tests-collect` OpenSpec change rather than restating the health-probe contract or the dev/readyz smoke workflow in each proposal.

#### Scenario: Refactor proposal cites the consolidation change

- **WHEN** an iteration-13 refactor proposal touches `packages/app`, `packages/landing`, or the orchestrator's downstream-Worker dispatch
- **THEN** the proposal references `design-system-e2e-tests-collect` by name
- **AND** the proposal confirms `GET http://localhost:4320/healthz` returns `200 ok` and `GET http://localhost:4320/readyz` returns `200` once the downstream readiness probes are green before merging

#### Scenario: Health-probe contract is unchanged by the refactor

- **WHEN** an iteration-13 refactor proposal merges
- **THEN** `/healthz` still returns the plain-text `ok` body declared by the `Readiness Probe Composes Downstream Health` and `Orchestrator Replaces Public Health JSON Endpoints` requirements
- **AND** `/readyz` still composes the three downstream Workers' health probes into the safe JSON envelope