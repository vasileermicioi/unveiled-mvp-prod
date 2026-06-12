## Why

The project currently documents architecture in `docs/architecture.md` using hand-authored Mermaid C4 diagrams that drift from the actual code, are not type-checked, and cannot be reused to validate naming, boundaries, or technology choices. Several iteration proposals reference "C4 architecture documentation" (`openspec/specs/architecture-and-guidelines/spec.md`) but the diagrams live in a free-form Markdown file rather than a model that is part of the build.

LikeC4 is a DSL that treats the C4 model (System Context, Container, Component, Deployment, Dynamic) as code: every element, relationship, view, and tag is checked against the codebase on every CI run. By moving to LikeC4 we get:

- A single source of truth (`architecture/*.likec4`) that the rest of the iteration (TypeSpec, design tokens, gherkin) can reference by id.
- An LSP-rendered view of the model in any editor with a LikeC4 client (e.g. the [LikeC4 VS Code extension](https://marketplace.visualstudio.com/items?itemName=likec4.likec4)), with live preview and validation on save.
- A check that detects drift between code and the model — e.g. a new Astro page is missing from the Component view.
- On-demand exports (PNG/SVG/PDF/JSON) when a non-developer stakeholder needs a shareable artefact.

This proposal is a stand-alone change that introduces the LikeC4 toolchain, a baseline model covering all current production surfaces, and a CI check that fails the build if a referenced component/endpoint is removed from the codebase.

## What Changes

- Add LikeC4 (CLI) as a dev dependency.
- Create `architecture/` directory with `.likec4` / `.c4` files defining the full C4 model:
  - **System Context (L1)**: Guests, Members, Partners, Admins, Unveiled, Stripe, Cloudflare R2, Cloudflare (Workers/Pages), Email provider, Browser.
  - **Container (L2)**: Astro SSR Worker, React Islands bundle, PGlite (local) / Neon Postgres (prod), Cloudflare R2 bucket, Stripe API client, Email worker, Cron trigger.
  - **Component (L3)**: One component per top-level Astro page group (`public-discover`, `member-app`, `admin-panel`, `partner-portal`), per lib module under `src/lib/`, per Astro Action surface, per Drizzle repository, and per Better Auth integration.
  - **Deployment (L4)**: Local Bun dev, Cloudflare Pages preview, Cloudflare Workers production, with parallel nodes for local PGlite vs. Neon.
  - **Dynamic (L5)**: A "Booking lifecycle" dynamic view that walks Member → Astro Action → Booking Transaction → Credit Ledger → Email → R2.
- Each spec, action, route, and module is tagged (`spec:…`, `surface:…`, `role:…`, `domain:…`) so views can be filtered.
- Wire `bun run arch:check` (validates the model + runs the drift check) and `bun run arch:drift` (rewrites/inspects model paths).
- Add a CI job that runs `bun run arch:check` on every PR; the build fails if the model does not compile or a referenced file path is missing from the repo.
- Replace the Mermaid block in `docs/architecture.md` with a narrative pointing readers at the LikeC4 model source; keep the rest of the doc as a narrative companion.
- Update `openspec/specs/architecture-and-guidelines/spec.md` with a `## MODIFIED Requirements` block that points at the LikeC4 model and forbids hand-edited Mermaid outside of the model source.
- **No public `/architecture` page is added.** The diagrams are a developer surface; contributors view them in their editor via the LikeC4 LSP (e.g. the [LikeC4 VS Code extension](https://marketplace.visualstudio.com/items?itemName=likec4.likec4)).

## Capabilities

### New Capabilities

- `likec4-architecture`: A code-first C4 architecture model (Context → Container → Component → Deployment → Dynamic) authored in LikeC4, viewed through a LikeC4 LSP client (no public route), and enforced by a CI drift check.

### Modified Capabilities

- `architecture-and-guidelines`: Architecture diagrams MUST be generated from the LikeC4 model; the Mermaid block in `docs/architecture.md` is replaced with a narrative pointing at the model source. The CI check (`bun run arch:check`) is the source of truth for compliance, supplementing `bun run check`.

## Impact

- New devDeps: `likec4` (the CLI binary; the `@likec4/vite` Vite plugin is not used — Astro Vite is configured separately).
- New scripts in `package.json`: `arch:check`, `arch:drift`.
- New files:
  - `architecture/specification.likec4` (element kinds, tag definitions)
  - `architecture/model.likec4` (LikeC4 L1–L5 model)
  - `architecture/views.likec4` (L1/L2/L3/L5 view definitions, grouped into a `C4` folder and a `Domain views` folder)
  - `architecture/deployment.likec4` (L4 deployment model + deployment views, also grouped into the `C4` folder)
  - `architecture/specs.likec4` (cross-references to TypeSpec routes, gherkin features, design tokens)
  - `scripts/check-architecture-drift.ts` (Node/Bun script that walks model element paths and asserts the files exist)
- Modified files: `docs/architecture.md` (narrative pointing at the model source), `package.json` (scripts + devDeps), `openspec/specs/architecture-and-guidelines/spec.md` (MODIFIED Requirements), CI workflow (`bun run arch:check` step).
- No runtime, no database, no UI primitives are affected.
- No public-facing page is added; the model is a developer surface.
- The LikeC4 model directory is excluded from `astro check` and Biome formatting.
