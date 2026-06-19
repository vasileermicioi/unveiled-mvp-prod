## Context

The production UI has migrated from shadcn/Radix wrappers to HeroUI-backed
primitives under `src/components/ui/`. Two umbrella OpenSpec changes —
`heroui-ladle-design-system` (Ladle as the Storybook replacement, HeroUI
provider + theme module relocated to `src/lib/heroui-theme.ts`) and
`replace-shadcn-with-heroui` (consumer walk, prop-surface preservation,
shadcn scaffold removal) — are still active. The third change in the
sequence, `heroui-parity-and-docs`, was scoped but not yet drafted.

The parity suite under `tests/features/` still contains scenarios that
reference the temporary `mantine-replica/` and `heroui-replica/`
folders. The Ladle coverage gate (`tests/ladle/coverage.ts`) and the
import-graph guard live inside the replica folder itself, which means
they will disappear the moment the replica folder is removed. The
canonical docs (`AGENTS.md`, `docs/guidelines.md`, `CONTRIBUTING.md`),
the LikeC4 model (`architecture/model.ts`), and the live specs
(`openspec/specs/ui-system/spec.md`, `openspec/specs/app-shell/spec.md`)
all still describe the migration in terms of shadcn / Mantine / the
replica. The `design-system-replica` capability spec is empty and
should be retired once the umbrella changes archive.

This change rewires the parity layer, the coverage gate, the visual
baselines, the docs, the architecture model, and the OpenSpec archive
flow so the codebase stops referencing anything but the production
HeroUI primitives.

## Goals / Non-Goals

**Goals:**

- Rewrite the gherkin parity suite so every `@ladle(…)` tag resolves to
  a story backed by the production HeroUI primitive under
  `src/components/ui/`, with a co-located `<Component>.ladle.tsx`
  harness where required.
- Move the import-graph guard out of the replica folder into a permanent
  unit test (`tests/unit/no-ladle-replica-in-production.test.ts`) so the
  replica folder can be deleted without losing the safety net.
- Update `AGENTS.md`, `docs/guidelines.md`, `CONTRIBUTING.md`, and the
  LikeC4 model so they describe HeroUI as the production library and
  drop every Mantine / shadcn / Storybook / replica reference.
- Fold the final spec deltas into the live `ui-system` and `app-shell`
  specs and retire `design-system-replica`.
- Validate and archive the three umbrella changes
  (`heroui-ladle-design-system`, `replace-shadcn-with-heroui`,
  `heroui-parity-and-docs`) so the active `openspec/changes/` tree is
  empty.

**Non-Goals:**

- Rewriting the HeroUI primitives themselves (already done by the
  umbrella slices).
- Changing the public prop surface of any HeroUI-backed primitive
  beyond what the umbrella already shipped.
- Introducing a new component library, design system, or Storybook
  replacement.
- Touching any capability spec unrelated to `app-shell`, `ui-system`, or
  `design-system-replica`.

## Decisions

- **Ladle coverage gate rewrites from a replica-aware walk to a
  production-only walk.** The coverage script currently special-cases the
  replica folder paths because the production primitives did not exist
  yet. Decision: the script will walk `src/components/ui/` and
  `tests/features/` for `@ladle(component=…, story=…)` tags and resolve
  each story through the production primitive's default export. Stories
  whose `component` value comes from a path matching
  `src/components/ui/*-replica/` are flagged as drift and fail the gate.
  Rationale: the production primitives are now the only source of truth,
  so the gate should be a flat walk instead of a special-cased one.

- **Import-graph guard moves from inside the replica folder to a
  permanent unit test.** Decision: relocate
  `src/components/ui/heroui-replica/__tests__/no-production-import.test.ts`
  (or its current name) to
  `tests/unit/no-ladle-replica-in-production.test.ts`. The test walks
  every production entry point under `src/components/unveiled/`,
  `src/components/payments/`, `src/components/providers/`,
  `src/pages/`, and `src/layouts/` and fails if any transitive import
  lands inside a folder matching `src/components/ui/*-replica/`
  (case-insensitive). Rationale: the guard must outlive the replica
  folder so a future staging folder cannot leak back into production.

- **Visual regression baselines are regenerated for the new HeroUI
  primitives.** Decision: any primitive whose pixel output changed
  during the migration gets a new approved baseline under
  `tests/visual/`; the prior shadcn baseline is archived with a
  `*.pre-heroui.png` marker so the suite no longer references the old
  library. Rationale: visual regression must describe the production
  pixel output, not the intermediate state.

- **Docs and LikeC4 model describe HeroUI as the production library.**
  Decision: `AGENTS.md` lists HeroUI under "Tech stack", drops the
  "Hero UI library is kept in `devDependencies`" exception (the replica
  is gone), and updates the toolchain command table to reflect the
  renamed coverage gate. `docs/guidelines.md` describes HeroUI's
  theming + prop-forwarding conventions and Ladle story requirements.
  `CONTRIBUTING.md` drops the Storybook workflow notes. The LikeC4
  model rewires the component-library dependency node from
  shadcn/Mantine to HeroUI. Rationale: docs are part of the contract;
  drift between docs and code is what the umbrella is trying to close.

- **OpenSpec archive is the closing gate.** Decision: the umbrella
  changes archive only after `openspec validate` is green and the
  `bun run check` matrix is green. The `design-system-replica`
  capability is retired by the REMOVED delta shipped in this change.
  Rationale: leaving the replica capability live would re-open the
  drift window for future contributors.

## Risks / Trade-offs

- [Gherkin scenarios depend on shadcn/Radix-specific DOM structures]
  → Mitigation: rewrite selectors to use the proximity / aria
  discipline already in place under `tests/steps/`; any selector that
  must reach into Radix internals is rewritten as
  `getByRole` / `getByLabel` / `getButtonNearestTo` against the
  HeroUI-rendered DOM.

- [Coverage gate rewrite silently loses a story] → Mitigation: run
  `bun run ladle:coverage` before and after the rewrite; the pre-rewrite
  list of `(component, story)` tuples becomes the acceptance set the
  post-rewrite walk must reproduce.

- [Docs drift re-emerges after the archive] → Mitigation: add a CI
  grep that fails when `grep -R "mantine\|shadcn" tests/ docs/
  openspec/ AGENTS.md CONTRIBUTING.md components.json` returns a hit
  (case-insensitive), so any future contributor who reintroduces a
  reference breaks the build.

- [Visual baselines were not refreshed in time] → Mitigation: block
  this change's PR on a clean `bun run test:e2e` run that exercises
  every primitive listed in the new `ui-system-heroui-parity` spec.

- [LikeC4 model rewiring triggers a downstream diagram regeneration]
  → Mitigation: run `bun run arch:check` and regenerate the C4 diagrams
  from the updated `architecture/model.ts` before opening the PR, so
  the diagrams and the model agree at merge time.