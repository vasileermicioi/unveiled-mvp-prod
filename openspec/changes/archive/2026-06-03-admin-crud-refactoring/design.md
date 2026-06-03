## Context

The Unveiled admin dashboard operates as a subview within `visual-system-app.tsx`. While creation and deletion server actions are available in `src/actions/index.ts` and `src/lib/admin-operations.ts`, the frontend lacks visual affordances to edit events or partners, and deletes are performed without user confirmation. 

## Goals / Non-Goals

**Goals:**
- Provide full editing capabilities for event and partner entities within the Admin dashboard tabs.
- Ensure deletion actions for events and partners require explicit administrative confirmation via a modal dialog.
- Enhance validation error reporting to display localized messages when save or delete operations fail.

**Non-Goals:**
- Creating separate routes for editing (e.g., `/admin/events/edit`). Tab-based routing synchronized with query parameters (e.g., `/admin?tab=events&action=edit&id=...`) is sufficient.
- Adding batch-edit or bulk-deletion tools.

## Decisions

### 1. Form Reuse for Add and Edit Actions
- **Decision:** Reuse the existing event and partner creation forms for the edit flows. Introduce `editingEventId` and `editingPartnerId` state hooks. When set, prefill the form values from the queried database state, change the form titles to "Edit Event" / "Edit Partner", and append the target ID to the submission payload.
- **Alternatives Considered:** Separate components/pages for editing. Rejected to avoid duplicating JSX and styling code in the unified app client.

### 2. Safety Confirmation Modal for Destructive Operations
- **Decision:** Implement a custom modal overlay utilizing the existing `<ModalShell>` component. Present a clear dialog containing a warning description and explicit "Confirm" and "Cancel" buttons.
- **Alternatives Considered:** Native browser `confirm()`. Rejected because it degrades the premium design aesthetic of the site.

### 3. Localization of Server validation errors
- **Decision:** Propagate validation and runtime database errors from Astro server actions in the language specified by the active session cookies. In the client, catch action failures and map them to fields using `react-hook-form`'s `setError`.
- **Alternatives Considered:** Raw client-side validations only. Rejected because database constraints (e.g. duplicate partner emails or date schedule conflicts) can only be verified on the server.

## Risks / Trade-offs

- **[Risk]** Large forms might become cluttered when prefilled on mobile card viewports.
- **Mitigation:** Rely on existing responsive stacked card styling rules and prioritize compact form layouts.
