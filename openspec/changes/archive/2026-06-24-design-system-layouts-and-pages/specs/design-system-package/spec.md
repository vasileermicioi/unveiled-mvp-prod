## ADDED Requirements

### Requirement: Layouts are layout shells with no page-specific data

The `packages/design-system/src/layouts/` layer MUST expose layout shells
(`AppLayout` and `LandingLayout`) that compose existing shell and landing
organisms into a frame (header + main + footer). Layouts MUST NOT fetch
data, MUST NOT import from `@nextui-org/react` or `@heroui/*` directly
(they consume organisms), and MUST NOT import from `./pages/`. The gate
`bun run check:atomic-layers` enforces all three rules.

#### Scenario: Layouts consume organisms only

- **WHEN** `packages/design-system/src/layouts/<layout>/<layout>.tsx` is
  inspected
- **THEN** its imports include at least one organism from
  `../../organisms/...` (e.g. `AppShellPresentational`,
  `LandingHeaderPresentational`, `LandingHeroPresentational`,
  `LandingFooterPresentational`, `PageShell`)
- **AND** no import targets `@nextui-org/react`, `@nextui-org/...`, or
  `@heroui/...` directly.

#### Scenario: Layouts do not import from pages

- **WHEN** `bun run check:atomic-layers` walks
  `packages/design-system/src/layouts/**/*.tsx`
- **THEN** no file contains `from "./pages/..."` or any equivalent
  cross-layer import.
- **AND** the gate fails with the offending file path if any layout
  reaches into the pages layer.

#### Scenario: `AppLayout` composes shell organisms

- **WHEN** `packages/design-system/src/layouts/app-layout/app-layout.tsx`
  is read
- **THEN** `AppLayout` accepts props for `header` (ReactNode),
  `pageHeader` (ReactNode), `pageBody` (ReactNode), and `pageAside`
  (ReactNode, optional)
- **AND** the rendered tree composes `AppShellPresentational` (with
  `header`) wrapping a slot grid (`pageHeader` + `pageBody` +
  optional `pageAside`).

#### Scenario: `LandingLayout` composes landing organisms

- **WHEN** `packages/design-system/src/layouts/landing-layout/landing-layout.tsx`
  is read
- **THEN** `LandingLayout` accepts props for `authenticated` (boolean,
  default false), `hero` (boolean, default false), and `children`
  (ReactNode)
- **AND** the rendered tree composes `LandingHeaderPresentational`
  (with `authenticated`), optionally `LandingHeroPresentational`
  (with `authenticated`), the `children` as the page `<main>`, and
  `LandingFooterPresentational`.

#### Scenario: Each layout has a co-located Ladle story

- **WHEN** `bun ladle` boots and Ladle walks the design-system stories
- **THEN** `packages/design-system/src/layouts/app-layout/app-layout.ladle.tsx`
  and
  `packages/design-system/src/layouts/landing-layout/landing-layout.ladle.tsx`
  are discoverable, each exporting at least one `StoryObj` that renders
  the layout with mock data and no organisms inside the body
  (`pageBody` / `children` are simple placeholder content).

#### Scenario: Each layout has a mock fixture

- **WHEN** `packages/design-system/src/layouts/app-layout/app-layout.mock.ts`
  (or the equivalent `landing-layout.mock.ts`) is read
- **THEN** it exports a `makeMockAppLayoutProps(overrides?)` (or
  `makeMockLandingLayoutProps(overrides?)`) factory with sensible
  defaults (a mock header ReactNode, a placeholder `pageBody`,
  `authenticated: false`, `hero: false`) that callers can override
  field-by-field.

### Requirement: Every page surface has a demo page viewable in Ladle with mock data

The design system MUST expose demo pages for every user-facing surface
under `packages/design-system/src/pages/<domain>/<surface>.page.ladle.tsx`.
Pages are Ladle stories only; they MUST NOT ship as a runtime export
from the design-system barrel. The pages layer MUST be import-isolated
from production: no production entry point outside
`packages/design-system/src/pages/` may reach into the folder.

#### Scenario: Demo pages exist for every user-facing surface

- **WHEN** `packages/design-system/src/pages/` is listed
- **THEN** it contains at least the following `*.page.ladle.tsx` files:
  `auth/login.page.ladle.tsx`, `auth/signup.page.ladle.tsx`,
  `auth/password-recovery.page.ladle.tsx`,
  `discovery/discover.page.ladle.tsx`,
  `members/member-feed.page.ladle.tsx`,
  `bookings/booking-modal.page.ladle.tsx`,
  `admin/admin-panel.page.ladle.tsx`,
  `partner/partner-portal.page.ladle.tsx`,
  `payments/admin-freeze-unfreeze.page.ladle.tsx`,
  `payments/credit-ledger.page.ladle.tsx`,
  `payments/stripe-checkout.page.ladle.tsx`,
  `payments/subscription-portal.page.ladle.tsx`, and
  `landing/landing.page.ladle.tsx`.

#### Scenario: Demo pages render at fullscreen in Ladle

- **WHEN** `bun ladle` boots and a contributor opens any
  `*.page.ladle.tsx` story
- **THEN** the story renders with the layout's full viewport (the
  `Default` story's `parameters.layout` is `"fullscreen"`)
- **AND** the demo page composes `AppLayout` (or `LandingLayout`) with
  the relevant organism(s) and a mock fixture, not real data.
- **AND** for surfaces whose "page" organism is composed of multiple
  sub-organisms (e.g. `AdminPanelHeaderPresentational` +
  `AdminPanelTabBarPresentational` + `AdminPanelActionListPresentational`),
  the demo page composes the sub-organisms in a vertical stack inside
  the layout's `pageBody` slot.

#### Scenario: Demo pages must use mock data

- **WHEN** `bun run check:atomic-layers` walks
  `packages/design-system/src/pages/**/*.tsx`
- **THEN** every file imports at least one `*.mock` helper (the gate
  greps for `from .*\.mock"` in each file).
- **AND** the gate fails with the offending file path if any page
  hard-codes its data instead of going through a fixture.

#### Scenario: Pages are Ladle-only files

- **WHEN** `bun run check:atomic-layers` walks
  `packages/design-system/src/pages/**`
- **THEN** every `.tsx` file ends in `.page.ladle.tsx`; no
  `pages/<name>.tsx` runtime file exists.
- **AND** the design-system barrel (`packages/design-system/src/index.ts`)
  does NOT re-export a runtime `Pages` namespace; the pages folder
  exists only as Ladle stories.

#### Scenario: Pages are import-isolated from production

- **WHEN** `bun run test:unit` runs
- **THEN** the permanent unit test
  `tests/unit/design-system-pages.test.ts` passes, asserting that no
  production file under `packages/app/src/**`,
  `packages/landing/src/**`, or the design-system's own runtime
  barrel imports from `packages/design-system/src/pages/`.
- **AND** the existing
  `tests/unit/no-ladle-replica-in-production.test.ts` policy continues
  to pass; the pages folder is treated as a Ladle-only folder under
  the same import-isolation policy.

#### Scenario: Layouts namespace is reachable from the barrel

- **WHEN** a downstream package writes
  `import { Layouts } from "@unveiled/design-system"; Layouts.AppLayout`
  (or `Layouts.LandingLayout`)
- **THEN** the namespace resolves via the design-system's `Layouts`
  namespace export, parallel to the existing `Atoms`, `Molecules`, and
  `Organisms` namespace exports.
- **AND** the flat re-exports `AppLayout` and `LandingLayout` from
  `@unveiled/design-system` also resolve to the same React components.

### Requirement: Astro layouts project the React layouts via `<slot />`

The Astro layouts `packages/app/src/layouts/base-layout.astro` and `packages/landing/src/layouts/landing-layout.astro` MUST import the corresponding React layout from `@unveiled/design-system/layouts/<layout>` and MUST project it via the existing `<slot />`. The Astro layer MUST keep ownership of the HTML document, meta tags, and the `@unveiled/design-system/styles/global.css` import. The Astro wrapper change MUST NOT alter the visible output of any page that consumes the layout.

#### Scenario: App Astro layout mounts AppLayout

- **WHEN** `packages/app/src/layouts/base-layout.astro` is read
- **THEN** the file imports `AppLayout` from
  `@unveiled/design-system/layouts/app-layout`
- **AND** the `<body>` contains an `<AppLayout>` element wrapping
  `<slot />` (rendered without a `header` prop, so the layout does
  not duplicate the page's own `AppShell`).

#### Scenario: Landing Astro layout mounts LandingLayout

- **WHEN** `packages/landing/src/layouts/landing-layout.astro` is read
- **THEN** the file imports `LandingLayout` from
  `@unveiled/design-system/layouts/landing-layout`
- **AND** the `<body>` contains a `<LandingLayout>` element wrapping
  `<slot />` (rendered without a `hero` prop, so the layout does not
  duplicate the page's own landing composition).

#### Scenario: AppLayout supports a header-less slot-only mode

- **WHEN** `AppLayout` is rendered without a `header` prop
- **THEN** the layout renders the page-body grid (or whatever the
  layout's children render) without the `AppShellPresentational`
  chrome, so the Astro wrapper can mount the layout around pages
  that emit their own shell without double-rendering the shell.

#### Scenario: Astro pages still render unchanged

- **WHEN** every Astro page under `packages/app/src/pages/` and
  `packages/landing/src/pages/` is rendered with `bun run dev` or
  `bun run build` after the wrapper update
- **THEN** the visible output is byte-equivalent (or visually
  equivalent) to the output before the wrapper update; the only
  change is that the React tree is mounted by the React layout
  instead of by the page's hand-written shell composition.
