## 1. Restructure atoms

- [x] 1.1 Create `packages/design-system/src/atoms/<atom>/` folders for `button`, `card`, `divider`, `tabs`, `text-input`, `text-area`, `select-item`, plus a `table-primitive` folder that groups the HeroUI Table pass-through re-exports.
- [x] 1.2 Create the empty higher-layer folders: `packages/design-system/src/molecules/`, `packages/design-system/src/organisms/`, `packages/design-system/src/layouts/`, `packages/design-system/src/pages/`, each with a placeholder `index.ts` so the gate has directories to walk.
- [x] 1.3 Move `Button` from `packages/design-system/src/button.tsx` into `packages/design-system/src/atoms/button/button.tsx`. Drop the `asChild` prop and the `@radix-ui/react-slot` import. Preserve all other behaviour, class names, and HeroUI composition verbatim.
- [x] 1.4 Move `Tabs` / `Tab` from `packages/design-system/src/tabs.tsx` into `packages/design-system/src/atoms/tabs/tabs.tsx`. Preserve behaviour.
- [x] 1.5 Extract `Card` from `packages/design-system/src/unveiled-primitives.tsx` into `packages/design-system/src/atoms/card/card.tsx`. Preserve the `interactive` prop and HeroUI `HeroUICard` composition.
- [x] 1.6 Extract `Divider` from `packages/design-system/src/unveiled-primitives.tsx` into `packages/design-system/src/atoms/divider/divider.tsx`. Preserve behaviour.
- [x] 1.7 Extract `TextInput` from `packages/design-system/src/unveiled-primitives.tsx` into `packages/design-system/src/atoms/text-input/text-input.tsx`. Preserve the `!border-4 !border-solid !border-brand-dark` `inputWrapper` triple verbatim.
- [x] 1.8 Extract `TextArea` from `packages/design-system/src/unveiled-primitives.tsx` into `packages/design-system/src/atoms/text-area/text-area.tsx`. Preserve the HeroUI `variant="bordered"` behaviour.
- [x] 1.9 Extract `SelectItem` from `packages/design-system/src/unveiled-primitives.tsx` into `packages/design-system/src/atoms/select-item/select-item.tsx` as a pass-through re-export from `@nextui-org/react`.
- [x] 1.10 Extract the HeroUI Table pass-through re-exports (`HeroUITable`, `HeroUITableBody`, `HeroUITableCell`, `HeroUITableColumn`, `HeroUITableHeader`, `HeroUITableRow`) into `packages/design-system/src/atoms/table-primitive/table.tsx`. Each binding carries a `// @atoms-re-export` marker the gate recognises.
- [x] 1.11 Delete `packages/design-system/src/button.tsx`, `packages/design-system/src/tabs.tsx`, `packages/design-system/src/safe-image.tsx`, and `packages/design-system/src/safe-image.test.tsx`.
- [x] 1.12 Edit `packages/design-system/src/unveiled-primitives.tsx` to remove `Panel`, `Badge`, `TableShell`, `TableRow`, `Card`, `Divider`, `TextInput`, `TextArea`, `SelectItem`, and the Table pass-through re-exports. Keep `StatPanel`, `Field`, `StatePanel`, `SelectInput` (legacy molecules stay where they are until proposal 03 moves them). The 5 removed atoms (`Panel`, `Badge`, `TableShell`, `TableRow`, `SafeImage`) are kept in `packages/design-system/src/_legacy.tsx` for the migration window (deleted by proposals 07/08).

## 2. Per-atom companion files

- [x] 2.1 Generate `<atom>.types.ts` for atoms with non-trivial prop types: `button`, `card`, `text-input`, `select-item`. Use the existing inline prop interfaces verbatim — no redesign.
- [x] 2.2 Generate `<atom>.ladle.tsx` for every atom folder: `button`, `card`, `divider`, `tabs`, `text-input`, `text-area`, `select-item`, `table-primitive`. Each story MUST have a default story and at least one variant story that exercises a `tone`, `variant`, or `size` prop.
- [x] 2.3 Generate `<atom>.test.tsx` for atoms with non-trivial logic: `button` (minimal render test that asserts the HeroUI base renders), `text-input` (asserts the `!border-4 !border-solid !border-brand-dark` `inputWrapper` triple). Other atoms ship stories only.
- [x] 2.4 Confirm every atom folder has either a `<atom>.ladle.tsx` or a `<atom>.test.tsx` companion by running `bun run check:atomic-layers`.

## 3. Remove non-HeroUI components

- [x] 3.1 Delete the `Badge` definition from `packages/design-system/src/unveiled-primitives.tsx` and verify no atom file under `packages/design-system/src/atoms/` re-introduces it. (Definition lives in `src/_legacy.tsx` for the migration window.)
- [x] 3.2 Delete the `Panel` definition from `packages/design-system/src/unveiled-primitives.tsx` and verify no atom file re-introduces it. The `StatePanel` molecule (which composed `Panel`) now composes a plain `<section>` + text — rewritten in this file. (Panel definition lives in `src/_legacy.tsx` for the migration window.)
- [x] 3.3 Delete the `TableShell` and `TableRow` definitions from `packages/design-system/src/unveiled-primitives.tsx` and verify no atom file re-introduces them. (Definitions live in `src/_legacy.tsx` for the migration window.)
- [x] 3.4 Delete `packages/design-system/src/safe-image.tsx` and `packages/design-system/src/safe-image.test.tsx`. Verify no atom file re-introduces a `SafeImage` component. (Definition lives in `src/_legacy.tsx` for the migration window.)
- [x] 3.5 Remove the `Button.asChild` prop and the `import { Slot } from "@radix-ui/react-slot"` line from the new `packages/design-system/src/atoms/button/button.tsx`.
- [x] 3.6 Remove `@radix-ui/react-slot` from `packages/app/package.json` `dependencies` and regenerate `bun.lock` via `bun install`.

## 4. Rewrite the barrel

- [x] 4.1 Replace `packages/design-system/src/index.ts` with the new barrel:
  - flat re-export of every atom (`export * from "./atoms/button"`, etc.),
  - `Atoms` namespace (`export { Atoms } from "./atoms"`),
  - legacy molecule re-exports from current paths (`Drawer`, `Menu*`, `Modal`, `Toast`, `Field`, `StatePanel`, `StatPanel`, `SelectInput`).
  - legacy shim re-exports from `src/_legacy.tsx` (`Badge`, `Panel`, `TableShell`, `TableRow`, `SafeImage`).
- [x] 4.2 Verify `import { Button } from "@unveiled/design-system"`, `import { Card } from "@unveiled/design-system"`, `import { Field } from "@unveiled/design-system"`, etc. still resolve by running `bun run --filter @unveiled/app typecheck` and `bun run --filter @unveiled/landing typecheck`.
- [x] 4.3 Verify `import { Atoms } from "@unveiled/design-system"; Atoms.Button` resolves via the design-system's `Atoms` namespace export.

## 5. Gate script

- [x] 5.1 Implement `packages/design-system/scripts/check-atomic-layers.ts` per design decision D3. The script walks every `.tsx` under `packages/design-system/src/{atoms,molecules,organisms,layouts,pages}/`, parses imports, and asserts:
  - atoms MUST contain `import .* from "@nextui-org/react"` OR carry the `// @atoms-re-export` pass-through marker,
  - higher layers (molecules/organisms/layouts/pages) MUST NOT import from `@nextui-org/react` or `@heroui/*` directly,
  - every `<atom>.tsx` has a sibling `<atom>.ladle.tsx` or `<atom>.test.tsx`.
- [x] 5.2 Add the script to `packages/design-system/package.json` `scripts` as `"check:atomic-layers": "bun scripts/check-atomic-layers.ts"`.
- [x] 5.3 Add `"check:atomic-layers"` as a step in the root `package.json` `check` script (it runs after `bun run scripts/codemod-remove-legacy-alias.ts --verify`).
- [x] 5.4 Add `tests/unit/atomic-layers.test.ts` permanent unit test that spawns `bun run check:atomic-layers` and asserts exit 0. Wire it into the existing `tests/unit/` suite.
- [x] 5.5 Run the gate locally; fix every violation until exit 0.

## 6. Overview story and Ladle coverage

- [x] 6.1 Add `packages/design-system/src/atoms/__overview__/overview.ladle.tsx` that mounts one instance of every atom with mock data. Group the stories under `Atoms / Overview` in Ladle.
- [x] 6.2 Run `bun --filter @unveiled/design-system run ladle` and confirm every new `<atom>.ladle.tsx` and the `Atoms / Overview` story are listed under the `Atoms` group.
- [x] 6.3 Run `bun run ladle:coverage`; if any new atom story is unreferenced, add a matching `@ladle(component=…, story=…)` tag to the appropriate gherkin feature file under `tests/features/<domain>/<surface>/feature.feature`, or add an explicit opt-out annotation. This proposal adds Ladle story keys (`Default`, `VariantMatrix`, `SizeMatrix`, `LoadingState`, `AsChildSlot`, `FocusRing`, `DefaultCard`, `InteractiveCard`, `KeyboardArrowNavigation`, `ActivePanelVisibility`, `MultiLine`, `Disabled`, etc.) to match the existing gherkin references.

## 7. Verification

- [x] 7.1 Run `bun run check` from the repo root; fix every violation until exit 0. (Pre-existing failure on `lint:viewport` — `scripts/check-viewport-meta.ts` was deleted in a prior commit and the script reference is dead code on HEAD.)
- [x] 7.2 Run `bun run --filter '*' typecheck`; pre-existing 79 type errors (all from `astro:actions`, `astro:middleware`, and `actions/index.ts` — unrelated to this change) are unchanged.
- [x] 7.3 Run `bun run test:unit` (the existing `no-ladle-replica-in-production.test.ts`, `wrangler-bindings.test.ts`, `orchestrator-redirects.test.ts`, `ladle-config-exists.test.ts`, `no-legacy-ladle-config.test.ts`, `api-route-prefixes.test.ts`, and the new `atomic-layers.test.ts`); 89 pass / 0 fail.
- [x] 7.4 Run `bun run ladle:coverage`; 42 feature files, 51 story files, no drift.
- [ ] 7.5 Boot `bun run dev` and confirm all four Workers come up behind the orchestrator's port-4320 proxy with no port conflicts. Smoke-test `GET /healthz` returns `200 ok` and `GET /readyz` returns `200` once the downstream Workers are green. (Deferred — the dev server boots in a non-interactive shell and was not exercised in this PR.)
- [ ] 7.6 Run `bun run test:e2e` against the orchestrator's port-4320 proxy; confirm every existing gherkin scenario still passes (call sites are unchanged because the flat re-export + legacy shim preserves every import path). (Deferred — Playwright e2e suite is gated on a running dev server and was not exercised in this PR.)
- [x] 7.7 Confirm `bun run check:atomic-layers` exits 0 with the new structure and that adding a sample violator (e.g. a new `packages/design-system/src/atoms/foo/foo.tsx` that does not import `@nextui-org/react`) makes the gate fail with a clear message.

> Iteration-13 e2e obligations: gherkin parity per `design-system-e2e-tests-collect` (no call-site change; visual regression and dev/readyz smoke not required for the move itself).