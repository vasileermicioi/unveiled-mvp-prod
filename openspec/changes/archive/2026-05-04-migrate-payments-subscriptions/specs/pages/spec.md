## MODIFIED Requirements

### Requirement: Membership Page
This requirement SHALL use legacy reference path: `_old_app/components/CheckoutView.tsx`.

The membership page SHALL display the plan, Stripe-backed payment controls, status states, and support links as visible UI behavior.

#### Scenario: Visible elements render
- **WHEN** membership page is shown
- **THEN** it displays a bordered white panel with membership eyebrow, headline, `Basic Berlin` plan, `29€/mo`, perk list, payment method controls, promo-code field, submit CTA, guarantee copy, support email, and FAQ link

#### Scenario: Express payment methods render first
- **WHEN** Stripe reports Apple Pay or Google Pay availability for the current browser and device context
- **THEN** the available express payment action appears at the top of the payment section as a large prominent action visible without scrolling

#### Scenario: PayPal renders as a separate option
- **WHEN** PayPal is enabled and available for the Stripe subscription checkout flow
- **THEN** PayPal appears as its own separately highlighted button below express payment actions
- **AND** PayPal is not hidden inside a generic dropdown or standard payment method selector

#### Scenario: Standard payment methods render separately
- **WHEN** standard payment methods are available
- **THEN** card payment and SEPA Direct Debit appear in a separate lower section using tabs or a simple selector
- **AND** selecting card shows Stripe card fields
- **AND** selecting SEPA Direct Debit shows Stripe-supported mandate and bank account collection controls

#### Scenario: No payment method is preselected
- **WHEN** the membership page first loads
- **THEN** no payment method is selected by default
- **AND** the user must intentionally choose express payment, PayPal, card, or SEPA before submitting

#### Scenario: Validation messages render
- **WHEN** Stripe payment controls, promo-code input, or server validation returns a visible validation error
- **THEN** field-level or method-level messages appear near the related control in small bold uppercase text

#### Scenario: Status states render
- **WHEN** frozen status is shown
- **THEN** a dark frozen-account notice appears and payment controls are disabled
- **WHEN** already-active status is shown
- **THEN** a success panel with celebration icon, success title/subtitle, and Enter The Void CTA appears
- **WHEN** submission is loading
- **THEN** the submit CTA shows a spinner

#### Scenario: Visual parity is preserved
- **WHEN** the page renders
- **THEN** it uses a white bordered panel, left plan/perk column, right payment column, dark/yellow CTA treatment, compact uppercase labels, and responsive single-column mobile layout

#### Scenario: Data requirements are met
- **WHEN** membership UI renders
- **THEN** required display data is plan name, plan price, perk labels, selected payment method when present, promo code value, visible field validation messages, frozen/success copy, guarantee text, provider availability flags, billing action state, and support email

## ADDED Requirements

### Requirement: Billing Recovery Page Behavior
Member-facing pages SHALL preserve read access while clearly disabling booking actions when subscription billing freezes credits.

#### Scenario: Frozen member views bookings
- **WHEN** a frozen or past-due member opens profile, bookings, or credit ledger pages
- **THEN** those pages remain visible
- **AND** billing status and recovery support copy are visible

#### Scenario: Frozen member attempts booking
- **WHEN** a frozen or past-due member opens an event booking action
- **THEN** the booking action is disabled or rejected with a billing recovery message
- **AND** existing bookings remain visible
