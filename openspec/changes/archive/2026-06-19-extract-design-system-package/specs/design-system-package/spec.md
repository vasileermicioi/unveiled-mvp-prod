## ADDED Requirements

### Requirement: `@unveiled/design-system` is a Bun workspace package

The system MUST ship `@unveiled/design-system` as a Bun workspace member under `packages/design-system/`. The package MUST be `private: true`, declare `"name": "@unveiled/design-system"`, and ship the scripts `dev`, `build`, `typecheck`, `lint`, `test:unit`, `ladle`, `ladle:build`, `ladle:coverage`, and `heroui-design-system-replica:check`.

#### Scenario: Package is discoverable as a workspace member

- **WHEN** `bun pm ls` (or the Bun workspace equivalent) is run from the repo root
- **THEN** `@unveiled/design-system` appears in the workspace list with `private: true`
- **AND** its `package.json` `exports` map exposes `.` for runtime primitives and `./heroui-replica` for the Ladle-only replica.

#### Scenario: Package scripts exist and resolve

- **WHEN** a contributor runs `bun --filter @unveiled/design-system run <script>` for each of `dev`, `build`, `typecheck`, `lint`, `test:unit`, `ladle`, `ladle:build`, `ladle:coverage`, `heroui-design-system-replica:check`
- **THEN** the package's `package.json` defines a script under that name and the filter invocation exits with code zero.

### Requirement: `@unveiled/design-system` exposes the production UI primitives

The package's main entry (`packages/design-system/src/index.ts`) MUST re-export every production primitive that previously lived under `src/components/ui/` (`Button`, `Panel`, `Card`, `Badge`, `StatPanel`, `Divider`, `StatePanel`, `Field`, `TextInput`, `SelectInput`, `TextArea`, `Modal`, `Drawer`, `Tabs`, `Menu`, `Toast`, `Notification`, `Skeleton`, `SafeImage`, `UnveiledPrimitives`), preserving their public prop surface and HeroUI-backed implementation.

#### Scenario: All production primitives are re-exported

- **WHEN** a downstream package (e.g. `@unveiled/app`, `@unveiled/landing`) imports a production primitive from `@unveiled/design-system`
- **THEN** the import resolves to a module under `packages/design-system/src/` that composes the same HeroUI component the previous `src/components/ui/<primitive>.tsx` file composed
- **AND** the public prop surface (`variant`, `size`, `tone`, `shadow`, `interactive`, `state`, `loading`, `asChild`, `open`, `onClose`, `title`, `label`, `hint`, `error`, `value`, `onChange`, `disabled`, …) is preserved exactly.

#### Scenario: No legacy alias remains for the old location

- **WHEN** the repo is searched for a non-test, non-doc file that imports a primitive from `@/components/ui/`
- **THEN** zero hits are returned (the legacy `@/components/ui/...` alias is removed by change 04; until then, no production file may import a primitive that has been moved into the package).

### Requirement: `@unveiled/design-system` owns the Ladle-only HeroUI replica

The package MUST ship `packages/design-system/src/heroui-replica/` as the Ladle-only HeroUI replica, re-exported via `packages/design-system/src/heroui-replica/index.ts`. The replica's import-isolation contract MUST remain identical to the previous `src/components/ui/heroui-replica/` contract: every file carries the `// @ladle-only` header, no production code outside the package imports it, and the `heroui-design-system-replica:check` script (now runnable as `bun --filter @unveiled/design-system run heroui-design-system-replica:check`) still enforces the gate.

#### Scenario: Replica is reachable only through the Ladle-only export

- **WHEN** a file outside `packages/design-system/src/heroui-replica/` imports from `@unveiled/design-system/heroui-replica`
- **THEN** `bun --filter @unveiled/design-system run heroui-design-system-replica:check` fails and names the offending file and import line.

#### Scenario: Replica isolation guard passes in CI

- **WHEN** CI runs `bun run check`
- **THEN** the unit test `packages/design-system/src/heroui-replica/isolation.test.ts` (relocated from `src/components/ui/heroui-replica/replica-not-imported.test.ts`) passes, asserting the import graph of every production entry point in `packages/app/src/**`, `packages/landing/src/**`, and the package's own runtime export never reaches a module under `packages/design-system/src/heroui-replica/`.

### Requirement: `@unveiled/design-system` owns the Ladle harness

The package MUST own the Ladle config (`packages/design-system/ladle.config.ts`), the co-located Ladle stories for every production primitive, and the Ladle-only stories for every `Hero<Name>` replica component. Running `bun --filter @unveiled/design-system run ladle` MUST serve the harness on port 6006, and `bun --filter @unveiled/design-system run ladle:build` MUST write the static build to `packages/design-system/dist/ladle/`.

#### Scenario: Ladle harness boots from the package

- **WHEN** a contributor runs `bun --filter @unveiled/design-system run ladle` from the repo root
- **THEN** the Ladle dev server starts on port 6006 and lists every co-located story under `packages/design-system/src/**/*.ladle.tsx`.

#### Scenario: Ladle static build targets the package dist

- **WHEN** `bun --filter @unveiled/design-system run ladle:build` completes
- **THEN** `packages/design-system/dist/ladle/index.html` exists and the directory is excluded from Biome formatting in the package's `biome.json`.

### Requirement: `@unveiled/design-system` owns design-token CSS

The package MUST ship the generated design-token CSS at `packages/design-system/src/styles/generated/tokens.css` (relocated from `src/styles/generated/tokens.css`) and MUST export it under `./styles/generated/tokens.css` in its `exports` map. `bun run tokens:gen` MUST write into the package, and `bun run tokens:check` MUST continue to fail on drift.

#### Scenario: Tokens are generated into the package

- **WHEN** `bun run tokens:gen` runs
- **THEN** `packages/design-system/src/styles/generated/tokens.css` is written with the same `--unveiled-*` CSS custom properties that previously lived in `src/styles/generated/tokens.css`.

#### Scenario: Tokens check still detects drift

- **WHEN** `bun run tokens:check` runs after `design-tokens.json` is edited without regenerating
- **THEN** it fails and names the drifted file (`packages/design-system/src/styles/generated/tokens.css`).

#### Scenario: Downstream apps consume tokens through the package

- **WHEN** `packages/app/src/styles/global.css` (or `packages/landing/src/styles/global.css` in change 05) imports `@unveiled/design-system/styles/generated/tokens.css`
- **THEN** the Tailwind v4 `@theme inline` block resolves the same `--unveiled-*` variables the Astro app's `global.css` previously resolved.