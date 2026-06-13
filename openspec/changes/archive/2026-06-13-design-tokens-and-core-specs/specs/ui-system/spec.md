## MODIFIED Requirements

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
This requirement SHALL use legacy reference path: `_old_app/App.tsx`, `_old_app/components/Navbar.tsx`, `_old_app/components/CheckoutView.tsx`.

Buttons, segmented controls, toggles, and icon controls SHALL match legacy visible states.

#### Scenario: Visible elements render
- **WHEN** a control appears
- **THEN** it has compact uppercase text (using the typography tokens from the `design-tokens` spec), strong border or filled surface (using the color and border tokens), clear hover treatment, and lucide-style icon where the legacy UI shows one

#### Scenario: User interactions render
- **WHEN** a segmented option is active
- **THEN** it uses the dark-fill and light-text tokens from the `design-tokens` spec
- **WHEN** an action is disabled
- **THEN** it appears muted and non-primary (using the muted color tokens)
- **WHEN** an action is loading
- **THEN** it shows a spinner or loading label
- **WHEN** copy succeeds
- **THEN** text or icon changes to Copied/check temporarily

#### Scenario: Visual parity is preserved
- **WHEN** primary and secondary actions render together
- **THEN** primary actions are visually dominant and secondary actions retain dark-bordered brand styling
- **AND** every color, radius, and shadow value is sourced from the typed enums in `src/lib/design-tokens.ts` (the `design-tokens` spec), not from a magic string or raw hex

#### Scenario: Data requirements are met
- **WHEN** controls render
- **THEN** required display data is label, optional icon, active/disabled/loading/copied state, and optional count badge
