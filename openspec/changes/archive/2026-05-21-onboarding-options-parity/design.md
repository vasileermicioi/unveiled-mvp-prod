## Context

The Unveiled onboarding flow currently limits options (only 2 interests, 1 district, 1 timing, and 2 days) and submits hardcoded fields (such as age group, moods, preferred languages, and accessibility status) when calling the server action `actions.saveOnboarding`.
To bring feature parity with the legacy React application, the onboarding page must be updated to provide a complete 4-step wizard interface where all user choices are properly captured, validated, and persisted.

## Goals / Non-Goals

**Goals:**
* Expand onboarding preference options to include all legacy values.
* Implement a 4-step wizard onboarding flow (`step` state 1 to 4) mirroring the legacy design.
* Map all options (interests, moods, districts, maxDistance, timing, preferredDays, preferredLanguages, accessibility, ageGroup) to component state.
* Forward user-entered values to `actions.saveOnboarding` instead of hardcoded placeholders.
* Ensure UI styling complies with the high-contrast Unveiled design system (bordered elements, uppercase metadata, Unveiled Primitive panels/buttons).

**Non-Goals:**
* Redesigning other parts of the application or profile settings page.
* Modifying database schemas or server-side actions, which already support the full range of values.

## Decisions

### Decision 1: Option Parity and Schema Compatibility
* **Approach**: Extend `onboardingPreferenceOptions` to include all legacy options:
  * `interests`: Theater, Kino, Museum, Ausstellung, Konzert, Talk/Lesung, Comedy, Tanz/Performance.
  * `moods`: Leicht, Experimentell, Klassisch, Politisch, Familie (mapped from legacy "Fam" to match schema validation).
  * `districts`: Mitte, X-Berg, P-Berg, Charlottenburg, Wedding, F-Hain, Schöneberg.
  * `timing`: After Work, Weekend, Day.
  * `preferredDays`: Mo, Di, Mi, Do, Fr, Sa, So.
  * `preferredLanguages`: DE, EN, Non-V.
* **Alternative Considered**: Keep the options list limited. Replaced because users could not personalize profiles correctly.
* **Why**: Matches `schemas.ts` and legacy values exactly, ensuring full parity.

### Decision 2: 4-Step Wizard UI Flow and Local State
* **Approach**: Maintain step state locally using a React `useState(1)` hook.
  * **Step 1**: Age selection (`18-25`, `26-35`, `36-50`, `50+`). Large block buttons.
  * **Step 2**: Interests & Moods selection chips.
  * **Step 3**: Districts chips & Max distance range slider (1 to 25 km).
  * **Step 4**: Timing chips, Preferred Days chips, Preferred Languages chips, and Accessibility toggle.
* **Alternative Considered**: Single page form. Replaced because a multi-step wizard is more structured and matches legacy UX.
* **Why**: Matches the legacy multi-step wizard, making onboarding interactive and less overwhelming.

### Decision 3: Custom Styling using Unveiled Primitives
* **Approach**: Use imported primitive panels and buttons (`Panel`, `Button`, `Badge`) and standard Tailwind utilities to implement a premium, high-contrast, modern UI. Add a step indicator progress bar displaying the percentage completed.
* **Alternative Considered**: Tailwind-only styles without primitives. Replaced to maintain consistency with the Unveiled custom design system.

## Risks / Trade-offs

* **[Risk]** Mood value `"Fam"` in legacy does not match `"Familie"` in database/schema. → **[Mitigation]** Define the option as `"Familie"` internally in `onboardingPreferenceOptions` but render it as `"Fam"` in the UI if needed, or simply render `"Familie"` as matches the current database schema.
* **[Risk]** User skips onboarding without selecting all fields. → **[Mitigation]** Ensure that `actions.saveOnboarding` accepts optional fields, and pass empty arrays or defaults (e.g. `undefined` for `ageGroup` when empty string `""` is selected) so validation does not fail.

## Migration Plan

* **Deploy**: Build and run the app locally. Test compilation and run Playwright regression/smoke tests.
* **Rollback**: Revert `visual-system-app.tsx` changes to restore the original simple onboarding layout.

## Open Questions

* None. The legacy logic and database schemas are fully compatible.
