## 1. Route Ownership Foundation

- [x] 1.1 Add route metadata for public, member, partner, and admin product surfaces, including path, shell surface key, role ownership, and navigation target.
- [x] 1.2 Add server-side route ownership helpers that return render or redirect outcomes for guest, member, partner, and admin viewers.
- [x] 1.3 Add tests or focused checks for guest protected-route redirects, partner member/admin redirects, and admin partner-route redirects.

## 2. Astro Route Pages

- [x] 2.1 Add public Astro pages for `/discover`, `/how-it-works`, `/membership`, and `/faq` using shared shell rendering and public display data.
- [x] 2.2 Add member Astro pages for `/app`, `/saved`, `/bookings`, and `/profile` that authorize `USER` viewers before loading member data.
- [x] 2.3 Add operational Astro pages for `/partner` and `/admin` that authorize partner/admin viewers before loading operational data.
- [x] 2.4 Preserve `/venue-check-in/[partnerId]?token=...` behavior and verify route parity work does not alter that target-native check-in route.

## 3. Shell Navigation

- [x] 3.1 Update shell display data so navigation items include stable URL targets for public, member, partner, and admin surfaces.
- [x] 3.2 Update hydrated navigation interactions to navigate through URLs for primary product routes instead of demo-only local view switching.
- [x] 3.3 Derive active navigation state from the current route/surface key for desktop and mobile shell variants.
- [x] 3.4 Remove workbench/demo-only controls from production route navigation while keeping all role-relevant routes reachable on small screens.

## 4. Route-Scoped Data Loading

- [x] 4.1 Wire public routes to public loaders without requiring an authenticated session.
- [x] 4.2 Wire member routes to member-owned loaders after member authorization succeeds.
- [x] 4.3 Wire `/partner` to partner-owned portal loaders after partner ownership is resolved.
- [x] 4.4 Wire `/admin` to admin display loaders after admin authorization succeeds.
- [x] 4.5 Ensure rejected route ownership outcomes redirect before protected loaders execute.

## 5. Verification

- [x] 5.1 Run the project type/build checks for the new route files and shared shell changes.
- [x] 5.2 Smoke test public routes to confirm they render inside the shell and keep stable URLs after hydration.
- [x] 5.3 Smoke test protected routes for expected redirects and role-specific rendering.
- [x] 5.4 Verify shell navigation active states and mobile route reachability across guest, member, partner, and admin display states.
