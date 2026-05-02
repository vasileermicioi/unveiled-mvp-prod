## Context

The target app already has an Astro server-rendered foundation with React island support, Tailwind CSS, shadcn-style component configuration, and lucide icons. The baseline specs define `_old_app/` as a read-only visual and displayed-data reference, with four UI-focused capabilities: `ui-system`, `app-shell`, `pages`, and `display-data`.

This change should convert that reference into reusable target UI building blocks and page surfaces. The legacy app should be inspected for visual parity only: colors, typography, spacing, borders, shadows, icons, responsive layout, visible fields, and user-facing states.

## Goals / Non-Goals

**Goals:**

- Recreate the Unveiled brand system in the target app as reusable theme tokens and shared primitives.
- Build shared UI components for buttons, inputs, cards, tables, dialogs/modals, filters, loading states, empty states, and error states.
- Apply the visual system to the app shell and representative page surfaces so future feature work can reuse stable UI patterns.
- Preserve user-visible interactions and displayed-data contracts described by the baseline specs.
- Keep `_old_app/` read-only and use it only for visual comparison.

**Non-Goals:**

- Do not migrate legacy auth, backend, database, API shape, state management, framework internals, or deployment behavior.
- Do not import runtime code from `_old_app/`.
- Do not implement complete business workflows beyond what is needed to render and verify UI surfaces.
- Do not create or require a data migration.

## Decisions

1. **Use target-native theme tokens, not copied legacy class names.**

   The legacy palette and typography should be represented in `src/styles/global.css` and reusable Tailwind-compatible tokens. This keeps visual parity while allowing the target app to evolve around its own CSS structure.

   Alternative considered: copy legacy utility class names directly. Rejected because it would couple the new app to old implementation vocabulary instead of preserving the visual outcome.

2. **Build primitives first, then compose pages.**

   Buttons, inputs, cards, badges, dialogs, tabs, tables, and state panels should be implemented as shared components before page composition. This reduces duplicated styling and keeps parity consistent across public, member, partner, and admin surfaces.

   Alternative considered: style each page independently. Rejected because repeated legacy patterns are central to the product identity and need consistent behavior.

3. **Use Astro markup for static surfaces and React islands for interactive controls.**

   Static layout, cards, headings, copy, and preview sections should render without client-side state. React islands should be scoped to interactions such as auth form mode switching, FAQ accordion, onboarding steps, checkout method switching, discovery filters/map, booking modal, profile preference editing, partner filtering/check-in controls, and admin tabs/forms.

   Alternative considered: implement the whole app shell as a client-side React app. Rejected because the target stack supports server-rendered pages and focused hydration.

4. **Represent displayed data as UI view models.**

   Components should receive data shaped for display: labels, counts, formatted dates, selected states, visible validation messages, and derived totals. These view models are independent from persistence shape.

   Alternative considered: expose low-level records directly to components. Rejected because the specs intentionally cover visible data only.

5. **Verify visual parity with targeted screenshots.**

   Implementation should include manual or automated visual checks for core breakpoints and states: landing, public discovery, discovery filters/map, booking modal, bookings empty/list, profile, partner portal, and admin surfaces. Parity should focus on layout, spacing, colors, typography, component states, and responsive behavior.

## Risks / Trade-offs

- **Risk: Overfitting to legacy internals** → Mitigation: only inspect legacy files for rendered appearance and displayed fields; do not import code or preserve old architecture.
- **Risk: Visual drift across pages** → Mitigation: define reusable tokens and primitives before composing full pages.
- **Risk: Too much UI surface for one pass** → Mitigation: implement in layers: tokens, primitives, shell, representative pages, then operational surfaces.
- **Risk: Interactive islands become too broad** → Mitigation: keep islands scoped to specific controls and panels; static page sections remain server-rendered.
- **Risk: Responsive regressions** → Mitigation: verify mobile and desktop layouts for each major surface before marking tasks complete.

## Migration Plan

1. Add target brand tokens, fonts, base typography, borders, shadows, focus states, and responsive utility classes.
2. Build shared UI primitives for controls, cards, forms, tables, dialogs, panels, and state surfaces.
3. Compose app shell and navigation using primitives and displayed-data placeholders/view models.
4. Compose public pages and core member surfaces from the baseline specs.
5. Compose partner and admin surfaces from the visible UI requirements.
6. Validate with lint/check commands and visual inspection screenshots where available.

Rollback is straightforward because this change is UI-only: revert the UI component/style/page changes from the implementation branch if visual parity is unacceptable.

## Open Questions

- Which exact production font assets should be used in the target app if legacy local font files are not migrated?
- Should the first implementation pass include every page surface, or should partner/admin pages be feature-flagged while public/member surfaces are completed first?
- What screenshot tooling should be standardized for visual parity checks in this repo?
