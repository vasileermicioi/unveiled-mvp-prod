## Context

The Unveiled MVP codebase is a modern stack built on Astro SSR, Better Auth, Drizzle ORM, Tailwind CSS, Biome, and Bun. As the codebase grows and is updated by automated agents and human developers, we need standard architectural, styling, and functional guidelines. This design proposes establishing a dedicated, clear documentation suite inside the repository's `docs/` folder to serve as the unified source of truth.

## Goals / Non-Goals

**Goals:**
- Create `docs/architecture.md` defining the C4 Context and Container diagrams, describing integrations (Stripe, Cloudflare R2), container structures (Astro server, SQLite/PGlite database, React client components), and protocols (HTTPS, SSE, Webhooks).
- Create `docs/guidelines.md` detailing coding standards, Astro layout patterns, styling rules, Biome linter guidelines, and local verification with `bun run check`.
- Create `docs/epics.md` detailing high-level Epic specifications grouped by functional business domains (Discovery Feed, Member Payments, Media Storage, Venue Check-in).
- Integrate documentation into validation gates.

**Non-Goals:**
- Implementing actual features or modifying application code.
- Modifying Biome configurations (`biome.json`) or compiler configs (`tsconfig.json`).
- Setting up new CI/CD workflow automation (only document standard local validation runs).

## Decisions

### Decision 1: Location and Format of Documentation
- **Choice**: Write files in Markdown (.md) in the `docs/` directory (`docs/architecture.md`, `docs/guidelines.md`, `docs/epics.md`).
- **Rationale**: Markdown files in Git are highly readable, version-controlled, and easily searchable by developers and automated agents.

### Decision 2: Diagram Notation (Mermaid)
- **Choice**: Use Mermaid.js diagrams directly within Markdown files.
- **Rationale**: Mermaid renders natively in GitHub and markdown viewers, allowing diagrams to stay updated alongside code changes in Git without binary asset overhead.

### Decision 3: Grouping Epics by Business Domain
- **Choice**: Domain-driven grouping of Scrum Epics (Discovery Feed, Member Payments, Media Storage, Venue Check-in).
- **Rationale**: Groups related features under cohesive boundaries matching the system specs, facilitating clear modular design.

## Risks / Trade-offs

### [Risk] Out-of-date documentation → Mitigation
As features change, architectural details or guidelines can drift.
- **Mitigation**: Require all agents to review and update `docs/` files as part of their specification/implementation workflow when architectural details change.

### [Risk] Rigid rules stifling quick prototyping → Mitigation
Strict code styling might block fast iterations.
- **Mitigation**: The guidelines document existing automated rules (`bun run check`, Biome lint/format, Astro strict mode) so it matches actual compiler and linter settings, minimizing manual rule friction.
