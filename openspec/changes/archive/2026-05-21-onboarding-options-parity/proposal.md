## Why

The current onboarding page is restricted to a subset of options (only 2 interests, 1 district, 1 timing, and 2 days) and hardcodes several fields on submission (such as age group, moods, language preferences, and accessibility). This overrides the user's actual choices. The legacy application provided a complete, multi-step onboarding flow where all fields were customizable. Restoring these options ensures profile personalization matches legacy parity.

## What Changes

- Expand the `onboardingPreferenceOptions` in `visual-system-app.tsx` to include all legacy values:
  - **Interests**: Theater, Kino, Museum, Ausstellung, Konzert, Talk/Lesung, Comedy, Tanz/Performance.
  - **Moods**: Leicht, Experimentell, Klassisch, Politisch, Fam.
  - **Districts**: Mitte, X-Berg, P-Berg, Charlottenburg, Wedding, F-Hain, Schöneberg.
  - **Timing**: After Work, Weekend, Day.
  - **Days**: Mo, Di, Mi, Do, Fr, Sa, So.
  - **Preferred Languages**: DE, EN, Non-V.
- Update `OnboardingPage` in the UI to present a 4-step wizard interface layout mirroring legacy steps:
  - **Step 1**: Age group selection (18-25, 26-35, 36-50, 50+).
  - **Step 2**: Interests & Moods selection.
  - **Step 3**: Districts & Max distance slider (1 to 25 km).
  - **Step 4**: Timing, Days, Languages, and Accessibility toggles.
- Retrieve the selected values from component state and pass them to the `actions.saveOnboarding` server action call.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `forms-actions`: Update client-side form submission to forward all onboarding wizard selections rather than hardcoded fields.

## Impact

- `src/components/unveiled/visual-system-app.tsx`: Redefine `onboardingPreferenceOptions`, add step-based component state, and bind state to the server action call.
