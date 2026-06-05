## Why

Moving the application to a production-grade state requires refining the user journey workflows so that interactions feel premium, responsive, and reliable. Currently, the geolocated map loads abruptly, the payment checkout remains a static simulation, and the venue check-in portal fails to provide clear, high-contrast visual cues for successful or failed ticket validation.

## What Changes

- **Public Discovery & Map UX:**
  - Introduce loading transition states in the `<DiscoveryMapPanel>` to prevent layout shifts.
  - Implement smooth pan-to-marker behaviors when event cards are clicked in the list.
- **Member Subscription Checkout & Stripe Elements Container:**
  - Replace the text-based Stripe placeholder mockups with structured, high-fidelity payment container grids.
  - Design visual frames for Credit Card and SEPA input elements, including mock card/bank brand icons and billing address sync options.
- **Venue QR Code Check-in Feedback:**
  - Refactor the `/venue-check-in` scan and code validation results page.
  - Render large, high-visibility status screens (e.g. green success checkmarks, red warning icons for expired or double-checked tickets) designed for venue door staff environments.
- **Onboarding Preferences Synchronization:**
  - Verify that onboarding selection states (districts, interests, weekdays, languages) align perfectly with schema constraints and persist reliably to the database upon submission.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `ui-system`: Standardize check-in status panels and visual payment containers.
- `auth`: Synchronize complete onboarding preferences state.

## Impact

- `src/components/unveiled/visual-system-app.tsx`: Build out the high-fidelity payment grids and refine map interactivity.
- `src/pages/venue-check-in/[id].astro` (and corresponding components): Redesign validation result screens with clear status iconography.
