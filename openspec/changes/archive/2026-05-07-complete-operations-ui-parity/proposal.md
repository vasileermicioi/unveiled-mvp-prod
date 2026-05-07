## Why

The app already contains admin and partner operation server functions, actions, and repository support, but the visible admin and partner surfaces are not yet wired to those live workflows. This change closes the parity gap with the legacy operations experience so admins and partners can manage events, partners, members, guests, check-ins, QR tokens, and exports from authenticated UI.

## What Changes

- Wire the partner portal to authenticated partner data for venue details, QR path/token status, event options, guest rows, check-in actions, and venue-scoped exports.
- Wire the admin operations panel to live dashboard counts, event rows, partner rows, member rows, member details, and member history.
- Connect admin event create/update/delete and event series creation controls to the existing operation actions.
- Connect partner create/update/delete, QR token rotation, and portal user provisioning controls to authorized actions.
- Connect member freeze/unfreeze and credit adjustment controls to authorized actions and refreshed audit/display data.
- Connect booking and code export controls to authorized operational export data.
- Ensure successful mutations invalidate or refresh the affected visible rows and dependent public/operational display data.
- Preserve existing role, ownership, validation, conflict, and action-result envelope behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `operations`: Partner portal, admin event/partner/member operations, check-in, token, provisioning, and export requirements become visible UI behavior backed by live authorized data.
- `pages`: `/admin` and `/partner` page behavior changes from static or partial surfaces to authenticated operational workflows.
- `display-data`: Operational page rows, counts, options, partner details, member summaries, histories, and export rows must reflect live source data and mutation refreshes.
- `forms-actions`: Existing forms and row actions must submit to authorized server actions, handle failures visibly, and clear stale success state.
- `data-access`: Operational read models and mutation refresh paths must expose only authorized admin or partner-scoped data.

## Impact

- Affected legacy references: `_old_app/components/AdminPanel.tsx`, `_old_app/components/PartnerPortal.tsx`, and `_old_app/functions/src/index.ts`.
- Affected app code: `src/lib/admin-operations.ts`, `src/actions/index.ts`, `src/lib/data-access/repositories.ts`, admin/partner route components, operational form components, and export utilities/routes.
- Affected specs: `operations`, `pages`, `display-data`, `forms-actions`, and `data-access`.
- No breaking API envelope, check-in rule, analytics scope, or admin redesign is intended.
