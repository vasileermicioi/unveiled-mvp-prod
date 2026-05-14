## Context

The backend infrastructure for Better Auth and domain profile management is largely in place. However, the user-facing integration is missing several key pieces required for parity with the legacy app. Currently, authentication, profile creation, and session management are disconnected, leading to a fragmented experience where role-based routing, onboarding, and context-aware flows (like venue check-in) are not fully operational.

## Goals / Non-Goals

**Goals:**
- Provide a unified login/signup/password recovery experience with clear visible feedback.
- Automate the transition from authentication to role-specific product surfaces (Admin, Partner, Member).
- Intercept new users for onboarding before granting access to protected routes.
- Ensure the app shell (navbar, etc.) reflects the live session state (credits, role, saved items).
- Enable guests to initiate venue check-ins that persist through the authentication process.
- Persist language preferences across the session and devices.

**Non-Goals:**
- Implementation of OAuth/social login providers.
- Migration of existing users from the legacy Firebase Auth system.
- Significant redesign of the authentication UI beyond functional parity.

## Decisions

- **Routing & Onboarding**: We will implement an Astro middleware that intercepts protected routes. It will verify not only the Better Auth session but also the presence of a completed domain profile. If the profile is missing or incomplete (e.g., `onboardingComplete: false`), the user will be redirected to `/onboarding`.
- **Role-Based Redirects**: Post-authentication redirection logic will be centralized. It will map `role` values to target paths: `ADMIN` -> `/admin`, `PARTNER` -> `/partner`, `USER` -> `/app`.
- **Venue QR Continuation**: To handle guests opening venue check-in links, we will use a `callbackURL` pattern. If a guest opens a QR link, they will be prompted to login/signup with the original QR path passed as a return parameter. This ensures that after successful auth, they are returned to the check-in context.
- **Language State**: Language selection will be dual-persisted. We will use a cookie for immediate client-side and SSR feedback, and sync it to the `user_profiles.language` column in the database for persistence across devices and sessions.
- **Unified Signup Flow**: The signup Astro Action will be modified to ensure that identity creation (Better Auth) and profile initialization (domain DB) happen in a single, atomic-feeling operation from the user's perspective.

## Risks / Trade-offs

- **Middleware Overhead**: Running profile checks on every protected route adds a small database query overhead. We will mitigate this by ensuring efficient query keys and potentially caching the profile completion status in the session metadata if Better Auth allows.
- **Session Consistency**: Using server-side sessions for routing and client-side state for UI (React components) can lead to minor hydration mismatches if not handled carefully. We will prioritize server-driven initial data for all shell components.
