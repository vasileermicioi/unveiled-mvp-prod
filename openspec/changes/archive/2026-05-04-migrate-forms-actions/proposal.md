## Why

The migrated Astro app needs form submissions to use the target server architecture instead of the old client-to-Firebase mutation model. Moving visible forms to typed Astro Actions gives the app server-side validation, authorization, consistent error envelopes, and predictable TanStack Query invalidation while preserving the existing React Hook Form and Zod field experience.

## What Changes

- Add shared Zod schemas for user-facing form inputs across auth, onboarding, profile/account settings, membership status inputs, partner management, event creation/editing, event series building, member admin actions, and check-in actions.
- Add Astro Actions for form-backed mutations, including safe authorization checks before protected data changes.
- Standardize action result envelopes for field errors, form-level errors, success notices, and query invalidation hints.
- Adapt React islands that need client-side field UX to submit through actions and map action errors into React Hook Form without duplicating validation message definitions.
- Preserve visible validation messages and localized form copy from the legacy form references where those messages are user-facing.
- Keep purely client-visible filters and UI state local when they do not persist or mutate server data.

## Capabilities

### New Capabilities

- `forms-actions`: Defines server-validated form actions, shared form schemas, action result envelopes, authorization behavior, and client form integration for mutating form submissions.

### Modified Capabilities

- `auth`: Auth form submissions change from legacy client-side flows to typed server actions while preserving Better Auth-backed identity/session behavior.
- `display-data`: Form display contracts gain action error, success, and invalidation-result data needed by migrated forms.
- `pages`: Page-level form interactions submit through action-backed flows and render server validation, authorization, loading, and success states in the existing migrated form locations.

## Impact

- Affected code includes Astro action definitions, shared validation schema modules, React Hook Form islands, TanStack Query mutation/invalidation helpers, server authorization helpers, and route/page components that render migrated forms.
- Existing domain tables and Better Auth remain authoritative; generated Drizzle schemas may be reused only where they do not leak persistence-only fields into UI form contracts.
- Firebase runtime mutation paths and `_old_app/store.ts` form methods are not used by the target implementation.
- Payment provider calls, background jobs, and a full route rebuild remain out of scope for this change.
