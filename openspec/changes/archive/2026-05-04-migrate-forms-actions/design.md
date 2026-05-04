## Context

The legacy app combines React Hook Form and Zod for visible field validation with client-side mutations in Firebase-backed store methods. The target app already uses Astro, React islands, Better Auth, Drizzle/Postgres domain tables, TanStack Query, and server-side authorization helpers. Form submissions now need to cross the server boundary through Astro Actions so validation, authorization, persistence, and cache invalidation are handled consistently.

This change affects several form families: auth, onboarding, profile/account settings, membership status inputs, partner management, admin event forms and event series builders, member admin actions, and check-in actions. Some controls that look like forms, such as discovery filters, are not mutations and can remain local state or route query state.

## Goals / Non-Goals

**Goals:**

- Define shared Zod schemas that represent UI form inputs rather than raw database insert shapes.
- Implement Astro Actions for all user-facing mutating submissions in scope.
- Return consistent action result envelopes with field errors, form errors, success notices, and TanStack Query invalidation keys.
- Integrate action results with React Hook Form so server validation appears beside the relevant fields.
- Enforce authentication, role, ownership, and partner access checks before protected mutations.
- Preserve user-facing validation messages from the old forms where they are visible in migrated UI.

**Non-Goals:**

- Implement full payment provider integration or production billing webhooks.
- Add background jobs for recurring billing, reminders, or event automation.
- Rebuild every page route at once beyond the form integration surfaces needed by this change.
- Replace local filter, sort, modal, or wizard state that does not persist server data.

## Decisions

1. Use UI-specific Zod schemas as the action input contract.

Generated Drizzle insert schemas are useful as a secondary persistence guard, but they expose database-oriented fields such as identifiers, audit timestamps, counters, and provider columns that are not appropriate for UI input. Each action family will use a named UI schema, then map validated input to Drizzle writes or Better Auth calls. Alternative considered: use generated insert schemas directly. That would reduce duplication but make UI forms brittle and too tightly coupled to persistence.

2. Standardize one action result envelope.

Actions will return a typed envelope with `ok`, optional `fieldErrors`, optional `formError`, optional `notice`, and optional `invalidate` query keys. React islands can use a single helper to apply `fieldErrors` to React Hook Form, show `formError`, display success notices, and invalidate TanStack queries. Alternative considered: return action-specific result shapes. That would be simpler per action but would duplicate error mapping and cache handling across forms.

3. Keep client-side React Hook Form validation for field UX, but treat server validation as authoritative.

React Hook Form and Zod resolver validation should continue to provide immediate field feedback. Astro Actions will run the same or equivalent schema server-side and own the final acceptance decision. Alternative considered: server-only validation. That would simplify clients but degrade visible field UX on complex forms such as onboarding, event series, and membership inputs.

4. Authorize inside actions before mutation.

Every protected action will resolve the viewer from the request and use the existing auth helpers for signed-in, admin, owner-or-admin, or partner ownership checks. Authorization failures return safe user-facing form errors and do not mutate data. Alternative considered: rely on page guards. Page guards are still useful, but hydrated islands and direct action calls need server-side enforcement at the action boundary.

5. Separate persisted mutations from local UI controls.

Forms that commit data, create sessions, update profiles, adjust credits, create partners/events, or check in bookings use actions. Purely client-visible filters, sort controls, modal state, and wizard step state can remain local or URL-backed unless they submit a server mutation. Alternative considered: move every form-shaped interaction to actions. That would add network round trips and complexity without improving data integrity.

## Risks / Trade-offs

- Server and client schemas can drift → Export shared schema modules and use the same schema names in React Hook Form resolvers and Astro Actions where practical.
- Action envelopes can become too generic → Keep the envelope generic only for cross-cutting transport concerns; action-specific successful payloads can live under a typed `data` field when needed.
- Payment inputs are sensitive → This change only models visible membership/status inputs and placeholder behavior; production card handling must use provider-hosted or tokenized fields outside this scope.
- Large event forms can produce complex nested errors → Preserve path-based field errors and add tests for event series validation paths.
- Authorization errors may leak resource existence → Return safe unauthenticated/forbidden form errors and avoid resource-specific detail for rejected requests.

## Migration Plan

1. Add shared form schema and action result modules.
2. Implement action families incrementally behind the migrated page surfaces, starting with auth and profile/onboarding, then admin/partner/event/check-in actions.
3. Replace legacy store mutation call sites in migrated React islands with action submission helpers.
4. Add focused tests for schema validation, action authorization failures, successful mutations, and invalidation hints.
5. Keep legacy references read-only; do not import Firebase runtime code into target form/action modules.

Rollback is limited to reverting the migrated action call sites and action modules for a given form family. Because this change does not require new mandatory database columns, rollback should not require data migration.

## Open Questions

- Which membership inputs should remain placeholders until provider integration is specified, especially card-like fields versus subscription status changes?
- Should successful action notices be localized in action modules or returned as notice keys for page-level translation?
- Should query invalidation keys be centralized in a domain query-key module before actions depend on them broadly?
