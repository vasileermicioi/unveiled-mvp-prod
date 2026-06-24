## Why

`bun ladle` reports `No stories found` and exits 0, silently lying about
the design system. Three independent defects converge on that symptom:
the legacy `.ladle/config.mjs` at the repo root globs `src/**/*.ladle.tsx`
but `src/` no longer exists at the root (the legacy app moved to
`packages/app/src/` in change 04); the package-local
`ladle-dev.ts` script spawns `ladle` from a `cwd` that has no Ladle
config; and the binary is not declared in the package's
`devDependencies`, so it cannot be resolved deterministically. Every
downstream iteration proposal (02–06) depends on a working Ladle to
demo its atoms, run `test:ladle`, and produce the
`design-system-overview` story.

## What Changes

- Add a package-local `packages/design-system/.ladle/config.mjs` (Ladle
  v5's canonical config file path; Ladle loads `<configFolder>/config.mjs`
  and we pass `--config .ladle` from the package root) that declares
  explicit story globs (`src/**/*.ladle.tsx`,
  `../app/src/**/*.ladle.tsx`, `../../tests/features/**/*.ladle.tsx`,
  `../../tests/ladle/**/*.ladle.tsx`) and `base: "/ladle/"`, and
  points `viteConfig` at a new `packages/design-system/vite.config.mjs`
  that wires the cross-package `@unveiled/*` and `~` aliases Ladle
  cannot derive from the design-system's own `tsconfig.json`, the
  `@tailwindcss/vite` plugin so Tailwind utilities (`bg-brand-*`,
  `unveiled-shadow`, etc.) actually compile for stories that import
  `~/styles/global.css` (otherwise the screenshot shows un-styled
  brand chrome — broken "Unveiled" logo, missing yellow background,
  missing icons), and `resolve.dedupe: ["react", "react-dom"]` so
  the dev server resolves React from a single copy (otherwise the
  "Invalid hook call" / "Cannot read properties of null (reading
  'useContext')" console error crashes `<NextUI.Input>` and Ladle's
  ErrorBoundary renders an empty story tree).
- Create `packages/design-system/public/app` as a symlink to
  `packages/app/public` so Ladle's default `publicDir` serves the
  app's `logos/` and `fonts/` under the `/app/...` URL prefix
  that `app-shell.tsx` and `global.css` already use (otherwise
  Vite's HTML-fallback middleware responds with the Ladle SPA HTML
  for any `/app/...` URL and the browser renders broken-image
  glyphs for the logo and misses the brand font).
- Extend `packages/app/src/styles/global.css` `@source` directives
  to include `../../design-system/src/**/*.{ts,tsx}` and opt in
  `border-current` via `@source inline` so the design-system's
  loading-state spinner (which uses `border-current`) actually
  compiles under both Astro and Ladle — the design-system `src/`
  was not previously scanned and `border-current` was not
  previously listed.
- Pin `@ladle/react` (matching the root `^5.1.1`) in
  `packages/design-system/package.json` `devDependencies` so
  `bunx --bun ladle` resolves deterministically.
- Rewrite `packages/design-system/scripts/ladle-dev.ts` and
  `packages/design-system/scripts/ladle-build.ts` to invoke
  `bunx --bun ladle … --config .ladle` from the package root and
  forward exit status.
- Delete the legacy `.ladle/config.mjs` (and the empty `.ladle/`
  directory) so the package-local config is the only source of truth.
- Add two permanent unit tests under `tests/unit/` that assert the
  package-local `.ladle/config.mjs` exists with a non-empty `stories`
  array, and that the legacy root `.ladle/config.mjs` does NOT exist.

## Capabilities

### Modified Capabilities

- `design-system-package`: replace the existing requirement `###
  Requirement: @unveiled/design-system owns the Ladle harness` with
  one that mandates a discoverable, version-pinned
  `packages/design-system/ladle.config.mjs` whose `stories` array
  resolves every replica story, every gherkin `@ladle` component, and
  every `tests/ladle/` smoke story; require the legacy
  `.ladle/config.mjs` to be deleted; and require `bun ladle` and
  `bun run ladle:build` to enumerate the 18 replica stories, the 11
  gherkin `@ladle` components, and the 2 smoke stories.

## Impact

- Files:
  - `packages/design-system/.ladle/config.mjs` (new).
  - `packages/design-system/vite.config.mjs` (new).
  - `packages/design-system/public/app` (new symlink to `packages/app/public`).
  - `packages/design-system/package.json` (add `@ladle/react` and `@tailwindcss/vite` devDeps).
  - `packages/design-system/src/button.tsx` (give the loading-state spinner explicit `mr-2` so it doesn't crowd the label).
  - `packages/design-system/src/heroui-replica/HeroButton.ladle.tsx` (add explicit `px-5 py-3` to the Loading story so the spinner never overlaps the label).
  - `packages/app/src/styles/global.css` (extend `@source` directives to include the design-system `src/` and opt in `border-current`).
  - `packages/design-system/scripts/ladle-dev.ts` (rewrite).
  - `packages/design-system/scripts/ladle-build.ts` (rewrite).
  - `.ladle/config.mjs` (delete); `.ladle/` (delete if empty).
  - `tests/unit/ladle-config-exists.test.ts` (new regression guard).
  - `tests/unit/no-legacy-ladle-config.test.ts` (new regression guard).
- Behaviour: `bun ladle` and `bun run ladle:build` succeed; the
  gherkin `test:ladle` suite, `ladle:coverage`, and
  `heroui-design-system-replica:check` continue to pass.
- Out of scope: reorganisation of `packages/design-system/src/`
  (proposal 02), removal of `heroui-replica/` (proposal 11),
  documentation of the design-system architecture (proposal 10).