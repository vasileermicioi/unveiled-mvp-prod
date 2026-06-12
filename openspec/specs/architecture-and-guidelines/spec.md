# architecture-and-guidelines Specification

## Purpose
Defines the C4 architecture documentation, the code/style guidelines, and the
epic-level feature taxonomy. The C4 model is a code-first LikeC4 model under
`architecture/`; this spec requires the model and forbids hand-edited Mermaid
diagrams outside the model source.
## Requirements
### Requirement: C4 Architecture Documentation
The project SHALL include a C4 architecture specification mapping system context, runtime containers, and component relationships, sourced from a code-first LikeC4 model under `architecture/`.

#### Scenario: C4 model defines containers and integrations
- **WHEN** developers or agents inspect the system architecture
- **THEN** they find visual diagrams and descriptions of the Context level (external systems like Stripe and Cloudflare R2) and Container level (Astro server, SQLite database, React client components)
- **AND** communication protocols (e.g. HTTPS, Server-Sent Events, Webhooks) are explicitly specified
- **AND** the source of truth is the LikeC4 model under `architecture/`, viewed through a LikeC4 LSP client (e.g. the LikeC4 VS Code extension) or `bunx likec4 serve`

#### Scenario: Diagrams are generated, not hand-edited
- **WHEN** a contributor wants to update the C4 diagrams
- **THEN** they edit the LikeC4 model source under `architecture/` (no static export is required for day-to-day development)
- **AND** hand-edited Mermaid blocks outside the LikeC4 model source are not permitted
- **AND** `docs/architecture.md` points at the LikeC4 model source instead of embedding a Mermaid block

#### Scenario: CI enforces the model
- **WHEN** a pull request is opened or updated
- **THEN** CI runs `bun run arch:check` and `bun run arch:drift` alongside `bun run check`
- **AND** the build fails if the model does not compile or a referenced file path is missing from the repo

### Requirement: Code and Style Guidelines
Code styling, structure, and linting rules SHALL be defined to govern all human and agent contributions to the codebase.

#### Scenario: Tooling enforces style constraints
- **WHEN** files are modified or created in the workspace
- **THEN** they must adhere to standard codebase rules (TypeScript strict checks, Astro layout structure, Biome linter, custom CSS styles)
- **AND** automated checks run via `bun run check` validate compliance prior to code commits

### Requirement: High-Level Epic Feature Specs
Features SHALL be grouped under business domains at the Epic level without detailing low-level user stories.

#### Scenario: Features are listed as domain-grouped Epics
- **WHEN** reviewing the feature specifications
- **THEN** Epics are grouped by functional domains (e.g., Discovery Feed, Member Payments, Media Storage, Venue Check-in)
- **AND** each domain specifies overall capabilities and boundaries without detailed task breakdowns

