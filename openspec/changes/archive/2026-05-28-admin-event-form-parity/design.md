## Context

Currently, the admin panel in `src/components/unveiled/visual-system-app.tsx` allows creating events, but several crucial configuration fields (category, ticketType, secretCodeMode, secretCode, languages, targetAgeGroups, address, and neighborhood) are hardcoded in the form submit handler. This restricts administrators from creating diverse events (e.g., Kino with a voucher promo code instead of a manual secret code) and doesn't match the capabilities supported by the database/backend.

## Goals / Non-Goals

**Goals:**
- Add dynamic controls for category, ticket type (with conditional input rendering), languages, age groups, address, and neighborhood to the event form.
- Read these configured options from `FormData` in the onSubmit handler and pass them dynamically to `actions.saveEvent`.
- Provide a clean and intuitive admin UI with interactive toggles.

**Non-Goals:**
- Redesigning the database schema or changing backend business logic.
- Adding validations beyond the existing `eventFormSchema` constraints.

## Decisions

### 1. State-Driven Ticket Type & Secret Code Mode Selection
- **Choice**: Use React state (`ticketType` and `secretCodeMode`) in the `AdminPanel` component to track user choices and conditionally render ticket-related fields.
- **Rationale**: Form inputs like `promoCode` and `eventWebsiteUrl` are only required/meaningful for `VOUCHER` events, while `secretCode` and `secretCodeMode` are only for `SECRET_CODE` events. Conditional rendering reduces form clutter.
- **Alternatives Considered**: Keeping all fields visible and letting users fill whichever they want. This leads to poor UX and potential validation errors if users fill incompatible fields.

### 2. Multi-Select Checkboxes for Languages and Age Groups
- **Choice**: Render multiple checkboxes with native `name="languages"` and `name="targetAgeGroups"` attributes. Extract arrays in the submit handler using `formData.getAll()`.
- **Rationale**: Checkboxes offer the most straightforward and accessible multi-select experience for a small set of options. Leveraging native form validation/retrieval via `FormData` keeps logic simple and robust.

## Risks / Trade-offs

- **[Risk]**: Invalid input combinations leading to server-side action validation errors (e.g., not entering a secret code for manual secret code events).
  - **Mitigation**: Rely on client-side HTML5 validations (e.g., `required`) combined with Zod validation messages returned from Astro Actions. Show action validation errors to the user in `adminMessage` state.
