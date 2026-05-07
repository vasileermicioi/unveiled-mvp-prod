## Why

The target app currently builds but exposes only the landing page, workbench, QR check-in route, and API routes. Legacy users had stable public, member, partner, and admin URLs, so the migrated app needs URL-backed product surfaces with role-aware ownership instead of relying on client-only view switching.

## What Changes

- Add stable Astro routes for legacy-visible product surfaces: `/discover`, `/how-it-works`, `/membership`, `/faq`, `/app`, `/saved`, `/bookings`, `/profile`, `/partner`, and `/admin`.
- Render each route inside the shared target app shell with route-derived active navigation state.
- Preserve public access to public pages and sign-in entry points.
- Protect member and operational pages with server-resolved viewer role checks.
- Redirect users away from pages their role cannot own, including guest access to protected pages, partner access to member/admin pages, and admin access to partner-only pages.
- Treat `/app` as the member discovery surface while keeping `/discover` available as the public discovery page.
- Preserve `/venue-check-in/[partnerId]?token=...` as the target-native replacement for visible legacy QR check-in behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `pages`: Add URL-backed route requirements for the legacy-visible public, member, partner, and admin product surfaces.
- `app-shell`: Require shell navigation to use stable URLs and derive active state from the current route.
- `auth`: Require role-aware route ownership and redirects for public, member, partner, and admin routes.
- `data-access`: Require route pages to load display data through server-authorized loaders appropriate to the viewer role.

## Impact

- Astro pages under `src/pages/` for public, member, partner, and admin surfaces.
- Shared app shell and visual app entry components under `src/components/unveiled/`.
- Viewer/session helpers in `src/lib/auth-display.ts` and `src/lib/auth-profile.ts`.
- Server-side display-data loaders under `src/lib/data-access/`.
- Existing route specs under `openspec/specs/pages/`, `openspec/specs/app-shell/`, `openspec/specs/auth/`, and `openspec/specs/data-access/`.
