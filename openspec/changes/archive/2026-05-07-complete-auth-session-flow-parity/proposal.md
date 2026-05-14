## Why

The current implementation has the backend infrastructure for Better Auth and profile helpers, but the visible user journey is fragmented. To achieve parity with the legacy app, we need to complete the integrated auth and session flows. This ensures that users experience a seamless transition from landing to login/signup, through onboarding, and into their role-specific dashboards (Admin, Partner, or Member). It also addresses critical gaps in password recovery feedback, language persistence, and the venue QR check-in flow for guest users.

## What Changes

- **Unified Auth Journey**: Complete the visible login, signup, and password recovery behavior, ensuring consistent feedback and error handling.
- **Integrated Profile Creation**: Signup will now handle both Better Auth identity creation and domain profile initialization in a single user-visible flow.
- **Smart Routing & Onboarding**: Implement role-based redirects after authentication (Admin -> `/admin`, Partner -> `/partner`, Member -> `/app`) and intercept new or incomplete profiles for onboarding.
- **Session-Hydrated UI**: Update the app shell to derive navigation, role-based controls, credits, and profile state directly from the server session and profile data.
- **Venue QR Continuation**: Enhance the venue check-in flow to support guests by showing a login-needed state that preserves check-in context for post-authentication completion.
- **State Persistence**: Persist selected language state across the session for consistent UI copy.

## Capabilities

### New Capabilities
- None (This change focuses on parity and integration of existing capabilities).

### Modified Capabilities
- `auth`: Unified signup/profile flow and password recovery feedback.
- `app-shell`: Session-driven navigation and role-based shell state.
- `pages`: Role-based routing and onboarding interception.
- `forms-actions`: Parity for auth form behaviors and error states.
- `operations`: Venue QR check-in continuation for guests.

## Impact

- **Core Auth**: `src/lib/auth.ts`, `src/lib/auth-account-actions.ts`, `src/lib/auth-profile.ts`, `src/lib/auth-display.ts`.
- **Actions & API**: `src/actions/index.ts`, `src/pages/api/account/*.ts`.
- **UI Components**: `_old_app/components/AuthView.tsx`, `_old_app/components/Navbar.tsx` (references), and their new implementations.
- **Routing**: Astro middleware or layout-level routing logic for role redirects and onboarding.
