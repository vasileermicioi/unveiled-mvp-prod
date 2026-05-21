## Context

The current `FaqPage` component in the visual system app uses a single static placeholder answer ("Answers render as bordered accordion rows...") for all 4 FAQ questions in both German and English. To achieve parity with the legacy app, we need to support specific localized answers for each of the questions.

## Goals / Non-Goals

**Goals:**
* Replace the single placeholder FAQ `answer` in `src/lib/i18n.ts` with a list/array of specific answers matching the questions in German and English.
* Update `FaqPage` in `src/components/unveiled/visual-system-app.tsx` to dynamically render the corresponding answer for each question using index-based lookup.
* Ensure translation schema types remain consistent and compile correctly.

**Non-Goals:**
* Adding new FAQ questions or changing the questions.
* Redesigning or styling the accordion UI elements.
* Implementing support contact form features (support remains as an email link).

## Decisions

### 1. Update i18n structure to use an array of answers parallel to questions
We will replace `faq.answer: string` with `faq.answers: string[]` in the translation schema `src/lib/i18n.ts`. 

*Rationale:*
An array of answers mapping 1:1 with the `questions` array is the cleanest and most straightforward way to link questions to their translations, since `questions` is already defined as a string array.

*Alternatives Considered:*
* Key-value map: E.g., `faq.qa: { [key: string]: { question: string, answer: string } }`. This would require refactoring both the types and the components significantly. The parallel array approach is simpler and matches the existing `questions` array structure.

### 2. Index-based lookup in FaqPage Accordion
In `src/components/unveiled/visual-system-app.tsx`, we will map the question index to the corresponding index in `copy.answers`.

```tsx
{copy.questions.map((question, index) => (
  <details ...>
    <summary ...>{question}</summary>
    <p ...>{copy.answers[index]}</p>
  </details>
))}
```

## Risks / Trade-offs

* **[Risk] Mismatch in array lengths** → If `questions` and `answers` have different lengths, the app might render `undefined` or empty text.
  * *Mitigation:* Ensure `answers` has exactly 4 items matching `questions` in both `DE` and `EN` language blocks.
