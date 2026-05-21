## Why

The current `FaqPage` component renders a single placeholder answer string ("Answers render as bordered accordion rows...") for all questions. The legacy app has specific German and English answers for each question, explaining details about credits, booking codes, and support.

## What Changes

- Modify `src/lib/i18n.ts` to replace the single `answer` string with a mapped list or dictionary of answers matching each question in both DE and EN:
  - **Q1 (Credits)**: German and English explanation of booking events using credits.
  - **Q2 (Cancellation)**: Clarification on membership billing/cancellations.
  - **Q3 (Redemption/Codes)**: Location and redemption rules for entry or promo codes.
  - **Q4 (Capacity/Full)**: Waitlist and booking availability instructions.
- Update `FaqPage` in `visual-system-app.tsx` to look up the correct answer by index or question key, rather than displaying the static fallback text.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `pages`: Support specific localization of FAQ answers per question for both German and English page surfaces.

## Impact

- `src/lib/i18n.ts`: Update translations structure for `faq` to support individual answers per question.
- `src/components/unveiled/visual-system-app.tsx`: Update the Accordion loop inside `FaqPage` to display `copy.answers[index]` instead of `copy.answer`.
