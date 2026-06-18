## MODIFIED Requirements

### Requirement: Buttons And Controls

Buttons, segmented controls, toggles, and icon controls SHALL match legacy visible states and SHALL be implemented as HeroUI-backed wrappers that preserve the existing public prop surface.

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

#### Scenario: Button is a HeroUI-backed wrapper

- **WHEN** `src/components/ui/button.tsx` is rendered
- **THEN** it composes HeroUI's `Button` as the base element
- **AND** it accepts the existing `variant` matrix (`default`, `primary`, `secondary`, `yellow`, `active`, `copied`, `destructive`, `ghost`, `outline`, `muted`, `link`)
- **AND** it accepts the existing `size` matrix (`default`, `sm`, `lg`, `icon`, `icon-sm`)
- **AND** it accepts the `loading` and `asChild` props
- **AND** the rendered DOM and className match the approved Ladle story for the same props

### Requirement: Forms

Forms SHALL preserve visible field structure, validation message placement, and responsive grouping. Payment integration and builder forms MUST mount interactive components without static mock text placeholders. Form fields SHALL be HeroUI-backed wrappers that preserve the existing public prop surface.

#### Scenario: Visible elements render

- **WHEN** a form renders
- **THEN** it shows compact uppercase labels, bordered inputs/selects/textareas, clear focus states, and primary submit actions
- **AND** paired fields stack on mobile and align in columns on larger screens

#### Scenario: Validation messages render

- **WHEN** a user-visible validation message exists
- **THEN** it appears near the related field or form section in compact high-contrast text

#### Scenario: User interactions render

- **WHEN** a selectable chip, toggle, day button, language button, or payment method is selected
- **THEN** selected state is visually distinct

#### Scenario: Data requirements are met

- **WHEN** forms render
- **THEN** required display data is field label, current value, placeholder where shown, validation message, selected state, disabled state, and submit/loading label

#### Scenario: Stripe payment form mounts active elements

- **WHEN** a user selects Stripe Card or SEPA payment methods
- **THEN** the checkout form displays structured, high-fidelity payment container grids containing credit card or bank details input frames instead of hardcoded text placeholders (e.g. "Stripe card fields mount here")
- **AND** renders mock card/bank brand icons and billing address sync options

#### Scenario: Event series builder mounts standard selectors

- **WHEN** an admin views the Event Series Builder input fields
- **THEN** the builder displays standard date picker and day selection inputs rather than hardcoded "defaultValue" range string prompts (e.g. "04 May - 30 May")

#### Scenario: Form primitives are HeroUI-backed

- **WHEN** any of `Field`, `TextInput`, `SelectInput`, or `TextArea` from `src/components/ui/unveiled-primitives.tsx` is rendered
- **THEN** the input/select/textarea element composes the corresponding HeroUI component
- **AND** it accepts the existing `label`, `hint`, `error`, `value`, `onChange`, and `disabled` props
- **AND** the rendered DOM and className match the approved Ladle story for the same props
- **AND** `data-testid` and the proximity + layout selector contract used by the gherkin suite are preserved

### Requirement: Modal And Dialog Components

Modal UI SHALL visually take over the screen for booking and redemption states and SHALL be implemented as HeroUI-backed wrappers that preserve the existing public prop surface.

#### Scenario: Visible elements render

- **WHEN** the modal opens
- **THEN** it uses a full-screen brand-yellow surface, logo header, large close icon, scrollable content, and large editorial event typography

#### Scenario: User interactions render

- **WHEN** close is selected
- **THEN** the modal closes visibly
- **WHEN** copy code is selected
- **THEN** copied feedback appears

#### Scenario: Visual parity is preserved

- **WHEN** success content renders
- **THEN** code panels use dark/yellow or white/dark contrast, large display code text, and strong bordered calendar/support actions

#### Scenario: Data requirements are met

- **WHEN** modal states render
- **THEN** required display data is event detail fields, ticket count, total credits, redemption type, redemption code, redemption URL, support email, loading state, and copied state

#### Scenario: Modal primitives are HeroUI-backed

- **WHEN** a `Modal` or `Drawer` primitive is rendered
- **THEN** the underlying element composes HeroUI's `Modal` / `Drawer`
- **AND** the focus trap, `aria-modal`, and close-on-escape behavior match the approved Ladle story
- **AND** the public `open`, `onClose`, `title`, and `children` props are preserved

### Requirement: Empty, Loading, And Error States

Empty, loading, and error states SHALL be explicit and visually intentional and SHALL be implemented as HeroUI-backed wrappers that preserve the existing public prop surface.

#### Scenario: Visible elements render

- **WHEN** there is no discovery result
- **THEN** a large dashed no-results panel appears
- **WHEN** bookings are empty
- **THEN** a centered ticket empty state with CTA appears
- **WHEN** partner guests are empty
- **THEN** a centered muted no-guests message appears
- **WHEN** admin member data is loading or empty
- **THEN** a bordered loading/no-members message appears

#### Scenario: Visual parity is preserved

- **WHEN** these states render
- **THEN** they keep the legacy contrast, dashed/bordered treatment, icon scale, compact uppercase copy, and generous empty-state spacing

#### Scenario: Data requirements are met

- **WHEN** state UI renders
- **THEN** required display data is state type, localized message, optional icon, optional CTA label, and optional retry action

#### Scenario: State primitives are HeroUI-backed

- **WHEN** `Panel`, `Card`, `Badge`, `StatPanel`, `Divider`, or `StatePanel` is rendered
- **THEN** the element composes the corresponding HeroUI component (or a thin HeroUI-styled wrapper where HeroUI has no direct equivalent)
- **AND** the public `variant`, `tone`, `shadow`, `interactive`, and `state` props are preserved and translate to HeroUI style props internally
- **AND** the rendered DOM and className match the approved Ladle story for the same props

### Requirement: Skeleton Loading Primitives

The UI SHALL provide reusable `<Skeleton>` pulse containers representing loading state skeletons for textual elements, buttons, and card content. The `<Skeleton>` primitive SHALL be implemented on top of the HeroUI `Skeleton` (or a thin HeroUI-styled wrapper) so the visual contract matches the approved Ladle story.

#### Scenario: Skeleton pulse animation is active

- **WHEN** a `<Skeleton>` container renders during data loading phases
- **THEN** it displays a pulse animation (`animate-pulse`) using muted grey background blocks matching card and text dimensions.

#### Scenario: Skeleton is HeroUI-backed

- **WHEN** a `<Skeleton>` primitive is rendered
- **THEN** the element composes HeroUI's `Skeleton` (or a thin HeroUI-styled wrapper) as the base
- **AND** the `className` and `aria-*` attributes used by the gherkin suite are preserved
