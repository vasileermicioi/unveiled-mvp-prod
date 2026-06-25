## MODIFIED Requirements

### Requirement: `@unveiled/landing` reuses design-system primitives

Every UI primitive used by the landing surface MUST be imported from `@unveiled/design-system` (the production export, never the Ladle-only `heroui-replica`). The landing package MUST NOT add HeroUI, NextUI, or any other component library as a direct dependency; it MUST consume them transitively through `@unveiled/design-system`. The landing Astro layout MUST mount a single `<LandingTemplate client:load>` from `@unveiled/design-system` (which composes the header, optional hero, page body, and footer) and MUST project the page body via `<slot />`. The landing page MUST render the hero by mounting `<LandingHeroPresentational client:load>` and MUST NOT instantiate the header, footer, or Astro layout directly.

#### Scenario: No direct HeroUI dependency

- **WHEN** `packages/landing/package.json` is read
- **THEN** the `dependencies` list does NOT contain `@nextui-org/react`, `@heroui/react`, `@mantine/core`, or any equivalent component-library package.

#### Scenario: Production primitives are imported through the design system

- **WHEN** a file under `packages/landing/src/**` imports a UI primitive
- **THEN** the import resolves through `@unveiled/design-system` (or `@unveiled/design-system/<subpath>`)
- **AND** the import does NOT land inside `@unveiled/design-system/heroui-replica`.

#### Scenario: Landing Astro layout mounts a single LandingTemplate

- **WHEN** `packages/landing/src/layouts/landing-layout.astro` is read
- **THEN** the `<body>` contains exactly one design-system mount: `<LandingTemplate client:load>` wrapping `<slot />`
- **AND** the layout imports `LandingTemplate` from `@unveiled/design-system` (the public barrel).

#### Scenario: Landing page renders only the hero

- **WHEN** `packages/landing/src/pages/index.astro` is read
- **THEN** it imports `LandingHeroPresentational` from `@unveiled/design-system` (the public barrel)
- **AND** it renders `<LandingHeroPresentational client:load>` as the only top-level element inside the layout slot
- **AND** it does NOT import `LandingHeader`, `LandingFooter`, or `LandingTemplate` directly (the layout owns those mounts).

## REMOVED Requirements

### Requirement: `@unveiled/landing` ships landing-specific React islands

**Reason**: The landing-local re-export shims (`landing-header.tsx`, `landing-hero.tsx`, `landing-footer.tsx`) added no value over importing the design-system presentationals directly and created a parallel surface that future contributors could accidentally extend with landing-local UI logic. The design-system `LandingTemplate` organism (added by this change) composes the header, optional hero, page body, and footer; the Astro layout is the right place to mount it.

**Migration**: Delete `packages/landing/src/components/landing/` and its three shim files. Import `LandingHeaderPresentational`, `LandingHeroPresentational`, and `LandingFooterPresentational` (or `LandingTemplate`, which composes them) from `@unveiled/design-system` directly. The Astro layout mounts `<LandingTemplate client:load>`; the page mounts `<LandingHeroPresentational client:load>`. The new `R-LANDING-NO-LOCAL-UI` regression rule in `packages/design-system/scripts/check-styling-ownership.ts` rejects any future re-introduction of the folder.