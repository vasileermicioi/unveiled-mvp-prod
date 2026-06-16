## Context

The Unveiled production UI surface is built on shadcn/ui — a copy-paste, Tailwind-based stack. The team has decided that shadcn/ui's lack of selector discipline (it ships unstyled Radix primitives plus per-file `class-variance-authority` trees) is unsustainable for a long-lived design system. The umbrella #32 spec considered a move to Hero UI; the abandoned #34 spec explored it further. Both were paused because Hero UI's React 19 story is still pre-stable and the visual result was not brand-faithful enough to commit to without a side-by-side comparison.

Mantine 9 is a stronger candidate: it is React 19-ready, ships a real component API with a `theme.components` override surface, and has well-documented support for global CSS variables and design-token ingestion via `theme.other`. The catch is that adopting Mantine is a cross-cutting migration that touches every primitive in `src/components/ui/` and every consumer under `src/components/`. Before that work begins, the team needs a decision-grade visual of the end state.

This change produces that visual as a Ladle-only design system. It is co-located under `src/components/ui/mantine-replica/` so the import paths mirror what a future production migration would use, but every file carries a `// @ladle-only` header and an import-graph test guarantees the production app cannot reach it. The replica consumes `@mantine/core`, `@mantine/hooks`, and `@mantine/notifications` as dev dependencies; the production bundle is unchanged.

Stakeholders: the design-systems working group, the Ladle/test owner, and the lead of the next migration change (#36 in the iteration plan). The output of this change is the visual contract the migration change will adopt.

## Goals / Non-Goals

**Goals:**

- Produce a brand-faithful Mantine 9 rendering of every primitive in `src/components/ui/` (and the additional surfaces the production app will need once a Mantine migration begins: `Modal`, `Drawer`, `Tabs`, `Menu`, `Notification`).
- Drive the Mantine theme exclusively from `design-tokens.json` so the replica is provably the same brand as the production app.
- Ship the replica as a Ladle-only design system reachable from a single `design-system-overview` Ladle page, with one story per `variant` × `size` × `state` combination.
- Provide a CI gate (`bun run design-system-replica:check`) that enforces: Ladle-only isolation, replica coverage of the inventory, brand-token-driven theming, no new hex literals, and `ladle:coverage` passing.
- Leave the production app, `design-tokens.json`, `AGENTS.md`, `docs/guidelines.md`, `architecture/model.ts`, and every existing capability spec untouched.

**Non-Goals:**

- Replacing or modifying any file under `src/components/ui/` outside the new `mantine-replica/` folder.
- Promoting `@mantine/*` from `devDependencies` to `dependencies`. That move is the responsibility of the next change.
- Rewriting the production app to consume Mantine. That is the responsibility of the next change.
- Updating `AGENTS.md`, `docs/guidelines.md`, `architecture/model.ts`, or any capability spec other than the new `design-system-replica` spec. The next change owns those updates.
- Adding new design tokens. The replica reads what exists.
- Replicating `SafeImage`. It is not a shadcn surface and there is no Mantine primitive that improves it.

## Decisions

### Decision: Co-locate the replica under `src/components/ui/mantine-replica/`

The replica sits in `src/components/ui/mantine-replica/` (not `tests/ladle/` or a new top-level folder) so the import paths mirror what the next change will see. This makes the migration a textual refactor rather than a path rewrite.

- **Alternative considered:** put the replica under `tests/ladle/mantine-replica/`. Rejected — the next change would have to rewrite every import path, which is a needless source of churn.
- **Alternative considered:** put the replica at a top-level `design-systems/mantine/`. Rejected — splits the design-system surface across two roots and breaks the "components live under `src/components/ui/`" convention.

### Decision: Use a `// @ladle-only` header on every replica file

Every `.tsx` file under `src/components/ui/mantine-replica/` starts with `// @ladle-only` so future contributors see the constraint at the top of the file. The header is enforced by `bun run design-system-replica:check` and the import-graph test, but the inline comment is the first line of defense.

- **Alternative considered:** enforce isolation purely with the import-graph test. Rejected — tests catch regressions after they happen, the header prevents them at write time.
- **Alternative considered:** use a separate `tsconfig.ladle.json` exclude. Rejected — Bun + Astro + Ladle does not have a clean way to exclude a single subfolder from the typecheck, and Biome's `include` model would have to be reworked.

### Decision: Wire every design token through `theme.other` and `theme.colors`

`mantine-replica/theme.ts` reads `design-tokens.json` and feeds every named color into a Mantine color tuple (10 shades) under `theme.colors` and the named singletons under `theme.other`. The component overrides then read from `theme.other.brandDark` / `theme.other.brandWhite` etc., never from inline hex strings. The `design-system-replica:check` script greps the replica folder for `/#[0-9a-fA-F]{3,8}/` to prove no new hex literal is introduced.

- **Alternative considered:** re-derive a 10-shade scale from a single hex using Mantine's color manipulation utilities. Rejected — the design tokens are already a 10-shade scale; re-deriving them is a second source of truth.
- **Alternative considered:** import the design tokens as CSS variables only and let Mantine read from `var(--brand-yellow)`. Rejected — Mantine's `theme.colors` API expects a tuple of strings, not a CSS variable reference, and the Cloudflare bundle would have to inline the variable resolution.

### Decision: Use `theme.components` for the brand overrides (not global CSS)

Mantine's `theme.components` API lets each Mantine primitive accept `classNames`, `vars`, and `defaultProps` overrides. The replica registers overrides for `Button`, `Badge`, `TextInput`, `Textarea`, `Select`, `Card`, `Paper`, `Divider`, `Modal`, `Drawer`, `Popover`, `Tabs`, `Menu`, and `Notification` in `theme.ts`. The 4px hard border, uppercase tracking, and hard `4px 4px 0 0` shadow all live in the override layer.

- **Alternative considered:** layer `:where(.mantine-Button-root)` rules in `src/styles/global.css`. Rejected — bypasses Mantine's theme API, makes the override fragile across version bumps, and forces a second source of truth for brand intent.

### Decision: Mirror the production variant/size names exactly on `MantineButton`

`MantineButton` re-exports the production `Button` variant names (`default`, `primary`, `secondary`, `yellow`, `active`, `copied`, `destructive`, `ghost`, `outline`, `muted`, `link`) and size names (`default`, `sm`, `lg`, `icon`, `icon-sm`) and maps them onto Mantine `Button`'s own `variant` and `size` enums inside the wrapper. The Ladle stories iterate the same matrix the production `Button` exposes, so the side-by-side comparison is exhaustive.

- **Alternative considered:** adopt Mantine's own variant names. Rejected — the comparison is supposed to be a drop-in visual, not a vocabulary reset.

### Decision: Adopt `withMantine` into `src/lib/utils.ts` only in the next change

`mantine-replica/cn.ts` exports both `cn` (re-exported from `@/lib/utils`) and a new `withMantine(props, style, classNames)` helper that merges a `style` prop, a `classNames` object, and the brand-token CSS variables. The helper lives in the replica for now; the next change moves it to `src/lib/utils.ts`. This keeps the helper visible in the replica (so the stories can use it) without exporting it from a production module until the migration is committed.

- **Alternative considered:** add `withMantine` directly to `src/lib/utils.ts` in this change. Rejected — `src/lib/utils.ts` is imported by the production app, which would force `@mantine/*` into production `dependencies` before the migration is decided.

### Decision: Cover surfaces the production app does not yet use

The replica includes `MantineModal`, `MantineDrawer`, `MantineTabs`, `MantineMenu`, and `MantineNotification` even though `src/components/ui/` has no shadcn counterparts. The point of the replica is to prove the look-and-feel works for every Mantine primitive the next change will need. The `proves` column in `INVENTORY.md` records which rows are proactive (no current shadcn counterpart) vs. reactive (mirroring an existing primitive).

- **Alternative considered:** only replicate what shadcn ships. Rejected — the next change will need those primitives, and a partial replica forces a second round of visual review.

### Decision: Add `bun run design-system-replica:check` as a top-level script and wire it via `bun run check:replica`

`package.json` gains two new scripts: `design-system-replica:check` (the actual checks) and `check:replica` (an umbrella that runs `design-system-replica:check` + `ladle:coverage` + `check`). The umbrella is what CI invokes. The two-script split keeps the focused check fast for local iteration and the umbrella the source of truth for CI.

- **Alternative considered:** add the check directly to the existing `bun run check` chain. Rejected — `bun run check` is a pre-commit invariant for the production app; the replica is opt-in until the next change promotes it.

## Risks / Trade-offs

- **[Replica is reachable from a production file by accident]** → Mitigation: `// @ladle-only` header on every file, the import-graph unit test, and the `design-system-replica:check` script that greps for imports from `src/components/ui/mantine-replica/`.
- **[`@mantine/*` dev dependencies drift from what the next change promotes]** → Mitigation: pin to the same versions in `devDependencies` that the next change will move to `dependencies`; the `package.json` block is a one-line move.
- **[A new shadcn primitive is added under `src/components/ui/` and the replica misses it]** → Mitigation: `design-system-replica:check` walks `src/components/ui/` (excluding the replica folder) and asserts every file appears as a row in `INVENTORY.md`. Adding a primitive without updating the inventory fails CI.
- **[Brand drift between replica and production]** → Mitigation: `theme.ts` reads `design-tokens.json` directly, `design-system-replica:check` greps for hex literals in the replica folder, and `bun run tokens:check` (already wired into `bun run check`) detects drift in the source tokens.
- **[A Mantine 9 minor release breaks a `theme.components` override]** → Mitigation: pin the three `@mantine/*` packages; the next change is responsible for bumping and re-validating the replica as part of the migration.
- **[`bun run ladle:coverage` walker does not descend into the new folder]** → Mitigation: the next change task list includes a verification step that runs `bun run ladle:coverage` against the new files; the `design-system-replica:check` script calls `bun run ladle:coverage` and fails on drift.
- **[The umbrella #32 spec and the abandoned #34 spec become stale]** → Acknowledged — they are annotated in a follow-up commit (not in this change) to point at the replica change as the source of truth for the visual decision.

## Migration Plan

There is no production migration in this change. The next change (#36 in the iteration plan) is responsible for:

1. Promoting `@mantine/core`, `@mantine/hooks`, `@mantine/notifications` from `devDependencies` to `dependencies`.
2. Replacing each production primitive in `src/components/ui/` with the corresponding `Mantine<Name>` wrapper (and adopting `withMantine` into `src/lib/utils.ts`).
3. Removing the `// @ladle-only` headers and the `replica-not-imported.test.ts` once the migration is committed.
4. Updating `AGENTS.md`, `docs/guidelines.md`, `architecture/model.ts`, the `app-shell` capability spec, and the umbrella #32 / abandoned #34 specs.

This change ships the artifact those steps consume.

## Open Questions

- Should `MantineButton`'s `active` variant use Mantine's `data-active` attribute on the rendered `Button`, or should the wrapper force it via `classNames`? Default: `data-active`, since Mantine 9 documents it as the supported hook for "pressed" state.
- Should the design-system overview live in Ladle's "Pages" tab (the default for `*.ladle.tsx` files) or be promoted to a "Storybook-style" home page via a custom Ladle config? Default: default Pages tab, since the next change is the right place to add custom Ladle config if the team wants a dedicated landing page.
- Do we want the replica to import from `src/styles/global.css` for the `unveiled-shadow` token, or duplicate the value in `theme.ts`? Default: import from `global.css` so the brand-token pipeline is the single source of truth.
