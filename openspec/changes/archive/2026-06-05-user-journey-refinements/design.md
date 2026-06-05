## Context

The user journey in Unveiled needs visual refinements to transition the MVP into a production-grade application. Specifically:
1. The Map loading state causes abrupt layout shifts.
2. Clicking event cards doesn't pan the map to the selected event marker.
3. Stripe Elements payment fields render inside a text-based placeholder instead of premium high-fidelity grid frames with branding and sync options.
4. Venue QR check-in door staff screens lack clear, high-contrast, large success/failure UI.
5. Onboarding preferences need validation check to verify they align with constraints and database fields.

## Goals / Non-Goals

**Goals:**
- Eliminate geolocated map layout shifts by ensuring the loading StatePanel matches the map height (`min-h-[26rem]`) and styling borders.
- Add card-click listeners to the discovery lists to trigger smooth panning transition of coordinates using easing interpolation on the map.
- Replace the text-based Stripe element mounting boxes with custom grid elements showcasing brand icons and billing address sync checkboxes.
- Redesign the `/venue-check-in` results page with full-width green checkmark screens for successful check-in, yellow warning screens for double check-in, and red warning screens for invalid tickets.
- Verify onboarding preferences save and persist to the database without schema mismatches.

**Non-Goals:**
- Actual payment processing via live Stripe API (we will continue to use test/mock keys but mount the containers properly).
- Adding complex search or geolocation filters beyond existing ones.

## Decisions

### 1. Stable Map Panel Container height
- **Decision:** Return the `StatePanel` wrapped in the same outer `Panel` and a `div` with `min-h-[26rem]` class as the ready map panel.
- **Rationale:** Ensures that the page layout remains identical whether the map is loading, failed, or ready, completely eliminating layout shifts.

### 2. Smooth Interpolation for Map Pan-to-Marker
- **Decision:** Implement a custom requestAnimationFrame animation loop to interpolate map center latitude/longitude coordinates over 500ms using an `easeInOutCubic` easing curve.
- **Alternatives Considered:** 
  - Direct state setting: Causes abrupt teleportation, which does not feel premium.
  - Third-party panning library: Leaflet/OSM map components, but since we are using a custom custom-layered OpenStreetMap rendering system, custom interpolation gives precise control with zero extra bundle size.

### 3. High-Fidelity Stripe Grids and Billing Sync
- **Decision:** Build structured containers for Credit Card and SEPA input methods. These will render cards showing mock brand options (Visa, Mastercard, Amex, SEPA) alongside a checkbox to sync billing address with profile data.
- **Rationale:** Aligns with standard checkout best practices and meets visual constraints.

### 4. High-Visibility Door Staff Feedback
- **Decision:** Refactor the Astro check-in script to conditionally render large color-blocked screen elements depending on check-in state (`alreadyCheckedIn` success vs normal success vs failure/error).
- **Rationale:** Provides door staff with a clear instant feedback mechanism suited for low-light or fast-paced venue entry environments.

### 5. Onboarding Preferences Check
- **Decision:** Verify Zod validation in `onboardingSchema` maps exactly to the jsonb columns in `userProfiles` database table. Ensure no typing errors or field name mismatches.

## Risks / Trade-offs

- **Risk:** User dragging map while panning animation is in progress.
  - **Mitigation:** PointerDown event on the map viewport will immediately cancel any active panning animation frame, handing off control seamlessly to the user's manual drag.
