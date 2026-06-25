# Shell

The shell is the application chrome that wraps every authenticated and
public surface in `@unveiled/app`. It is composed of the design-system
organisms under `packages/design-system/src/organisms/shell/` and is
projected by the `AppLayout` layout shell
(`packages/design-system/src/layouts/app-layout/`).

## Components

| Component | Source | Purpose |
| --- | --- | --- |
| `AppShellPresentational` | `packages/design-system/src/organisms/shell/app-shell/` | Page frame (`page-shell` + sticky header + main slot). |
| `ShellNavigation` | `packages/app/src/components/unveiled/app-shell.tsx` | Brand mark, primary nav, language toggle, hamburger toggle, mobile drawer. |
| `ShellMobileDrawerPresentational` | `packages/design-system/src/organisms/shell/shell-mobile-drawer/` | Slide-in drawer panel + backdrop. |
| `ShellIconButtonPresentational` | `packages/design-system/src/organisms/shell/shell-icon-button/` | Atomic toggle button used by the hamburger. |

## The `lg` breakpoint gate

The `lg` breakpoint (Tailwind v4 default = 1024 px) is the shared gate
that hides the mobile-only navigation surfaces on desktop. Both the
drawer panel (`ShellMobileDrawerPresentational`) and its backdrop carry
`lg:hidden`; the hamburger toggle (`ShellIconButtonPresentational`)
also carries `lg:hidden` so the trigger and the surface it controls
cannot desynchronise.

The gate lives on the **design-system primitives**, not on the
consumers. Every shell — auth, landing, member, partner, admin —
inherits the gate by composing the primitive; the
`bun run check:styling-ownership` gate rejects any consumer that
overrides the `lg:hidden` utility (e.g. an explicit `lg:block` /
`lg:flex`).

### Why a primitive-level gate

Centralising the visibility rule at the primitive prevents future
shells from re-introducing the "hamburger visible on desktop" bug. The
`ShellIconButtonPresentational` is the only source of truth for the
`lg:hidden` utility on the toggle; the `ShellNavigation` consumer MUST
NOT add or override it.

### Regression coverage

- **Gherkin:** `tests/features/shell/mobile-drawer/feature.feature`
  asserts the toggle carries `lg:hidden` in its `class` attribute.
- **Ladle:** `Organisms / Shell / App Shell / LgViewport` (desktop
  default viewport) and `… / SmViewport` (mobile default viewport)
  preview the gate visually.
- **Playwright parity:**
  `tests/parity/shell/mobile-drawer.spec.ts` asserts the toggle has
  `display: none` at 1440 px and `display ≠ none` at 375 px, with
  visual baselines under `tests/visual/shell/`.
