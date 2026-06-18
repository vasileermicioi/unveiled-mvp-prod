## Purpose

Define reusable UI appearance and component behavior. `_old_app/` is a visual reference only.
## Requirements
### Requirement: Brand System
This requirement SHALL use legacy reference path: `_old_app/index.css`, `_old_app/components/Logo.tsx`.

The UI SHALL preserve the visible Unveiled brand language.

#### Scenario: Visual elements render
- **WHEN** primary UI surfaces are displayed
- **THEN** they use the brand palette tokens declared in the `design-tokens` spec (brand-yellow, brand-cream, brand-grey, brand-dark, brand-white, plus brand-error and brand-success)
- **AND** surfaces use border, shadow, and motion tokens from the `design-tokens` spec
- **AND** typography uses the font-family, font-size, letter-spacing, and line-height tokens from the `design-tokens` spec
- **AND** the rendered values are byte-identical to the previous hard-coded values

#### Scenario: Visual parity is preserved
- **WHEN** target UI primitives are used
- **THEN** they are styled using tokens from the `design-tokens` spec
- **AND** the squared, bordered, high-contrast Unveiled appearance is preserved

#### Scenario: Data requirements are met
- **WHEN** brand components render
- **THEN** required display data is logo text/asset variant, localized tagline when shown, and active/inactive visual state tokens from the `design-tokens` spec

### Requirement: Buttons And Controls

Buttons, segmented controls, toggles, and icon controls SHALL match legacy visible states and SHALL be implemented as HeroUI-backed wrappers that preserve the existing public prop surface.

#### Scenario: Button is a HeroUI-backed wrapper

- **WHEN** `src/components/ui/button.tsx` is rendered
- **THEN** it composes HeroUI's `Button` as the base element
- **AND** it accepts the existing `variant` matrix (`default`, `primary`, `secondary`, `yellow`, `active`, `copied`, `destructive`, `ghost`, `outline`, `muted`, `link`)
- **AND** it accepts the existing `size` matrix (`default`, `sm`, `lg`, `icon`, `icon-sm`)
- **AND** it accepts the `loading` and `asChild` props
- **AND** the rendered DOM and className match the approved Ladle story for the same props

> The full delta for the `ui-system` capability (including the unchanged scenarios from the umbrella proposal) is owned by the umbrella `replace-shadcn-with-heroui`. Slice 2d ships the precondition those scenarios depend on; the umbrella's `apply` step archives both the slice and the umbrella delta together.

### Requirement: Forms

Forms SHALL preserve visible field structure, validation message placement, and responsive grouping. Payment integration and builder forms MUST mount interactive components without static mock text placeholders. Form fields SHALL be HeroUI-backed wrappers that preserve the existing public prop surface.

#### Scenario: Form primitives are HeroUI-backed

- **WHEN** any of `Field`, `TextInput`, `SelectInput`, or `TextArea` from `src/components/ui/unveiled-primitives.tsx` is rendered
- **THEN** the input/select/textarea element composes the corresponding HeroUI component
- **AND** it accepts the existing `label`, `hint`, `error`, `value`, `onChange`, and `disabled` props
- **AND** the rendered DOM and className match the approved Ladle story for the same props
- **AND** `data-testid` and the proximity + layout selector contract used by the gherkin suite are preserved

### Requirement: Event Card Component
This requirement SHALL use legacy reference path: `_old_app/components/EventCard.tsx`.

Event cards SHALL preserve the visible event browsing experience.

#### Scenario: Visible elements render
- **WHEN** an event card appears
- **THEN** it shows event image, category badge, title, partner name, formatted date, neighborhood, credit price, save icon button, and primary CTA
- **AND** the image uses grayscale by default with object-cover sizing

#### Scenario: User interactions render
- **WHEN** the card is hovered on capable devices
- **THEN** it translates slightly, shadow increases, image can scale/colorize, and a bottom overlay reveals remaining capacity and ticket type
- **WHEN** save is selected
- **THEN** bookmark fill/state changes when saved

#### Scenario: Visual parity is preserved
- **WHEN** event cards are displayed in grids
- **THEN** they keep equal-height bordered card structure with image on top and action row at bottom

#### Scenario: Data requirements are met
- **WHEN** card renders
- **THEN** required display data is image URL, image alt/title, category, partner name, date label, neighborhood, credit price, remaining capacity, ticket type, saved state, and CTA label

### Requirement: Modal And Dialog Components

Modal UI SHALL visually take over the screen for booking and redemption states and SHALL be implemented as HeroUI-backed wrappers that preserve the existing public prop surface.

#### Scenario: Modal primitives are HeroUI-backed

- **WHEN** a `Modal` or `Drawer` primitive is rendered
- **THEN** the underlying element composes HeroUI's `Modal` / `Drawer`
- **AND** the focus trap, `aria-modal`, and close-on-escape behavior match the approved Ladle story
- **AND** the public `open`, `onClose`, `title`, and `children` props are preserved

> The full delta for the `ui-system` capability (including the unchanged scenarios from the umbrella proposal) is owned by the umbrella `replace-shadcn-with-heroui`. Slice 2f ships the precondition those scenarios depend on; the umbrella's `apply` step archives both the slice and the umbrella delta together.

### Requirement: Map Component
This requirement SHALL use legacy reference path: `_old_app/components/EventMap.tsx`.

Map UI SHALL render through Leaflet and an open tile provider (such as CartoDB Voyager or OpenStreetMap), preserving the visible map panel, marker, loading, error, and fallback behavior, and supporting event selection handoff with a smooth panning animation.

#### Scenario: Visible elements render
- **WHEN** map is open
- **THEN** it appears inside a fixed-height bordered panel using the existing styling tokens
- **AND** the map mounts Leaflet and centers on Berlin by default (coordinates `52.52`, `13.405`)
- **AND** map tiles are loaded from an open tile provider (such as CartoDB Voyager or OpenStreetMap)
- **AND** event markers use a custom dark squared marker shape with a brand-yellow stroke

#### Scenario: Loading and error states render
- **WHEN** map is loading
- **THEN** a bordered grey loading panel with compact animated text appears
- **AND** the panel preserves space with a fixed height to prevent layout shifts of adjacent elements
- **WHEN** map fails
- **THEN** a dark error panel with warning icon, explanatory copy, and Retry Connection action appears

#### Scenario: User interactions render
- **WHEN** a marker is selected
- **THEN** an info window shows category, neighborhood, title, formatted time, and a "Book now" or "View event" action button that opens the event details view or booking modal
- **WHEN** the provider is unavailable or a marker cannot be resolved
- **THEN** the map shows a safe visible fallback state without blocking the surrounding event list
- **WHEN** an event card is clicked in the list
- **THEN** the map initiates a smooth panning animation to the selected marker's coordinates over `400ms` using an `easeInOutCubic` easing curve
- **AND** the active panning animation frame is cancelled as soon as the user starts a manual drag or pointer interaction (`mousedown`, `touchstart`, or wheel) on the map viewport

#### Scenario: Visual parity is preserved
- **WHEN** map markers and info windows are displayed
- **THEN** they keep the legacy bordered, high-contrast treatment and remain visually consistent with the discovery surface

#### Scenario: Data requirements are met
- **WHEN** map renders
- **THEN** required display data is event latitude, longitude, category, neighborhood, title, formatted time, selected marker state, and action target

### Requirement: Empty, Loading, And Error States

Empty, loading, and error states SHALL be explicit and visually intentional and SHALL be implemented as HeroUI-backed wrappers that preserve the existing public prop surface.

#### Scenario: State primitives are HeroUI-backed

- **WHEN** `Panel`, `Card`, `Badge`, `StatPanel`, `Divider`, or `StatePanel` is rendered
- **THEN** the element composes the corresponding HeroUI component (or a thin HeroUI-styled wrapper where HeroUI has no direct equivalent)
- **AND** the public `variant`, `tone`, `shadow`, `interactive`, and `state` props are preserved and translate to HeroUI style props internally
- **AND** the rendered DOM and className match the approved Ladle story for the same props

> The full delta for the `ui-system` capability (including the unchanged scenarios from the umbrella proposal) is owned by the umbrella `replace-shadcn-with-heroui`. Slice 2e ships the precondition those scenarios depend on; the umbrella's `apply` step archives both the slice and the umbrella delta together.

### Requirement: Responsive Layout
This requirement SHALL use legacy reference path: all UI component paths listed in this spec.

Responsive behavior SHALL preserve the visible mobile/desktop layout intent.

#### Scenario: Mobile layout renders
- **WHEN** viewport width is small
- **THEN** page sections stack, forms collapse paired fields, controls stack vertically where needed, event cards use one column, and large headings reduce size

#### Scenario: Desktop layout renders
- **WHEN** viewport width is wide
- **THEN** hero sections can split into columns, event grids use multiple columns, profile/admin forms use columns, and operational rows align horizontally

#### Scenario: Visual parity is preserved
- **WHEN** content changes across breakpoints
- **THEN** no text overlaps controls, image/card dimensions remain stable, and hover-only reveals do not hide essential mobile information

#### Scenario: Data requirements are met
- **WHEN** responsive components render
- **THEN** required display data remains available at every breakpoint, even if secondary labels collapse to icons

### Requirement: Localized UI Primitive Copy
Reusable UI controls, forms, modal states, and shared feedback surfaces SHALL receive and render localized labels and messages for German and English user-facing flows.

#### Scenario: Controls render localized labels
- **WHEN** buttons, segmented controls, toggles, icon-label controls, badges, or copy-to-clipboard feedback appear in public or member flows
- **THEN** visible text labels, loading labels, disabled labels, copied feedback, and count-adjacent labels use the selected language

#### Scenario: Forms render localized copy
- **WHEN** signup, login, onboarding, profile, booking, waitlist, preference, or newsletter forms render
- **THEN** field labels, placeholders where shown, helper copy, validation messages, submit labels, and loading labels use the selected language

#### Scenario: Shared states render localized messages
- **WHEN** empty, loading, error, unavailable, no-results, or retry states appear in public or member flows
- **THEN** headings, body copy, and action labels use the selected language while preserving existing visual parity behavior

#### Scenario: Admin views and actions render localized copy
- **WHEN** an administrator views the admin dashboard, partner tables, member lists, or submits administrative forms
- **THEN** all header labels, action buttons, table headings, and toast messages use the selected language

### Requirement: Primitive Styling Stability
Migrated UI primitives, forms, interactive controls, and modal states SHALL maintain visual stability and prevent styling regressions through automated visual checks.

#### Scenario: Primitive states match visual baselines
- **WHEN** reusable buttons, segmented controls, forms, inputs, and modal states are rendered in tests
- **THEN** their spacing, typography, colors, shadows, borders, active states, and hover states match approved baselines

#### Scenario: Responsive layout snapshots match baselines
- **WHEN** layout containers, page headers, grids, and mobile navigation menus are tested under mobile and desktop viewports
- **THEN** their layout grid alignments, responsive wraps, margins, and padding match approved baselines

### Requirement: Skeleton Loading Primitives

The UI SHALL provide reusable `<Skeleton>` pulse containers representing loading state skeletons for textual elements, buttons, and card content. The `<Skeleton>` primitive SHALL be implemented on top of the HeroUI `Skeleton` (or a thin HeroUI-styled wrapper) so the visual contract matches the approved Ladle story.

#### Scenario: Skeleton pulse animation is active

- **WHEN** a `<Skeleton>` container renders during data loading phases
- **THEN** it displays a pulse animation (`animate-pulse`) using muted grey background blocks matching card and text dimensions.

#### Scenario: Skeleton is HeroUI-backed

- **WHEN** a `<Skeleton>` primitive is rendered
- **THEN** the element composes HeroUI's `Skeleton` (or a thin HeroUI-styled wrapper) as the base
- **AND** the `className` and `aria-*` attributes used by the gherkin suite are preserved

### Requirement: Responsive Table-to-Card Structures
On viewports below `768px`, data tables (including admin lists and reports) SHALL collapse their row structures into self-contained vertical card blocks.

#### Scenario: Administrative table collapses on mobile
- **WHEN** the viewport width is below 768px
- **THEN** the admin partners directory table, events registry table, and member registry table render as stackable grid cards with label-value rows instead of horizontal columns.

### Requirement: Venue Check-in Status Panels
The UI SHALL provide high-visibility, high-contrast check-in status panels for venue door staff environments.

#### Scenario: Successful check-in validation
- **WHEN** a ticket is successfully validated
- **THEN** the status screen renders a large green checkmark with clear confirmation text and event/member details

#### Scenario: Failed check-in validation
- **WHEN** a ticket validation fails (e.g. expired or double-checked ticket)
- **THEN** the status screen renders a large red warning icon with high-contrast text explaining the failure reason

### Requirement: Production HeroUI Theme Module

The HeroUI theme configuration SHALL be exported from a production module at `src/lib/heroui-theme.ts` so that both the Ladle replica and the production provider can consume it without crossing the Ladle-only gate.

#### Scenario: Theme is importable from the production module

- **WHEN** any code (replica or production) imports the theme
- **THEN** the import path is `@/lib/heroui-theme` (or an explicit re-export)
- **AND** the export shape is unchanged from the previous replica-owned `src/components/ui/heroui-replica/theme.ts`

> The full capability deltas for `app-shell` and `ui-system` are owned by slices 2c, 2d, 2e, 2f, and the umbrella `replace-shadcn-with-heroui`. This slice ships the theme relocation those later slices require.

### Requirement: Consumer Migration Completes The HeroUI Switchover

Every consumer file in `src/components/unveiled/`, `src/components/payments/`, `src/components/providers/`, `src/pages/`, and `src/layouts/` that previously imported a shadcn-backed primitive or a shadcn-specific pattern SHALL now import the HeroUI-backed equivalent and pass the matching prop surface. This is the implementation step that makes the umbrella's capability deltas observable in the running app.

#### Scenario: No consumer imports the old primitive paths

- **WHEN** `rg "@/components/ui/(button|unveiled-primitives)" src/` is run after the consumer walk completes
- **THEN** every remaining hit is inside `src/components/ui/` itself (i.e. the primitives' own source files)
- **AND** no consumer file in the audited directories imports a shadcn-specific helper

#### Scenario: Prop mismatches are resolved at the call site

- **WHEN** a call site previously used `tone`, `shadow`, `interactive`, or `state` props
- **THEN** the call site maps those props to the new style-prop surface exposed by the HeroUI-backed wrapper
- **AND** the wrapper's public prop surface is preserved (call sites do not need to be rewritten to use HeroUI's native prop names)

> The full capability deltas for `app-shell` and `ui-system` are owned by slices 2c, 2d, 2e, 2f, and the umbrella `replace-shadcn-with-heroui`. This slice is the implementation step that makes those deltas observable in the running app.

### Requirement: Shadcn Scaffolding Is Removed

The shadcn-specific scaffolding (`@radix-ui/react-slot`, `class-variance-authority`, possibly `clsx` and `tailwind-merge`) SHALL be removed from `package.json` once the consumer audit confirms no remaining production-code importer. `components.json` SHALL no longer advertise shadcn as the component source.

#### Scenario: shadcn packages are removed from the dependency tree

- **WHEN** the audit (`rg "<package>" src/`) confirms no production consumer imports the package
- **THEN** the package is removed from `package.json`
- **AND** `bun install` regenerates `bun.lock` without the package
- **AND** `bun run check` is non-breaking after the removal

#### Scenario: components.json no longer points at shadcn

- **WHEN** `components.json` exists after the teardown
- **THEN** it does not reference shadcn as the component source
- **OR** the file is removed entirely

> The full capability deltas for `app-shell` and `ui-system` are owned by earlier slices and the umbrella `replace-shadcn-with-heroui`. This slice is the dependency + config cleanup that completes the switchover.

### Requirement: Umbrella Verification And Archival

The umbrella change `replace-shadcn-with-heroui` SHALL pass its full check matrix end-to-end, and SHALL be archived via `openspec archive` once the PR merges. The umbrella's `proposal.md` SHALL be updated (or superseded) if any public prop signature changed during slices 2d, 2e, or 2f.

#### Scenario: Full check matrix is green

- **WHEN** `bun run check`, `bun run check:heroui-replica`, `bun run test:e2e`, `bun run test:ladle`, and `bun run build` are run
- **THEN** every command exits 0
- **AND** the production bundle is within the existing performance budget

#### Scenario: Umbrella proposal is updated if a prop signature changed

- **WHEN** slices 2d, 2e, or 2f shipped a public prop signature change
- **THEN** the umbrella's `proposal.md` records the change
- **AND** `openspec validate replace-shadcn-with-heroui` passes after the update

#### Scenario: Umbrella is archived after merge

- **WHEN** the umbrella's PR merges to main
- **THEN** `openspec archive replace-shadcn-with-heroui` moves the change to `openspec/changes/archive/<date>-replace-shadcn-with-heroui/`

> The capability deltas for `app-shell` and `ui-system` are owned by earlier slices and the umbrella `replace-shadcn-with-heroui`. This slice is the closing gate.

