## Why

The target application needs the legacy product's recognizable visual system recreated in the new codebase without carrying over legacy technical architecture. This change turns the current UI introspection specs into an implementation-ready migration scope for colors, typography, layout, components, states, and responsive behavior.

## What Changes

- Recreate the Unveiled visual language in the target app: brand colors, display typography, spacing scale, border treatment, shadows, and responsive layout behavior.
- Build reusable UI primitives for buttons, inputs, cards, tables, dialogs, filters, loading states, empty states, and error states that visually match the legacy reference.
- Apply the visual system to the shared app shell, navigation, discovery shell, modal layer, and core page/component surfaces.
- Preserve only user-visible behavior and displayed-data contracts from `_old_app/`.
- Keep out of scope: legacy auth, backend, database, API structure, state management, framework internals, and any changes to `_old_app/`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ui-system`: Add implementation-ready visual-system requirements for tokens, primitives, component states, and visual parity checks.
- `app-shell`: Add implementation-ready shell requirements for navigation, status messages, discovery shell, and modal layer visual parity.
- `pages`: Add implementation-ready page migration requirements for visible page structure, forms, cards, tables, filters, empty/loading/error states, and responsive behavior.
- `display-data`: Add implementation-ready UI view-model requirements for visible fields, form fields, table/export columns, filters, sorting controls, and derived values.

## Impact

- Affected UI areas: global styles/theme tokens, shared UI primitives, app shell, public pages, discovery, booking modal, bookings, profile, partner portal, and admin UI.
- Affected data contracts: UI-facing view models only, limited to displayed fields and derived values needed by the visible interface.
- No legacy implementation code will be imported or modified.
- No backend, database, auth, API, or deployment behavior is changed by this proposal.
