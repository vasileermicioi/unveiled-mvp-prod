# architecture-and-guidelines Specification

## Purpose
Defines the C4 architecture documentation, the code/style guidelines, and the
epic-level feature taxonomy. The C4 model is a code-first LikeC4 model under
`architecture/`; this spec requires the model and forbids hand-edited Mermaid
diagrams outside the model source.
## Requirements
### Requirement: C4 Architecture Documentation

The project SHALL include a C4 architecture specification mapping system context, runtime containers, and component relationships, sourced from a code-first LikeC4 model under `architecture/`. The LikeC4 model MUST declare a `DesignSystem` container inside `unveiled` (with `Atoms`, `Molecules`, `Organisms`, `Templates`, `Pages` components), MUST declare `HeroUI` as an external library element connected to `Atoms` and `Molecules` with `uses` relationships, MUST declare explicit `uses` relationships from `App` and `Landing` to `DesignSystem`, and MUST keep every `metadata.path` anchored under a live workspace root so `bun run arch:drift` stays green. `docs/architecture.md` MUST contain a "Design system boundary" section that documents the layer hierarchy, the presentational / container split, the CSS ownership rule, the Ladle demo obligation, and the gate-script enforcement, and MUST point at the LikeC4 model source instead of embedding a Mermaid block.

#### Scenario: C4 model defines containers and integrations

- **WHEN** developers or agents inspect the system architecture
- **THEN** they find visual diagrams and descriptions of the Context level (external systems like Stripe and Cloudflare R2) and Container level (Astro server, SQLite database, React client components)
- **AND** the model declares `DesignSystem` as a container inside `unveiled`
  with components for each atomic-design layer and `metadata.path` values
  anchored under `packages/design-system`
- **AND** the model declares `HeroUI` as an external library element with
  `technology = "@nextui-org/react"` and `uses` relationships from `Atoms`
  and `Molecules`
- **AND** `App` and `Landing` containers declare explicit `uses` relationships
  to `DesignSystem`
- **AND** communication protocols (e.g. HTTPS, Server-Sent Events, Webhooks) are explicitly specified
- **AND** the source of truth is the LikeC4 model under `architecture/`, viewed through a LikeC4 LSP client (e.g. the LikeC4 VS Code extension) or `bunx likec4 serve`

#### Scenario: Diagrams are generated, not hand-edited

- **WHEN** a contributor wants to update the C4 diagrams
- **THEN** they edit the LikeC4 model source under `architecture/` (no static export is required for day-to-day development)
- **AND** hand-edited Mermaid blocks outside the LikeC4 model source are not permitted
- **AND** `docs/architecture.md` points at the LikeC4 model source instead of embedding a Mermaid block
- **AND** `docs/architecture.md` contains a "Design system boundary" section
  per the design in `openspec/changes/docs-architecture-and-agents-update/design.md`.

#### Scenario: CI enforces the model

- **WHEN** a pull request is opened or updated
- **THEN** CI runs `bun run arch:check` and `bun run arch:drift` alongside `bun run check`
- **AND** the build fails if the model does not compile, a referenced file
  path is missing from the repo, or a `metadata.path` value is not anchored
  under a live workspace root
- **AND** the build fails if `docs/architecture.md` is missing or does not
  contain the "Design system boundary" section.

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

### Requirement: High-Level Epic Feature Specs
Features SHALL be grouped under business domains at the Epic level without detailing low-level user stories.

#### Scenario: Features are listed as domain-grouped Epics
- **WHEN** reviewing the feature specifications
- **THEN** Epics are grouped by functional domains (e.g., Discovery Feed, Member Payments, Media Storage, Venue Check-in)
- **AND** each domain specifies overall capabilities and boundaries without detailed task breakdowns

