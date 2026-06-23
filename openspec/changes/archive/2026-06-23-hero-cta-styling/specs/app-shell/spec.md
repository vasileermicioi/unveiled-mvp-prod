## ADDED Requirements

### Requirement: Hero CTAs Use Secondary Variant + Arrow Icon + Consistent `size="lg"`

The app shell's hero section SHALL render the two hero CTAs ("EXPLORE ACCESS" and "HOW IT WORKS") with the design-system `secondary` Button variant at `size="lg"`, and both SHALL include the `<ArrowRight />` icon as their last child so the pair is visually consistent and signals forward action.

#### Scenario: Hero CTA pair uses the secondary variant

- **WHEN** the hero section renders on any app-shell route (e.g. `/app/en/`)
- **THEN** both "EXPLORE ACCESS" and "HOW IT WORKS" buttons are rendered as `<Button asChild variant="secondary" size="lg">`
- **AND** the rendered button classes include `bg-white text-brand-dark border-brand-dark` (the `secondary` variant surface) and `min-h-14 px-7 py-4 text-xs` (the `lg` size)
- **AND** neither button uses the `default`, `primary`, `yellow`, `active`, `copied`, `destructive`, `ghost`, `outline`, `muted`, or `link` variants.

#### Scenario: Hero CTAs include the ArrowRight icon

- **WHEN** the hero section renders
- **THEN** each of the two hero CTAs contains an `<ArrowRight />` icon as the last child of its `<a>` slot
- **AND** the icon resolves to the lucide-react `ArrowRight` import (`import { ArrowRight } from "lucide-react"`) so it shares the same SVG glyph and sizing as other shell icons.

#### Scenario: Hero CTAs share the same large dimensions

- **WHEN** the hero section renders
- **THEN** both buttons carry `size="lg"` so they share `min-h-14 px-7 py-4 text-xs` dimensions
- **AND** neither button uses `size="default"`, `size="sm"`, `size="icon"`, or `size="icon-sm"`.

#### Scenario: Hero CTAs navigate to the expected app routes

- **WHEN** the hero section renders
- **THEN** "EXPLORE ACCESS" navigates to `/app/<lang>/discover`
- **AND** "HOW IT WORKS" navigates to `/app/<lang>/how-it-works`
- **AND** both `<a>` slots resolve under the `/app/<lang>/...` URL prefix (per the `app-package` capability).
