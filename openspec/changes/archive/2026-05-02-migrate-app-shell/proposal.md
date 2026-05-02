## Why

The target app has a migrated Unveiled UI system, but it still needs the legacy app shell recreated as target-native shared layout components. This change makes the global frame, navigation, responsive page container, shell status surfaces, and shared layout wrappers implementation-ready without reopening UI-system work or preserving legacy internals.

## What Changes

- Recreate the visible legacy app frame with brand-yellow background, sticky white navigation, centered responsive content, and page-level layout structure.
- Add shared shell components for guest, member, partner, and admin navigation states using the already migrated UI primitives and view-model patterns.
- Add reusable page container, breadcrumb/top-bar action support where present, status banner placement, and loading/error/empty layout wrappers.
- Preserve discovery shell structure for range summary, filter/map controls, panel containers, event grid container, and no-results wrapper without implementing page-specific event content.
- Preserve modal-layer shell structure for full-screen booking/detail flows while leaving page-specific modal content to page work.
- Keep `_old_app/` read-only and use it only as a visual/display reference.
- Keep out of scope: page-specific content, auth implementation, backend/API/database logic, legacy routing internals, old state management, old framework-specific implementation, and redesigning or reimplementing the UI system.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: Add implementation-ready requirements for composing the legacy shell from migrated UI-system primitives, including navigation variants, responsive shell behavior, shared page containers, optional breadcrumbs/top-bar actions, and global state wrappers.
- `pages`: Clarify that pages consume shared shell containers/wrappers while page-specific content remains outside this change.
- `display-data`: Add shell-level display data contracts for navigation state, breadcrumbs, top-bar actions, status banners, and global loading/error/empty wrappers.

## Impact

- Affected UI areas: shared app shell, navigation/sidebar/header equivalents, page container structure, discovery shell wrapper, modal-layer wrapper, and global loading/error/empty layout wrappers.
- Affected data contracts: UI-facing shell view models for viewer context, active navigation item, language state, counts/badges, optional breadcrumbs, optional top-bar actions, status messages, and global wrapper states.
- Builds on the archived `migrate-ui-system` visual/component foundation and existing `ui-system` specs.
- No `_old_app/` files, backend logic, auth behavior, API contracts, database schema, or legacy routing/state internals are modified.
