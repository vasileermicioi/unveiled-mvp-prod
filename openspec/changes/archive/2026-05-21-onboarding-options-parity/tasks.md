## 1. Options and State Setup

- [x] 1.1 Redefine `onboardingPreferenceOptions` to contain all legacy options for interests, moods, districts, timing, preferredDays, and preferredLanguages in `src/components/unveiled/visual-system-app.tsx`.
- [x] 1.2 Redefine `defaultOnboardingPreferences` to use appropriate default structures in `src/components/unveiled/visual-system-app.tsx`.

## 2. Onboarding Page UI Refactoring

- [x] 2.1 Add wizard local states for `step`, `ageGroup`, `maxDistance`, `moods`, `preferredLanguages`, and `accessibility` to the `OnboardingPage` component in `src/components/unveiled/visual-system-app.tsx`.
- [x] 2.2 Implement conditional rendering for the 4 steps (Step 1: Age, Step 2: Interests & Moods, Step 3: Districts & Max Distance, Step 4: Timing, Days, Languages, & Accessibility) in `src/components/unveiled/visual-system-app.tsx`.
- [x] 2.3 Implement the visual step navigation (Back, Next, Save/Finish, Skip) and step-completion progress bar in `src/components/unveiled/visual-system-app.tsx`.

## 3. Server Action Wiring

- [x] 3.1 Update `submit` in `OnboardingPage` to forward the actual local wizard choices (including `ageGroup`, `interests`, `moods`, `districts`, `maxDistance`, `timing`, `preferredDays`, `preferredLanguages`, `accessibility`) to the `actions.saveOnboarding` server action in `src/components/unveiled/visual-system-app.tsx`.

## 4. Verification and Testing

- [x] 4.1 Run type-checking or development builds to verify that there are no compilation errors.
- [x] 4.2 Run tests to confirm legacy parity and functionality regression safety.
