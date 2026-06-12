## Context

The project documents its architecture in `docs/architecture.md` using hand-authored Mermaid C4 diagrams. Those diagrams are useful for a first read but are not enforced: there is no type-check on the diagram, no link from a diagram node to a real code path, and no way to detect when the codebase has drifted away from the picture. New Astro pages, Astro Actions, lib modules, and Drizzle repositories are added without any corresponding update to the C4 view, so the documentation falls behind within a single iteration.

LikeC4 treats C4 as code: a model is authored in `.likec4` files, every element carries a tag set, and views reference elements by id. The CLI provides a validator (`likec4 validate`), a live preview server (`likec4 serve`), and a language server protocol that any compatible editor can use. Running the validator on every CI change is the natural enforcement point: the model either compiles and matches the codebase, or CI fails.

The goal of this change is to introduce the LikeC4 toolchain, seed it with a baseline model that covers every production surface in the current codebase, and wire a drift check so the model cannot silently desynchronize from the code. The model is the single source of truth; the existing `docs/architecture.md` becomes a narrative companion, and the existing `architecture-and-guidelines` spec is updated to require the model. **No public route is added** — the diagrams are a developer surface, viewed in an editor with a LikeC4 LSP client (e.g. the [LikeC4 VS Code extension](https://marketplace.visualstudio.com/items?itemName=likec4.likec4)) or by running `bunx likec4 serve` locally.

## Goals / Non-Goals

**Goals:**

- Stand up a LikeC4 toolchain (`likec4` package) as a dev dependency, wired through `package.json` scripts (`arch:check` → `likec4 validate` + drift check, `arch:drift` → drift check).
- Author a baseline C4 model under `architecture/` that covers:
  - System Context (L1) with Guests, Members, Partners, Admins, Unveiled, Stripe, Cloudflare R2, Cloudflare (Workers/Pages), Email provider, Browser.
  - Container (L2) with Astro SSR Worker, React Islands bundle, PGlite (local) / Neon Postgres (prod), Cloudflare R2 bucket, Stripe API client, Email worker, Cron trigger.
  - Component (L3) with one node per Astro page group (`public-discover`, `member-app`, `admin-panel`, `partner-portal`), per lib module under `src/lib/`, per Astro Action surface, per Drizzle repository, and per Better Auth integration.
  - Deployment (L4) with Local Bun dev, Cloudflare Pages preview, Cloudflare Workers production, and parallel nodes for local PGlite vs. Neon.
  - Dynamic (L5) with a "Booking lifecycle" view that walks Member → Astro Action → Booking Transaction → Credit Ledger → Email → R2.
- Tag every model element with `role-*`, `surface-*`, `domain-*`, and `spec-*` so views can be filtered and cross-referenced.
- Group views into a `C4` folder (the canonical L1–L5 hierarchy, with L4 sub-grouped under `Deployment`) and a `Domain views` folder (tag-scoped slices) so reviewers can navigate the model by C4 level without confusing a tag-scoped slice with a C4 level.
- Add `scripts/check-architecture-drift.ts` that walks each model element's `metadata.path` value and fails the build if any path is missing from the repo.
- Run `bun run arch:check` on every CI change.
- Replace the Mermaid block in `docs/architecture.md` with a narrative pointing at the LikeC4 model source; the rest of the doc stays as narrative.
- Update `openspec/specs/architecture-and-guidelines/spec.md` to require the LikeC4 model and to forbid hand-edited Mermaid outside the model source.

**Non-Goals:**

- Wiring `@likec4/vite` into the Astro Vite config. Astro and Vite's plugin contract differ enough that we ship the CLI as a build-time validation step instead, run as a separate `arch:check` job in CI.
- Generating PNG/SVG/PDF automatically on every CI run. Raster exports are produced on demand (`bunx likec4 export png -o ./assets`) and committed when needed for runbooks.
- Modeling test infrastructure, CI pipelines, or the legacy `_old_app/` reference app. The model covers production surfaces only.
- Replacing `docs/architecture.md` outright. The Markdown doc remains a narrative companion and a link target from older specs.
- Adding a visual diff between successive LikeC4 renders in CI. The drift check (paths still exist + `bun run arch:check` passes) is sufficient for now.
- A public `/architecture` route or a committed static export. The model is for developers; the convenience surface is the LikeC4 LSP.

## Decisions

### 1. LikeC4 model authored in `.likec4` files under `architecture/`

**Decision:** The model lives in `architecture/model.likec4`, with view definitions in `architecture/views.likec4`, a specification block in `architecture/specification.likec4`, and cross-references to TypeSpec routes, gherkin features, and design tokens in `architecture/specs.likec4`. Element ids are LikeC4 identifiers (kebab-case), and tags are LikeC4's first-class `#tag` syntax.

**Rationale:** LikeC4's native DSL is the supported authoring format: it ships with an LSP, a `validate` command, and a `format` command, so the model gets editor support and CI checks for free. The split into four files mirrors the natural seams (kinds, data, presentation, cross-refs) and keeps each file under a few hundred lines. Tags are first-class in the DSL, so the `spec:`, `surface:`, `role:`, and `domain:` taxonomy is encoded directly on each element.

**Alternatives considered:**

- LikeC4's TypeScript API — supported, but the DSL is the recommended authoring surface and gets better tooling. Rejected for the baseline.
- A single mega-file — fast to start, but the L3 component view alone has dozens of elements.

### 2. Element tags: `role-*`, `surface-*`, `domain-*`, `spec-*`

**Decision:** Every element in the model carries at least one tag from each prefix. `role-*` is one of `role-actor`, `role-process`, `role-store`, `role-external`, `role-ui`; `surface-*` identifies the Astro route group or lib module; `domain-*` matches the openspec domain taxonomy (e.g. `domain-discover`, `domain-bookings`, `domain-auth`, `domain-payments`); `spec-*` is the openspec capability id (e.g. `spec-likec4-architecture`, `spec-booking-transactions`).

**Rationale:** Tags are the LikeC4-native filter mechanism. The LikeC4 DSL does not accept `#prefix:value` (the parser treats the `:` as a syntax error), so the four tag categories are encoded as `#role-actor`, `#surface-public-discover`, etc. The closed enum of values is enforced by a unit test in `tests/architecture/model-tags.test.ts`, so adding a new value is a deliberate, test-gated change.

**Alternatives considered:**

- Storing the values in element `metadata { … }` blocks instead of tags — works, but LikeC4's view filters (`include * where tag is #…`) only operate on tags, so metadata-only classification would not be filterable in the UI.
- Hierarchical element ids (`unveiled.member-app.feed`) — would also work, but it bakes the filtering axis into the id and makes renaming costly. Tags keep ids stable.

### 3. View grouping: `C4/` and `Domain views/` folders

**Decision:** The view definitions are split into two `views` blocks with explicit common-folder titles (`views 'C4' { ... }` and `views 'Domain views' { ... }`) so the grouping is visible in the source AND in any future viewer.

**Layout:**

- `C4/` — the canonical C4 hierarchy: `L1 / System Context`, `L2 / Container`, `L3 / Component`, `L4 / Deployment / Local Bun Dev` (and `… / Cloudflare Pages Preview`, `… / Cloudflare Workers Production`), `L5 / Booking Lifecycle`.
- `Domain views/` — tag-scoped slices: `Public Discover`, `Bookings`, `Payments`, `Operations`.

**Rationale:** Mirrors how C4 is taught (Context → Container → Component → Deployment → Dynamic) and keeps the tag-scoped slices out of the C4 progression so a new contributor can find both kinds of view without guessing. The common-folder syntax is a LikeC4-native mechanism, so the structure is preserved in the exported JSON, in `likec4 serve` (the dev preview), in any LikeC4 LSP client, and in the static export if we ever ship one.

**Alternatives considered:**

- Title-only grouping via `'L1 / System Context'` strings — works in the static viewer, but the common-folder syntax is also picked up by `likec4 export json`, which gives downstream tooling (drift check, drift reporting) something to pivot on.

### 4. No public `/architecture` page; developers view the model in their editor

**Decision:** We do NOT add an Astro page, do NOT generate a static HTML export, and do NOT commit a `public/architecture/` bundle. The model is a developer surface; contributors view it in an editor with the [LikeC4 VS Code extension](https://marketplace.visualstudio.com/items?itemName=likec4.likec4) (or any LikeC4 LSP client) or by running `bunx likec4 serve` locally for a live preview.

**Rationale:** The C4 model is internal documentation for engineers and agents. A public route would be discoverable to anyone who lands on the site, which is broader than the audience for the diagrams. The LikeC4 LSP gives every developer a richer experience than a server-rendered page (live preview, navigation between views, errors on save) without consuming the production bundle. The only artefact that ever needs to ship in the repo is the model source itself.

**Alternatives considered:**

- Gate the page behind the admin role (Better Auth) and add `noindex` — preserves the "no CLI needed" convenience for the team without exposing it to the public, but still requires a sign-in flow for something that is essentially a developer tool.
- Build a separate dev-only target (e.g. `dist-dev/architecture/`) — most isolated, but it adds a second build pipeline for a surface that only a handful of contributors will use.
- Embed the LikeC4 React viewer in an Astro island — ships ~2.5 MB of JS to the client for a page that almost no visitor will reach.

### 5. Drift check as a separate script: `scripts/check-architecture-drift.ts`

**Decision:** A small Bun/Node script walks the LikeC4 model, extracts the file paths referenced by every element (typically the `metadata.path` value on an Astro page group or lib module), and asserts each path resolves to a real file under the repo root. The script exits non-zero on the first missing path.

**Rationale:** The model is only useful if it stays in sync with the code. LikeC4's own `likec4 validate` validates the model against its own rules; the drift check is the bridge to the filesystem. Running it in CI means a PR that deletes an Astro page without updating the model fails the build.

**Alternatives considered:**

- A LikeC4 `custom validation` rule — would couple the check to LikeC4's plugin API and make the script harder to test in isolation.
- A grep-based check — too noisy: we'd be searching for paths that may legitimately appear in comments, tests, or docs.

### 6. Replace the Mermaid block in `docs/architecture.md` with a narrative pointer

**Decision:** The hand-authored Mermaid `flowchart` blocks in `docs/architecture.md` are deleted and replaced with a single paragraph pointing readers at the LikeC4 model source under `architecture/`. The remainder of the doc (deployment topology notes, naming conventions, glossary) is preserved as narrative.

**Rationale:** Keeping two sources of truth in the repo guarantees drift. The narrative doc explains intent; the LikeC4 model enforces structure.

**Alternatives considered:**

- Keep both — the entire reason for this change is to remove the duplicated source of truth.
- Delete `docs/architecture.md` outright — the doc still has value as a narrative companion and a link target from older specs.

### 7. `architecture-and-guidelines` spec gets a `MODIFIED Requirements` block

**Decision:** The existing `C4 Architecture Documentation` requirement in `openspec/specs/architecture-and-guidelines/spec.md` is amended to require the LikeC4 model and to forbid hand-edited Mermaid outside `architecture/`. A new requirement pins the `bun run arch:check` command as a CI gate.

**Rationale:** The proposal promises a contract change to that capability; a `MODIFIED Requirements` block is the openspec convention for that. Without the spec change, a future contributor could re-introduce a hand-authored Mermaid diagram and the proposal's intent would erode.

**Alternatives considered:**

- A new capability for the model itself, leaving `architecture-and-guidelines` untouched — would leave the existing requirement pointing at a doc that no longer exists, so the spec would still need to be edited.

## Risks / Trade-offs

- **LikeC4 CLI install size and CI cold-start** → Mitigated by running `arch:check` as a separate CI job and caching `node_modules`; the CLI is not loaded by the Astro runtime, only at build/check time.
- **Drift check is path-based and may be too strict** → If an Astro page is moved (rather than deleted), the script will report a false positive. Mitigation: a `--update` flag rewrites the model paths in place; the normal CI run still fails fast, but a one-off `--update` run on a rename PR is a one-liner.
- **Tag taxonomy drift over time** → Mitigation: a small unit test asserts that every element has the four required tags and that the tag values come from a closed enum, so adding a new `domain:` value is a deliberate change.
- **LikeC4 project status** → LikeC4 is under active development; minor versions have shipped breaking changes historically. Pin a major version in `package.json` and bump deliberately, with a `bun run arch:check` gate.
- **Editor coverage for viewing the model** → The LikeC4 VS Code extension is the primary consumer; if a contributor is on an editor without an LSP client, they fall back to `bunx likec4 serve` for a local preview. We document the VS Code extension in `docs/architecture.md` and in the proposal.
- **No public page for non-developer stakeholders** → If a non-engineer ever needs to see the architecture (e.g. an ops runbook), the answer is to export to PNG/SVG/PDF on demand (`bunx likec4 export png -o ./assets`) and commit the image. That is deliberately out of scope here.
