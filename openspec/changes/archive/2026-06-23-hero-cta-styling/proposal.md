## Why

The app's hero section in `packages/app/src/components/unveiled/visual-system-app.tsx:167-178` renders two CTAs ("EXPLORE ACCESS" and "HOW IT WORKS"). Manual testing (per `opencode-error-prompt.txt`) reported inconsistent styling between the two CTAs:

> `'Explore access' should not be in black and shrinked. 'How it works' also has to be bigger and have an icon (check original).`

The design-system Button primitive (`packages/design-system/src/button.tsx`) defines `secondary` as a white background with a black border, paired with `size="lg"` (`min-h-14 px-7 py-4 text-xs`). The nav buttons in `packages/app/src/components/unveiled/app-shell.tsx:300-308` already use `variant="secondary"`, so the hero CTAs should match for visual consistency. Both CTAs need the `<ArrowRight />` icon to signal forward action and both need `size="lg"` for consistent large dimensions.

## What Changes

- **Update `packages/app/src/components/unveiled/visual-system-app.tsx:167-178`** so that both hero CTAs render the same:
  - "EXPLORE ACCESS" button SHALL be `<Button asChild variant="secondary" size="lg">` with `<ArrowRight />` as its last child.
  - "HOW IT WORKS" button SHALL be `<Button asChild variant="secondary" size="lg">` with `<ArrowRight />` as its last child.
  - Both buttons SHALL emit the `secondary lg` class combination (`bg-white text-brand-dark border-brand-dark` plus `min-h-14 px-7 py-4 text-xs`).
- **Update the `app-shell` capability spec** (`openspec/specs/app-shell/spec.md`) with a `## MODIFIED Requirements` block declaring that the hero CTAs use the `secondary` variant, both include the `<ArrowRight />` icon, and both use `size="lg"` for consistent large dimensions.
- **Add a per-feature gherkin spec** under `tests/features/shell/heroes/` that asserts the rendered hero CTA DOM on `/app/en/`: both buttons carry `data-slot="button"`, include the `secondary lg` classes (`bg-white text-brand-dark border-brand-dark`, `min-h-14 px-7 py-4 text-xs`), and contain an `<ArrowRight />` SVG. Co-locate the Ladle harness as `<hero-cta>.ladle.tsx` and reference it from the scenario via `@ladle(component=…, story=…)`.
- **No new files outside the spec**, no dependency bumps, no schema changes. The change is purely cosmetic (a design-system primitive swap plus a parity spec).

## Capabilities

### New Capabilities

- _None._

### Modified Capabilities

- `app-shell`: the hero CTAs ("EXPLORE ACCESS" and "HOW IT WORKS") SHALL use the `secondary` Button variant (white background, black border) and both SHALL include the `<ArrowRight />` icon. Both buttons SHALL use `size="lg"` for consistent large dimensions. The requirement is added to the `app-shell` capability as a new scenario under the existing `Requirement: Shell Active State Is Route-Derived` block (or a new sibling requirement if a clean separation reads better — preference is a new sibling requirement named "Hero CTAs Use Secondary Variant + Arrow Icon").

### Removed Capabilities

- _None._

## Impact

- **New files:**
  - `tests/features/shell/heroes/hero-cta.feature` — gherkin scenarios asserting the hero CTA styling parity.
  - `tests/features/shell/heroes/hero-cta.ladle.tsx` — Ladle harness exposing the hero CTA pair to the scenarios' `@ladle(...)` tags.
- **Modified files:**
  - `packages/app/src/components/unveiled/visual-system-app.tsx:167-178` — normalize both hero CTAs to `variant="secondary" size="lg"` with `<ArrowRight />` (cosmetic; the dev plan's `routing-orchestrator` change shipped an inconsistent pair).
  - `openspec/specs/app-shell/spec.md` — `## MODIFIED Requirements` declaring the new hero CTA styling contract.
- **Removed files:** _none._
- **Dependencies changed:** _none._
- **Risks:** _none._ The change is cosmetic: both buttons share the design-system `secondary lg` primitive, no behavior change, no route change, no schema change.
