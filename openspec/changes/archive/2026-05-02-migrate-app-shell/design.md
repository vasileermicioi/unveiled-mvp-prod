## Context

The target app already contains the migrated Unveiled visual foundation from `migrate-ui-system`: brand tokens, shared primitives, sample view models, and a visual workbench. Existing specs define `_old_app/` as a read-only visual and displayed-data reference, and the current app-shell spec captures the legacy sticky top navigation, brand-yellow frame, discovery controls, status banners, and full-screen modal layer.

This change turns that shell reference into reusable target-app layout components. The implementation should inspect `_old_app/App.tsx` and `_old_app/components/Navbar.tsx` for visible shell behavior only, then compose target-native Astro/React components from the migrated UI system. It must not import legacy runtime code, reproduce legacy routing/state management, or redesign primitives that already exist.

## Goals / Non-Goals

**Goals:**

- Provide a shared app shell that renders the brand-yellow frame, sticky header/navigation, centered responsive main container, and consistent page padding.
- Support guest, member, partner, and admin navigation variants with active states, language toggle, badges/counts, icon controls, and responsive label collapse.
- Provide reusable shell-level containers for page headings, optional breadcrumbs, optional top-bar actions, status banners, discovery controls, modal layering, and global loading/error/empty states.
- Keep shell data shaped as display view models so the implementation remains independent from auth, API, database, legacy store, and route internals.
- Build on migrated UI-system primitives and tokens rather than restyling controls inside the shell.
- Keep `_old_app/` read-only.

**Non-Goals:**

- Do not implement page-specific content, business workflows, auth, authorization, backend/API/database logic, data fetching, old state management, or old framework-specific routing behavior.
- Do not redesign or reimplement the UI system completed by `migrate-ui-system`.
- Do not migrate every legacy page in this change; pages should only receive shared shell wrappers where needed.
- Do not copy code or configuration from `_old_app/` into the target runtime.

## Decisions

1. **Create shell components around display view models.**

   The shell should receive a small view model for viewer context, active item, language, navigation labels, counts, breadcrumbs, actions, and status messages. This keeps layout reusable across Astro pages and React islands without depending on the old store or future backend shape.

   Alternative considered: bind shell components directly to auth/session/router state. Rejected because auth, routing internals, and backend integration are out of scope for this change.

2. **Use one top shell with variant slots instead of separate shells per role.**

   Guest, member, partner, and admin views share the same brand frame and header structure. Role-specific controls should be supplied as variant configuration or slots so the sticky nav, logo behavior, language toggle, and responsive spacing remain consistent.

   Alternative considered: implement separate guest/member/admin/partner headers. Rejected because it would duplicate layout behavior and increase visual drift.

3. **Keep operational controls page-local.**

   The legacy admin and partner surfaces keep logo/language/logout in the global shell while their dense tabs, filters, exports, and form controls live inside page content. The target shell should expose top-bar action slots for page-level actions, but operational workflows remain page responsibility.

   Alternative considered: promote operational tabs into global navigation. Rejected because the baseline app-shell spec explicitly keeps operational tools inside page content.

4. **Compose with migrated primitives only.**

   Shell surfaces should use existing brand tokens, buttons, badges, panels, state panels, and layout classes from the UI-system migration. Any new shell component should be structural and should not introduce a parallel button/card/form styling system.

   Alternative considered: write shell-specific styles matching legacy CSS directly. Rejected because this change depends on the archived UI-system work and must not reimplement it.

5. **Separate shell wrappers from page-specific content.**

   Discovery shell, modal shell, and global loading/error/empty wrappers should provide structure and placement. Event cards, filters, booking content, admin tables, and other page-specific data/content remain owned by page or feature components.

   Alternative considered: include event/feed behavior in the shell implementation. Rejected because it would expand scope into page content and old state-management behavior.

## Risks / Trade-offs

- **Risk: Shell components accidentally encode future auth/router assumptions** → Mitigation: accept explicit display view models and callbacks; keep route/session adapters thin and replaceable.
- **Risk: UI-system drift from adding shell-specific styling** → Mitigation: use migrated primitives and tokens first; add only structural classes where the primitive set does not describe layout.
- **Risk: Responsive navigation hides required controls** → Mitigation: preserve icon controls and counts at small breakpoints, collapse only secondary labels, and verify mobile/desktop states.
- **Risk: Discovery/modal wrappers pull in page-specific behavior** → Mitigation: define wrappers as slots/containers with state props only for open/closed/loading/error/empty presentation.
- **Risk: Legacy visual parity is interpreted as legacy architecture parity** → Mitigation: keep `_old_app/` as read-only reference and avoid importing legacy code, stores, routes, schemas, or CSS files.

## Migration Plan

1. Review `_old_app/App.tsx`, `_old_app/components/Navbar.tsx`, and migrated UI-system artifacts for shell-only visual behavior.
2. Add or refine shell view-model types for navigation, language, badges, breadcrumbs, actions, status banners, and global wrapper states.
3. Implement the shared app frame, sticky navigation/header, responsive content container, and role/context navigation variants using migrated primitives.
4. Implement shared page container/top-bar/breadcrumb/action wrappers and global loading/error/empty wrappers.
5. Implement discovery and modal shell containers as reusable structural components with slotted content.
6. Wire representative target pages or workbench surfaces to the shared shell enough to verify shell behavior without migrating page content.
7. Run project checks and inspect mobile/desktop shell states.

Rollback is UI-only: revert the shell component, shell view-model, and wrapper changes from this change if parity or integration is unacceptable.

## Open Questions

- Which route structure will own the final adapters from real session/route state into shell view models?
- Should breadcrumbs be visible on all nested operational pages or only where legacy surfaces expose an equivalent page context?
- Which automated screenshot targets should become the standard shell parity check after implementation?
