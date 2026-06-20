## MODIFIED Requirements

### Requirement: Shell Active State Is Route-Derived

The app shell SHALL use route display data as the source of truth for active navigation state, where the route display data now reflects that the Astro app is mounted under the `/app/*` URL prefix (per the `app-package` capability) rather than the repo root. The shell SHALL also expose accessible attributes on the language toggle, the hamburger button, and the mobile drawer so assistive technology can navigate them. The shell SHALL be selector-disciplinable: every interactive control SHALL be reachable through proximity (`getFieldNearestTo`, `getButtonNearestTo`, `getLinkNearestTo`) or layout (`getByRole`, `getByLabel`, `getByLandmark`, `getInside`) selectors, and SHALL NOT rely on `data-testid` or CSS class selectors.

#### Scenario: Current route is public

- **WHEN** a public page renders under the `/app/<lang>/...` prefix
- **THEN** the matching public navigation action receives active treatment when it exists in the visible shell.

#### Scenario: Current route is protected

- **WHEN** a member, partner, or admin page renders under `/app/<lang>/...`
- **THEN** the matching role-specific navigation action receives active treatment.

#### Scenario: Hydrated interactions do not replace route state

- **WHEN** hydrated shell controls handle local UI state
- **THEN** they do not change the primary active product surface without a URL navigation that preserves the `/app/<lang>/...` shape.

#### Scenario: Language toggle is announced as a grouped control

- **WHEN** the language toggle is rendered
- **THEN** the toggle's wrapper element has `role="group"`
- **AND** it has `aria-label` set to the localized language-group key
- **AND** each language option has `aria-pressed` set to `true` when active and `false` otherwise.

#### Scenario: Hamburger button is announced as a disclosure

- **WHEN** the shell renders on a viewport below 1024px
- **THEN** the hamburger button has `aria-expanded` set to `false` when the drawer is closed and `true` when the drawer is open
- **AND** it has `aria-controls` set to the drawer's stable id
- **AND** it has a localized `aria-label` drawn from the `shell.nav.openMenu` / `shell.nav.closeMenu` i18n keys.

#### Scenario: Mobile drawer is announced as a modal dialog

- **WHEN** the mobile drawer is open
- **THEN** the drawer element has `role="dialog"`
- **AND** it has `aria-modal="true"`
- **AND** it has `aria-labelledby` pointing at the drawer's localized heading element.

#### Scenario: Shell controls are selector-disciplinable

- **WHEN** a contributor writes a gherkin scenario that selects any shell control (header link, language toggle, hamburger, drawer close, status banner, page top-bar action)
- **THEN** the scenario can be expressed using only proximity selectors (e.g. `getLinkNearestTo`, `getButtonNearestTo`) and layout selectors (e.g. `getByRole`, `getByLabel`, `getByLandmark`, `getInside` with a semantic landmark parent)
- **AND** the selector-discipline lint at `tests/steps/lint/selectors.ts` does not flag the scenario.

#### Scenario: Active route is resolved against the /app prefix

- **WHEN** the shell derives the active navigation state from the current URL
- **THEN** it strips the `/app/<lang>/` prefix before matching the route against the public / member / partner / admin surfaces
- **AND** the public navigation item for `/app/<lang>/discover` is the one that receives active treatment when the viewer is on `/app/<lang>/discover`
- **AND** the active state is not misattributed to a sibling route that differs only by the language prefix.

### Requirement: Navigation Uses URL Routes

Shell navigation SHALL navigate to stable route URLs for product surfaces prefixed by the active route language parameter and the `/app` URL prefix (per the `app-package` capability), and SHALL derive selected state from the current route.

#### Scenario: Nav item is selected

- **WHEN** a shell nav item is activated
- **THEN** the browser navigates to the route for that product surface under `/app/<lang>/...`
- **AND** the selected nav item is derived from the current route.

#### Scenario: Guest navigation targets public routes

- **WHEN** guest navigation renders
- **THEN** Discover, How it works, Membership, and FAQ controls target `/app/<lang>/discover`, `/app/<lang>/how-it-works`, `/app/<lang>/membership`, and `/app/<lang>/faq`.

#### Scenario: Member navigation targets member routes

- **WHEN** member navigation renders
- **THEN** Current access, saved events, bookings, and profile controls target `/app/<lang>/app`, `/app/<lang>/saved`, `/app/<lang>/bookings`, and `/app/<lang>/profile`.

#### Scenario: Operational navigation targets operational routes

- **WHEN** partner or admin navigation renders
- **THEN** global operational entry points target `/app/<lang>/partner` for partners and `/app/<lang>/admin` for admins.

#### Scenario: Mobile nav renders route controls

- **WHEN** the shell renders on small screens
- **THEN** all role-relevant product routes remain reachable without exposing demo or workbench-only controls.
