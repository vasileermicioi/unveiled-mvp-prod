## MODIFIED Requirements

### Requirement: `@unveiled/design-system` owns the Ladle harness

The package MUST own the Ladle config at `packages/design-system/.ladle/config.mjs` (Ladle v5's canonical config path; Ladle loads `<configFolder>/config.mjs`, the scripts pass `--config .ladle` from the package root). The config MUST be a `.mjs` module that exports an object with at least a non-empty `stories` array and a `base` field. The config MUST resolve every replica story under `packages/design-system/src/heroui-replica/*.ladle.tsx`, every co-located production-primitive story under `packages/design-system/src/**/*.ladle.tsx`, every gherkin `@ladle` story under `tests/features/**/*.ladle.tsx`, and every smoke story under `tests/ladle/**/*.ladle.tsx`. The config MUST declare `base: "/ladle/"` so the static build matches the orchestrator's served path, and MUST point `viteConfig` at `packages/design-system/vite.config.mjs` which wires the cross-package `@unveiled/*` and `~` resolve aliases that Ladle cannot derive from the design-system's own `tsconfig.json` (because those aliases point at `packages/<other>/src`), mounts the `@tailwindcss/vite` plugin so Tailwind utilities (`bg-brand-*`, `unveiled-shadow`, etc.) compile for stories that import `~/styles/global.css` or `@unveiled/design-system/styles/generated/tokens.css`, AND declares `resolve.dedupe: ["react", "react-dom"]` so the dev server resolves React from a single copy (otherwise the workspace-pinned `react@19.2.5` co-exists with `@ladle/react`'s transitively-pinned `react@19.2.7` and the resulting "Invalid hook call" / "Cannot read properties of null (reading 'useContext')" error in `<NextUI.Input>` crashes the story tree). The legacy `.ladle/config.mjs` at the repo root MUST NOT exist; the package-local config is the only source of truth. The package MUST also ship a `packages/design-system/public/app` symlink that resolves to `packages/app/public` so Ladle's default `publicDir` exposes the app's `logos/unveiled-logo-{black,white}.svg` and `fonts/EKNoticeSans-Black.{woff2,woff,otf}` under the production `/app/...` URL prefix that `app-shell.tsx` and `global.css` already hard-code; without that symlink Vite's HTML-fallback middleware returns the Ladle SPA HTML (status 200, `text/html`) for every `/app/...` URL and the browser renders broken-image glyphs. Running `bun --filter @unveiled/design-system run ladle` MUST serve the harness on port 6006 and list every story resolved by the config, and `bun --filter @unveiled/design-system run ladle:build` MUST write the static build to `packages/design-system/dist/ladle/` whose `index.html` references all of those stories.

#### Scenario: Package-local Ladle config exists with discoverable stories

- **WHEN** `packages/design-system/.ladle/config.mjs` is read at runtime
- **THEN** it is a `.mjs` module whose default export has a non-empty `stories` array
- **AND** that array contains a glob covering `packages/design-system/src/**/*.ladle.tsx`, a glob covering `tests/features/**/*.ladle.tsx`, and a glob covering `tests/ladle/**/*.ladle.tsx`
- **AND** the config exports `base: "/ladle/"` so the static build matches the orchestrator's served path.

#### Scenario: Legacy root Ladle config is removed

- **WHEN** the repo is searched for `.ladle/config.mjs` at the root
- **THEN** no such file exists
- **AND** the regression test `tests/unit/no-legacy-ladle-config.test.ts` passes
- **AND** no file under `packages/` or `tests/` references `.ladle/config.mjs` by path.

#### Scenario: Ladle dev server lists every resolved story

- **WHEN** `bun --filter @unveiled/design-system run ladle` boots
- **THEN** the served `index.html` and `/stories.json` enumerate the 18 replica stories under `packages/design-system/src/heroui-replica/`, the gherkin `@ladle` components under `tests/features/**`, and the smoke stories under `tests/ladle/**`.

#### Scenario: Ladle dev server ships exactly one React copy

- **WHEN** `packages/design-system/vite.config.mjs` is read at Ladle config-load time
- **THEN** its `resolve` block declares `dedupe: ["react", "react-dom"]`
- **AND** the resolved Vite bundle includes `react` (and `react-dom`) from a single workspace location, so opening any HeroUI story in the browser does NOT emit "Invalid hook call" / "Cannot read properties of null (reading 'useContext')" and the sidebar story list is NOT empty.

#### Scenario: Ladle dev server compiles Tailwind utilities for stories

- **WHEN** `packages/design-system/vite.config.mjs` is read at Ladle config-load time
- **THEN** its `plugins` array mounts `@tailwindcss/vite`
- **AND** `packages/design-system/package.json` `devDependencies` declares `"@tailwindcss/vite": "^4.2.4"` so the plugin resolves from the package's own devDeps
- **AND** the rebuilt `packages/design-system/dist/ladle/assets/*.css` includes Tailwind utilities (e.g. `bg-brand-yellow`, `bg-brand-grey`, `unveiled-shadow`) and the `--unveiled-color-brand-*` CSS variables, so stories that import `~/styles/global.css` or `@unveiled/design-system/styles/generated/tokens.css` render with brand chrome instead of plain text.

#### Scenario: Ladle dev server serves the app's public assets under `/app/...`

- **WHEN** `bun ladle` boots and a story requests `/app/logos/unveiled-logo-black.svg` (or any file under `packages/app/public/`)
- **THEN** Vite returns the actual SVG bytes (not the Ladle SPA HTML)
- **AND** the file is reachable because `packages/design-system/public/app` is a symlink whose target is `packages/app/public`, so Ladle's default `publicDir` (`packages/design-system/public/`) exposes the app's logos and fonts under the production URL prefix `app-shell.tsx` and `global.css` already use
- **AND** the rebuilt `packages/design-system/dist/ladle/app/logos/` and `packages/design-system/dist/ladle/app/fonts/` directories contain the originals so the static build serves them the same way.

#### Scenario: Loading-state spinner renders with the right colour and margin

- **WHEN** the design-system `Button` is rendered with `loading`
- **THEN** the rebuilt `packages/design-system/dist/ladle/assets/*.css` includes both `.border-current{border-color:currentColor}` AND `.border-t-transparent{border-top-color:#0000}` so the rotating border is visible against the button background (because Tailwind v4's `@source` directives now scan `packages/design-system/src/**/*.{ts,tsx}` and the inline source list opts in `border-current`)
- **AND** the spinner span sits clearly to the left of the label (`mr-2` on the span and on HeroUI's `classNames.spinner` slot) so the rotating icon does not crowd or visually cross the text.

#### Scenario: HeroUI replica Loading story has explicit padding so the spinner never clips the label

- **WHEN** `HeroButton.ladle.tsx` `Loading` story is rendered
- **THEN** the `<Button>` element declares `px-5 py-3` (matching the design-system `Button` default size) so the spinner and the label have the same horizontal gap as in the production `Button` story
- **AND** the spinner (HeroUI's default 20×20 dual-`<i>` `<Spinner>`) does not visually overlap or clip the first character of the "Loading" label.

#### Scenario: Ladle static build produces a deployable bundle

- **WHEN** `bun --filter @unveiled/design-system run ladle:build` completes
- **THEN** `packages/design-system/dist/ladle/index.html` exists
- **AND** every story id registered in the dev server is referenced from the static `index.html` (or its referenced chunks)
- **AND** the directory is excluded from Biome formatting in the package's `biome.json`.

#### Scenario: Regression guards fail loudly when the config drifts

- **WHEN** `bun run test:unit` runs
- **THEN** `tests/unit/ladle-config-exists.test.ts` fails if `packages/design-system/.ladle/config.mjs` is missing, exports an empty `stories` array, or omits `base: "/ladle/"`
- **AND** `tests/unit/no-legacy-ladle-config.test.ts` fails if `.ladle/config.mjs` is re-introduced at the repo root.