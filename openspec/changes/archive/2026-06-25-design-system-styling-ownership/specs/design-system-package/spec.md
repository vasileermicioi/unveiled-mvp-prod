## ADDED Requirements

### Requirement: Design tokens are the only styling source

The design system package MUST be the sole owner of every CSS rule, custom utility, Tailwind `@theme` override, semantic layout class, and `cn()` composition catalogue. Packages `@unveiled/app` and `@unveiled/landing` MUST NOT declare bespoke `@layer` rules, Tailwind theme blocks, or raw Tailwind utility strings on JSX/TSX/Astro/HTML elements. The boundary is enforced by `bun run check:styling-ownership`, which runs as part of `bun run check`.

#### Scenario: Gate rejects raw Tailwind utilities in app source

- **WHEN** a file under `packages/app/src/**` contains a `className` string with a forbidden Tailwind utility (for example `grid`, `flex`, `gap-4`, `min-h-screen`, `border-4`, `p-4`, `px-6`, `py-8`, `text-[10px]`, `bg-[*]`, or `space-y-6`)
- **THEN** `bun run check:styling-ownership` exits non-zero and names the offending file and utility token.

#### Scenario: Gate rejects raw Tailwind utilities in landing source

- **WHEN** a file under `packages/landing/src/**` contains a `className` string with a forbidden Tailwind utility
- **THEN** `bun run check:styling-ownership` exits non-zero and names the offending file and utility token.

#### Scenario: Gate rejects bespoke CSS in consumer styles directories

- **WHEN** `packages/app/src/styles/` or `packages/landing/src/styles/` contains any file other than `global.css`, or `global.css` contains anything other than `@import` lines pointing at `@unveiled/design-system/styles/...`
- **THEN** `bun run check:styling-ownership` exits non-zero and names the offending path.

#### Scenario: Gate rejects reverse imports into the design system

- **WHEN** any file under `packages/design-system/src/styles/**` imports from `packages/app/**` or `packages/landing/**`
- **THEN** `bun run check:styling-ownership` exits non-zero and names the offending import.

#### Scenario: Styling ownership check is part of bun run check

- **WHEN** a contributor runs `bun run check`
- **THEN** `bun run check:styling-ownership` runs as one of its steps
- **AND** if any forbidden styling pattern is present, `bun run check` exits non-zero.

### Requirement: `@unveiled/design-system` owns global CSS and semantic layout classes

The package MUST ship `packages/design-system/src/styles/global.css` as the single global stylesheet entry point. The file MUST import `./generated/tokens.css`, `./tailwind-theme.css`, and the Tailwind v4 layers (`@tailwind base`, `@tailwind components`, `@tailwind utilities`), then declare every bespoke class previously scattered across consumer `global.css` files and every semantic layout class used by app and landing surfaces. The file MUST be exported under `./styles/global.css` in the package `exports` map.

The initial semantic-class catalogue MUST include at minimum: `.app-page`, `.app-page-header`, `.app-page-toolbar`, `.content-shell`, `.page-shell`, `.form-shell`, `.grid-shell`, `.auth-page`, `.auth-card`, `.auth-stack`, `.discover-layout`, `.discover-sidebar`, `.discover-main`, `.member-feed-list`, `.member-feed-row`, `.member-feed-empty`, `.admin-panel-grid`, `.admin-panel-section`, `.admin-panel-stats`, `.landing-page`, `.landing-section`, and `.landing-footer-grid`. Every semantic class MUST support `--{variant}` modifier suffixes for at least `interactive`, `loading`, `error`, `empty`, `success`, and `disabled` where stateful surfaces require them.

#### Scenario: Global CSS exports from the package

- **WHEN** `packages/design-system/package.json` `exports` is read
- **THEN** `./styles/global.css` resolves to `./src/styles/global.css`.

#### Scenario: Global CSS chain imports tokens and theme before Tailwind layers

- **WHEN** `packages/design-system/src/styles/global.css` is read
- **THEN** it `@import`s `./generated/tokens.css` and `./tailwind-theme.css` before the `@tailwind` directives
- **AND** it declares the moved bespoke classes (`headline-*`, `unveiled-shadow`, `unveiled-card-hover`, `page-shell`, `content-shell`, `unveiled-meta`, `grid-shell`, and any other classes previously in `packages/app/src/styles/global.css`).

#### Scenario: Semantic classes replace inline utility compositions

- **WHEN** a layout in `packages/app/src/**` or `packages/landing/src/**` previously used `className="min-h-screen flex flex-col bg-white text-brand-dark"` (or equivalent utility strings from the catalogue)
- **THEN** after this change the wrapping element uses the corresponding semantic class (for example `app-page`) defined in `packages/design-system/src/styles/global.css`
- **AND** the visual output is unchanged per the visual-regression baselines in `tests/visual/`.

#### Scenario: Variant modifiers compose with semantic base classes

- **WHEN** an organism renders an interactive member-feed row
- **THEN** it composes `cn("member-feed-row", isInteractive && "member-feed-row--interactive")` using classes defined in the design-system global CSS
- **AND** no additional raw Tailwind utilities are added in the app or landing package.

### Requirement: `@unveiled/design-system` owns the Tailwind v4 theme overrides

The package MUST ship `packages/design-system/src/styles/tailwind-theme.css` containing the sole `@theme` block for Tailwind v4 color, font, and shadow overrides derived from `design-tokens.json`. No `@theme` block MAY remain in `packages/app/src/styles/global.css` or `packages/landing/src/styles/global.css`.

#### Scenario: Theme file is the only @theme source

- **WHEN** `packages/design-system/src/styles/tailwind-theme.css` is read
- **THEN** it declares `@theme` with brand colors (`brand-dark`, `brand-yellow`, `brand-cream`, `brand-grey`), display and sans font families, and the `shadow-unveiled` token
- **AND** neither `packages/app/src/styles/global.css` nor `packages/landing/src/styles/global.css` contains an `@theme` block.

#### Scenario: Theme is imported through global CSS

- **WHEN** `packages/design-system/src/styles/global.css` is read
- **THEN** it `@import`s `./tailwind-theme.css` before the `@tailwind` directives
- **AND** Tailwind utilities in design-system stories and downstream apps resolve brand tokens to the same values as before the move.

## MODIFIED Requirements

### Requirement: `@unveiled/design-system` owns design-token CSS

The package MUST ship the generated design-token CSS at `packages/design-system/src/styles/generated/tokens.css` (relocated from `src/styles/generated/tokens.css`) and MUST export it under `./styles/generated/tokens.css` in its `exports` map. `bun run tokens:gen` MUST write into the package, and `bun run tokens:check` MUST continue to fail on drift. Downstream apps (`@unveiled/app`, `@unveiled/landing`) MUST import tokens exclusively through `@unveiled/design-system/styles/global.css`, which in turn imports `./generated/tokens.css`; they MUST NOT import `./styles/generated/tokens.css` directly in their own `global.css`.

#### Scenario: Tokens are generated into the package

- **WHEN** `bun run tokens:gen` runs
- **THEN** `packages/design-system/src/styles/generated/tokens.css` is written with the same `--unveiled-*` CSS custom properties that previously lived in `src/styles/generated/tokens.css`.

#### Scenario: Tokens check still detects drift

- **WHEN** `bun run tokens:check` runs after `design-tokens.json` is edited without regenerating
- **THEN** it fails and names the drifted file (`packages/design-system/src/styles/generated/tokens.css`).

#### Scenario: Downstream apps consume tokens through global CSS

- **WHEN** `packages/app/src/styles/global.css` (or `packages/landing/src/styles/global.css`) is read
- **THEN** it contains only `@import "@unveiled/design-system/styles/global.css";`
- **AND** the imported global CSS resolves the same `--unveiled-*` variables the apps previously resolved via a direct tokens import and local `@theme` block.

### Requirement: Astro layouts project the React layouts via `<slot />`

The Astro layouts `packages/app/src/layouts/base-layout.astro` and `packages/landing/src/layouts/landing-layout.astro` MUST import the corresponding React layout from `@unveiled/design-system/layouts/<layout>` and MUST project it via the existing `<slot />`. The Astro layer MUST keep ownership of the HTML document and meta tags. The Astro layouts MUST import `@unveiled/design-system/styles/global.css` (via each package's one-line `global.css` shim) exactly once per surface. The Astro wrapper change MUST NOT alter the visible output of any page that consumes the layout.

#### Scenario: App Astro layout mounts AppLayout

- **WHEN** `packages/app/src/layouts/base-layout.astro` is read
- **THEN** the file imports `AppLayout` from `@unveiled/design-system/layouts/app-layout`
- **AND** the `<body>` contains an `<AppLayout>` element wrapping `<slot />` (rendered without a `header` prop, so the layout does not duplicate the page's own `AppShell`).

#### Scenario: Landing Astro layout mounts LandingLayout

- **WHEN** `packages/landing/src/layouts/landing-layout.astro` is read
- **THEN** the file imports `LandingLayout` from `@unveiled/design-system/layouts/landing-layout`
- **AND** the `<body>` contains a `<LandingLayout>` element wrapping `<slot />` (rendered without a `hero` prop, so the layout does not duplicate the page's own landing composition).

#### Scenario: AppLayout supports a header-less slot-only mode

- **WHEN** `AppLayout` is rendered without a `header` prop
- **THEN** the layout renders the page-body grid (or whatever the layout's children render) without the `AppShellPresentational` chrome, so the Astro wrapper can mount the layout around pages that emit their own shell without double-rendering the shell.

#### Scenario: Astro pages still render unchanged

- **WHEN** every Astro page under `packages/app/src/pages/` and `packages/landing/src/pages/` is rendered with `bun run dev` or `bun run build` after the wrapper update
- **THEN** the visible output is byte-equivalent (or visually equivalent) to the output before the styling-ownership change; the only change is that CSS rules and semantic classes are owned by the design system.
