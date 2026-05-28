## Context

The current Unveiled application renders several hardcoded mock placeholders and static placeholder descriptions (e.g., Stripe card container text, hardcoded defaults in the Event Series Builder, etc.). In addition, some validation actions and admin dashboard views lack localized translation values. This design describes how we will migrate the static placeholders to fully dynamic components (specifically mounting Stripe Elements containers and custom date selectors) and expand localization dictionaries.

## Goals / Non-Goals

**Goals:**
- Eliminate all visible hardcoded placeholder strings in the member checkout and event builder views.
- Fully translate all user, admin, and partner flows into both English (`EN`) and German (`DE`).
- Ensure server action schema validation error feedback is fully localized based on client language state.

**Non-Goals:**
- Supporting dynamic real-time translations for database entities (e.g. event descriptions or partner name changes).
- Connecting to external live translation APIs.
- Setting up physical card processing reader hardware integrations.

## Decisions

### 1. Client-Side Stripe Elements Rendering
We will replace the static `{copy.stripeCard}` and `{copy.stripeSepa}` placeholder strings in `visual-system-app.tsx` with a dynamic client-side mount of Stripe Elements.
- **RATIONALE:** Instead of redirecting to Stripe Checkout or using text-only mocks, mounting Stripe Elements directly inside the page provides a premium, seamless checkout flow.
- **ALTERNATIVES CONSIDERED:** Redirecting to standard Stripe hosted checkout pages. While simpler, this breaks the single-page application feel of the checkout wizard.
- **IMPLEMENTATION DETAIL:** We will load Stripe client-side via `@stripe/stripe-js` (`loadStripe`) when the payment panel is rendered, and mount the `Payment` or `Card` element inside container target divs (`#stripe-card-element`, `#stripe-sepa-element`).

### 2. Event Series Builder Inputs
We will replace the hardcoded "defaultValue" range string input placeholder inside the Series Builder with interactive form controls.
- **RATIONALE:** Administrators need actual date pickers and day selection buttons to declare a recurring series of events rather than manually typing or viewing a static mock string.
- **ALTERNATIVES CONSIDERED:** Leaving it as a text field with schema validations. This would lead to high validation failure rates and a poor UX.
- **IMPLEMENTATION DETAIL:** The series builder view will render a date range input component and weekday selection checkbox toggles.

### 3. Server Action Validation Localization
We will pass the active client language state from the frontend header to server-side action calls.
- **RATIONALE:** By feeding the user's active locale (e.g. from cookie or request context) into the action handlers, the validator schemas can construct localized error envelopes.
- **ALTERNATIVES CONSIDERED:** Hardcoding error codes and translating them entirely on the frontend. While viable, this fragments validation logic across client/server borders.

## Risks / Trade-offs

- **[Risk]** Stripe Elements SDK fails to load due to network issues or ad blockers.
  - **Mitigation:** Wrap load elements in standard error boundaries and fallback to displaying an retry button with a localized warning.
- **[Risk]** Heavy client-side JS bundle overhead when loading Stripe SDK.
  - **Mitigation:** Dynamically import the Stripe loader or fetch it on demand only when the checkout modal becomes active.
