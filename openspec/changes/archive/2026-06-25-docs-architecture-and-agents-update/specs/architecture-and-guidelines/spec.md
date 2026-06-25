## MODIFIED Requirements

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