## 1. Toolchain and Scripts

- [x] 1.1 Add `likec4` as a dev dependency in `package.json` and pin a major version
- [x] 1.2 Add `arch:check` and `arch:drift` scripts in `package.json` (`arch:check` → `likec4 validate` + drift check, `arch:drift` → drift check)
- [x] 1.3 Exclude the `architecture/` directory from `astro check` and from Biome formatting (via `biome.json` ignore list or `tsconfig.json` include boundary)
- [x] 1.4 Add a CI job that runs `bun run arch:check` on every PR; the build fails if the model does not compile or a referenced file path is missing from the repo

## 2. Baseline C4 Model

- [x] 2.1 Create `architecture/model.likec4` defining the L1 System Context: Guests, Members, Partners, Admins, Unveiled (system), Stripe, Cloudflare R2, Cloudflare (Workers/Pages), Email provider, Browser, with relationships
- [x] 2.2 Extend the model with the L2 Container view: Astro SSR Worker, React Islands bundle, PGlite (local) / Neon Postgres (prod), Cloudflare R2 bucket, Stripe API client, Email worker, Cron trigger
- [x] 2.3 Extend the model with the L3 Component view: one component per top-level Astro page group (`public-discover`, `member-app`, `admin-panel`, `partner-portal`), per lib module under `src/lib/`, per Astro Action surface, per Drizzle repository, and per Better Auth integration
- [x] 2.4 Extend the model with the L4 Deployment view: Local Bun dev, Cloudflare Pages preview, Cloudflare Workers production, with parallel nodes for local PGlite vs. Neon
- [x] 2.5 Extend the model with the L5 Dynamic view: a "Booking lifecycle" walk from Member → Astro Action → Booking Transaction → Credit Ledger → Email → R2
- [x] 2.6 Tag every model element with `role-*`, `surface-*`, `domain-*`, and `spec-*` tags; add a unit test that asserts every element carries the four required prefixes and that the tag values come from a closed enum
- [x] 2.7 Create `architecture/views.likec4` with the L1/L2/L3/L5 view definitions grouped into a `C4` folder (L4 sub-grouped under `Deployment`), plus a `Domain views` folder for tag-scoped slices
- [x] 2.8 Create `architecture/specs.likec4` cross-referencing TypeSpec routes, gherkin features, and design tokens by id

## 3. Drift Check

- [x] 3.1 Implement `scripts/check-architecture-drift.ts` that walks every model element, extracts the `metadata.path` value, and asserts the path exists in the repo
- [x] 3.2 Support a `--update` mode that rewrites the model paths in place after a deliberate rename (used by the renaming PR itself, not by CI)
- [x] 3.3 Add a unit test that introduces a fake model element with a non-existent path and asserts the script exits non-zero
- [x] 3.4 Wire the script as `bun run arch:drift` and run it from the `arch:check` CI job

## 4. Documentation and Spec Update

- [x] 4.1 Replace the hand-authored Mermaid block in `docs/architecture.md` with a narrative pointing at the LikeC4 model source; preserve the surrounding topology/protocols narrative and add a pointer to the LikeC4 VS Code extension for viewing the diagrams
- [x] 4.2 Update `openspec/specs/architecture-and-guidelines/spec.md` with a `## MODIFIED Requirements` block: require the LikeC4 model, forbid hand-edited Mermaid outside `architecture/`, and require `bun run arch:check` to pass in CI
- [x] 4.3 Note in `docs/architecture.md` that the LikeC4 model source under `architecture/` is the single source of truth

## 5. Verification

- [x] 5.1 Run `bun run check` (astro check + biome) and resolve any errors introduced by the new files
- [x] 5.2 Run `bun run arch:check` and resolve any model errors
- [x] 5.3 Run `bun run arch:drift` and resolve any missing-path findings
- [x] 5.4 Verify the `C4` and `Domain views` folders appear in the exported JSON (or in the LSP / `likec4 serve`) and that the L1–L5 views are present
- [x] 5.5 On a scratch branch, delete a tracked file (e.g. an Astro page) without updating the model and confirm CI fails with a clear drift error
