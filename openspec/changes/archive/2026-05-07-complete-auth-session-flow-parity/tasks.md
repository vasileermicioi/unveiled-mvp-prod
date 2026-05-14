# Tasks: Complete Auth & Session Flow Parity

## 1. Auth Redirect Logic

- [x] 1.1 Implement the `getAuthRedirectPath` helper in `src/lib/auth-profile.ts` to determine the post-auth destination based on user role, onboarding status, and `callbackURL`.
- [x] 1.2 Update the `authResultToFormAction` helper in `src/actions/index.ts` to utilize the new redirect logic for all successful authentication actions.
- [x] 1.3 Ensure the `callbackURL` or `returnTo` parameter is correctly propagated through the auth flow to support context-aware redirects (e.g., returning to a venue check-in).

## 2. Protected Routes & Onboarding

- [x] 2.1 Implement or update Astro middleware in `src/middleware.ts` to enforce authentication on protected route prefixes (`/app`, `/admin`, `/partner`).
- [x] 2.2 Add logic to the middleware to detect incomplete profiles (`onboardingComplete: false`) and redirect authenticated members to `/onboarding`.
- [x] 2.3 Ensure the middleware correctly handles public routes (landing, discovery) and allows access to guests where appropriate.

## 3. Session Hydration & Settings

- [x] 3.1 Update the main application shell and navbar components to derive their display state (credit balance, role-specific links, profile visibility) from the live server-resolved session data.
- [x] 3.2 Implement a `setLanguage` Astro Action that updates the `language` cookie for immediate SSR feedback and persists the choice to the `user_profiles` table.
- [x] 3.3 Update the `logout` action to clear any session-related cookies and redirect to the landing page.

## 4. Venue QR Check-In Flow

- [x] 4.1 Update the `/venue-check-in/[id]` route to detect guest status and redirect to the landing page with the current path preserved in a `callbackURL` parameter.
- [x] 4.2 Update the login/signup completion logic to check for the `callbackURL` parameter and automatically redirect the user back to the venue check-in context.
- [x] 4.3 Verify that the venue check-in logic correctly handles the "already checked in" and "no eligible booking" states with visible UI feedback.

## 5. UI Parity & Verification

- [x] 5.1 Refine the login and signup form components to match legacy error handling (e.g., generic messages, field clearing) and loading states.
- [x] 5.2 Implement the password recovery request form with a visible success state that replaces the form upon a successful submission.
- [x] 5.3 Audit and synchronize result semantics between auth API routes in `src/pages/api/account/` and the corresponding Astro Actions.
- [x] 5.4 Perform manual smoke tests for the complete member journey: Landing -> Signup -> Onboarding -> Member Dashboard.
- [x] 5.5 Perform manual smoke tests for the venue QR flow: Guest -> Scan -> Login -> Successful Check-In Feedback.
