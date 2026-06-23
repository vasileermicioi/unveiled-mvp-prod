# likec4-architecture Specification

## Purpose
TBD - created by archiving change likec4-architecture. Update Purpose after archive.
## Requirements
### Requirement: Code-First C4 Model
The project SHALL maintain a code-first C4 architecture model in LikeC4 (`.likec4` / `.c4` sources under `architecture/`) covering the System Context (L1), Container (L2), Component (L3), Deployment (L4), and Dynamic (L5) levels for every production surface.

#### Scenario: L1 System Context is defined
- **WHEN** an engineer or agent inspects the architecture model
- **THEN** the L1 view identifies the external actors and systems (Guests, Members, Partners, Admins, Stripe, Cloudflare R2, Cloudflare Workers/Pages, Email provider, Browser)
- **AND** each actor/system carries a `role-*` tag

#### Scenario: L2 Container view is defined
- **WHEN** an engineer or agent inspects the architecture model
- **THEN** the L2 view identifies the runtime containers (Astro SSR Worker, React Islands bundle, PGlite (local) / Neon Postgres (prod), Cloudflare R2 bucket, Stripe API client, Email worker, Cron trigger)
- **AND** each container carries a `surface-*` tag

#### Scenario: L3 Component view is defined
- **WHEN** an engineer or agent inspects the architecture model
- **THEN** the L3 view identifies one component per top-level Astro page group (`public-discover`, `member-app`, `admin-panel`, `partner-portal`), per lib module under `src/lib/`, per Astro Action surface, per Drizzle repository, and per Better Auth integration

#### Scenario: L4 Deployment view is defined
- **WHEN** an engineer or agent inspects the architecture model
- **THEN** the L4 view identifies the deployment environments (Local Bun dev, Cloudflare Pages preview, Cloudflare Workers production) with parallel nodes for local PGlite vs. Neon

#### Scenario: L5 Dynamic view is defined
- **WHEN** an engineer or agent inspects the architecture model
- **THEN** the L5 view includes a "Booking lifecycle" dynamic view that walks Member → Astro Action → Booking Transaction → Credit Ledger → Email → R2 in execution order

### Requirement: View Grouping
The LikeC4 model SHALL group its views into a `C4` folder (the canonical C4 hierarchy) and a `Domain views` folder (tag-scoped slices), so reviewers can navigate the model by the C4 progression without confusing a tag-scoped slice with a C4 level.

#### Scenario: C4 folder is the canonical hierarchy
- **WHEN** a reviewer opens any LikeC4-aware viewer (LSP, `likec4 serve`, exported JSON, or any future static export)
- **THEN** views for L1, L2, L3, L4 (sub-grouped under `Deployment`), and L5 appear under a `C4` folder

#### Scenario: Domain views folder holds tag-scoped slices
- **WHEN** a reviewer opens any LikeC4-aware viewer
- **THEN** tag-scoped slices filtered by `surface-*` or `domain-*` appear under a `Domain views` folder
- **AND** the C4 folder is unaffected by the contents of the Domain views folder

### Requirement: Element Tagging
Every element in the LikeC4 model SHALL carry one tag from each of `role-*`, `surface-*`, `domain-*`, and `spec-*` so views and downstream tooling can filter and cross-reference elements.

#### Scenario: Every element has the four required tag prefixes
- **WHEN** the model is built
- **THEN** every element carries exactly one `role-*`, one `surface-*`, one `domain-*`, and one `spec-*` tag
- **AND** the tag values are drawn from a closed enum enforced by a unit test

#### Scenario: Tag values reference openspec domains
- **WHEN** an element's `domain-*` tag is read
- **THEN** it matches an openspec domain (e.g. `domain-discover`, `domain-bookings`, `domain-auth`, `domain-payments`)

#### Scenario: Tag values reference openspec capabilities
- **WHEN** an element's `spec-*` tag is read
- **THEN** it matches the id of an openspec capability that the element belongs to (e.g. `spec-likec4-architecture`, `spec-booking-transactions`)

### Requirement: Drift Check Fails On Missing Paths

A drift check SHALL walk every model element's referenced file path (`metadata.path`) and fail the build if any path is missing from the repo. Every `metadata.path` value SHALL be anchored under one of the live workspace roots declared in `package.json` `workspaces` (`packages/api`, `packages/app`, `packages/landing`, `packages/orchestrator`, `packages/design-system`) so the architecture model cannot regress to pre-monorepo `src/...` paths after a future rename or extraction. A `metadata.path` value is considered anchored when it is exactly the workspace root name (a directory-level path) or when it starts with the workspace root followed by `/` (a file-level path).

#### Scenario: Drift check is wired as a script

- **WHEN** a developer runs `bun run arch:drift`
- **THEN** the script walks every model element
- **AND** asserts each `metadata.path` value is anchored under one of the live workspace roots (`packages/api`, `packages/app`, `packages/landing`, `packages/orchestrator`, `packages/design-system`), matching either the bare root or the root followed by `/`
- **AND** asserts each `metadata.path` value exists in the repo
- **AND** exits non-zero on the first missing path or the first path that is not anchored under a live workspace root.

#### Scenario: Drift check runs in CI

- **WHEN** a pull request is opened or updated
- **THEN** CI runs `bun run arch:check` and `bun run arch:drift`
- **AND** the build fails if either check reports an error
- **AND** a contributor who adds a `metadata.path` value of `src/lib/foo.ts` (or any other non-workspace-root prefix) sees a clear failure that names the offending path.

#### Scenario: Deleting a tracked file fails CI

- **WHEN** a contributor deletes a tracked file (e.g. an Astro page or lib module) without updating the model
- **THEN** the drift check reports the missing path
- **AND** the build fails with a clear error message.

#### Scenario: Drift check supports a deliberate rename

- **WHEN** a contributor renames a tracked file
- **THEN** running `bun run arch:drift --update` rewrites the model paths in place
- **AND** a subsequent `bun run arch:drift` (without `--update`) passes.

#### Scenario: Adding a new live workspace root extends the allow-list

- **WHEN** a contributor adds a new workspace root to `package.json` `workspaces` (e.g. `packages/foo/`)
- **THEN** the drift script's allow-list is updated to include `packages/foo/` in the same change
- **AND** the model can immediately reference files under the new root without the drift check rejecting them.

### Requirement: Cross-References To Specs, Routes, And Tokens
The LikeC4 model SHALL cross-reference TypeSpec routes, gherkin features, and design tokens by id, exposed via `architecture/specs.likec4`.

#### Scenario: Cross-reference file declares the linkages
- **WHEN** a developer opens `architecture/specs.likec4`
- **THEN** the file declares which TypeSpec route, gherkin feature, and design token each model element corresponds to
- **AND** the linkage is expressed by id (string or typed enum), not by free-form text

### Requirement: No Public Architecture Page
The project SHALL NOT expose a public route that renders the C4 model. The model is a developer surface; contributors view it in an editor with a LikeC4 LSP client (e.g. the LikeC4 VS Code extension) or by running `bunx likec4 serve` locally.

#### Scenario: No Astro page renders the model
- **WHEN** an engineer or agent inspects `src/pages/`
- **THEN** there is no `architecture.astro` (or equivalent) file
- **AND** no public route serves the C4 model

#### Scenario: No static export is committed
- **WHEN** an engineer or agent inspects the repo
- **THEN** there is no `public/architecture/` directory checked in
- **AND** `bun run arch:gen` is NOT a defined script in `package.json`

#### Scenario: Non-developer stakeholders can still get a diagram on demand
- **WHEN** a non-developer needs the architecture in a shareable form
- **THEN** an engineer runs `bunx likec4 export png -o ./assets` (or `jpg`/`drawio`/`mmd`) and commits the result
- **AND** the exported artefact is scoped to the runbook or doc that needs it

### Requirement: Model Source Is Excluded From App Checks
The LikeC4 model files under `architecture/` SHALL be excluded from `astro check` and from Biome formatting.

#### Scenario: Astro check skips the model
- **WHEN** `bun run check` runs
- **THEN** files under `architecture/` are not type-checked by `astro check`

#### Scenario: Biome skips the model
- **WHEN** Biome runs as part of `bun run check`
- **THEN** files under `architecture/` are not formatted or linted by Biome

