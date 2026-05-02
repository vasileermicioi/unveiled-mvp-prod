## 1. Reference Audit And Scope Guardrails

- [x] 1.1 Review `_old_app/App.tsx` and `_old_app/components/Navbar.tsx` for shell-only visual structure, navigation states, status placement, discovery wrapper, and modal-layer behavior
- [x] 1.2 Review migrated UI-system primitives, tokens, and view-model patterns to identify which existing components the shell should compose
- [x] 1.3 Confirm `_old_app/` is read-only before implementation and record the initial git status for later comparison

## 2. Shell Display Models

- [x] 2.1 Define shell view-model types for viewer context, active navigation item, language state, nav labels, primary action, saved count, credit count, profile visibility, and logout visibility
- [x] 2.2 Define page-shell view-model types for breadcrumbs, top-bar actions, status banners, and page-level loading/error/empty states
- [x] 2.3 Define discovery-shell and modal-shell view-model types for open states, labels, counts, close availability, loading state, and layout mode
- [x] 2.4 Add representative mock/sample shell view models for guest, member, partner, admin, discovery, modal, and state-wrapper verification

## 3. Shared Shell Components

- [x] 3.1 Implement the target-native app frame with brand-yellow background, sticky white header/navigation, centered responsive content container, and migrated UI-system styling
- [x] 3.2 Implement guest navigation with logo, optional tagline, public nav actions, language toggle, active states, and context-aware Login or Become a member action
- [x] 3.3 Implement member navigation with Current access, FAQ, saved events, bookings, credits, profile, language toggle, logout, active states, badges, and responsive label collapse
- [x] 3.4 Implement partner/admin navigation variants that keep global logo, language, and logout controls visible while leaving operational controls page-local
- [x] 3.5 Implement shared page container/title area with optional breadcrumbs, optional top-bar actions, and consistent responsive spacing
- [x] 3.6 Implement shell status banner placement for venue check-in, membership, frozen-account, and generic shell notices

## 4. Shared Layout Wrappers

- [x] 4.1 Implement branded page-level loading, error, and empty wrappers using migrated state/panel primitives
- [x] 4.2 Implement discovery shell container with active range summary, visible count, filter/map toggles, collapsible panel slots, grid slot, and empty-state slot
- [x] 4.3 Implement modal shell container with full-screen brand-yellow layer, logo/header area, close control, scrollable content region, and responsive layout support
- [x] 4.4 Ensure shell wrappers accept slotted/page-supplied content and do not own page-specific event, booking, admin, partner, auth, or backend behavior

## 5. Integration Surfaces

- [x] 5.1 Wire the app layout or representative workbench page to render the shared shell with guest, member, partner, and admin sample states
- [x] 5.2 Wire representative pages or demos to use the shared page container, breadcrumbs/top-bar actions, status banners, and loading/error/empty wrappers
- [x] 5.3 Wire representative discovery and modal shell examples without migrating page-specific content
- [x] 5.4 Remove any duplicated shell styling that is superseded by the shared shell components while preserving migrated UI-system primitives

## 6. Verification

- [x] 6.1 Run the project check/lint/build command available in this repo
- [x] 6.2 Inspect mobile and desktop shell states for guest, member, partner, admin, discovery shell, modal shell, and global loading/error/empty wrappers
- [x] 6.3 Verify required navigation controls, counts, language toggle, active states, breadcrumbs, top-bar actions, and status banners remain visible at responsive breakpoints
- [x] 6.4 Confirm implementation did not modify `_old_app/`
- [x] 6.5 Update task checkboxes as implementation and verification steps are completed
