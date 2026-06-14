## MODIFIED Requirements

### Requirement: Code and Style Guidelines
Code styling, structure, linting rules, and iteration-level planning documentation SHALL be defined to govern all human and agent contributions to the codebase. The iteration-level planning documentation lives under `.development-plan/0N-iteration/`, with the canonical entry point for the upcoming catalog iteration being `.development-plan/09-iteration/00-summary.md`.

#### Scenario: Tooling enforces style constraints
- **WHEN** files are modified or created in the workspace
- **THEN** they must adhere to standard codebase rules (TypeScript strict checks, Astro layout structure, Biome linter, custom CSS styles)
- **AND** automated checks run via `bun run check` validate compliance prior to code commits

#### Scenario: AGENTS.md is the canonical contributor entrypoint
- **WHEN** a new contributor (human or agent) opens the repository
- **THEN** the first file they read is `AGENTS.md` at the repo root
- **AND** `AGENTS.md` is no more than 400 lines
- **AND** `AGENTS.md` links out to `docs/guidelines.md`, `docs/architecture.md`, `openspec/specs/`, and `.development-plan/0N-iteration/` instead of duplicating their content
- **AND** `AGENTS.md` includes a one-line pointer to `.development-plan/09-iteration/00-summary.md` under the "Iteration cycle" section

#### Scenario: AGENTS.md is reviewed on architecture changes
- **WHEN** a change updates the tech stack, the file layout, the iteration cycle, the toolchain commands, or the definition of done
- **THEN** the same change updates `AGENTS.md`
- **AND** reviewers reject the change if `AGENTS.md` was not updated

#### Scenario: 09-iteration is the catalog that drives 10-iteration
- **WHEN** a contributor is assigned a per-feature spec to author in 10-iteration
- **THEN** `.development-plan/09-iteration/00-summary.md` exists, is no more than 200 lines, and is the entry point
- **AND** the summary links to `01-review-existing-features.md` (the improvement catalog) and `02-remaining-features-to-prod.md` (the net-new feature catalog)
- **AND** the summary documents the per-feature folder format, the 10-item definition of done, the selector discipline, the storybook-is-per-feature rule, the out-of-scope list, and the recommended work order
- **AND** the folder is a catalog (planning documentation only); no per-feature gherkin, storybook, or OpenSpec change is authored in 09-iteration
