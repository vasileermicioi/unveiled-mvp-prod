## ADDED Requirements

### Requirement: Partner Page Uses Live Operations Data
The partner page SHALL render the existing partner portal surface from live partner-scoped data and authorized operations.

#### Scenario: Partner page initial render is scoped
- **WHEN** an authenticated partner opens `/partner`
- **THEN** the page loads only the partner details, QR token display state, event options, guest rows, and export/check-in state for the viewer's linked partner.

#### Scenario: Partner page check-in updates row
- **WHEN** a partner check-in action succeeds from a guest row
- **THEN** the page refreshes the affected guest row so used status and checked-in timestamp are visible without showing stale availability.

#### Scenario: Partner page operation fails safely
- **WHEN** a partner export or check-in action fails validation, ownership, or check-in-window rules
- **THEN** the page displays a safe visible error in the portal surface and keeps protected row details scoped to the partner.

### Requirement: Admin Page Uses Live Operations Data
The admin page SHALL render dashboard, event, partner, and member management surfaces from authorized live admin data.

#### Scenario: Admin dashboard renders live counts
- **WHEN** an authorized admin opens the dashboard tab
- **THEN** dashboard counts, recent booking rows, export partner options, and export controls render from admin-authorized server data.

#### Scenario: Admin events tab mutates live events
- **WHEN** an admin saves, deletes, exports, edits, or series-creates events
- **THEN** the page submits the matching operation, renders safe failures in the event surface, and refreshes affected event rows and dashboard/public discovery data after success.

#### Scenario: Admin partners tab mutates live partners
- **WHEN** an admin saves, deletes, rotates QR token state, or provisions portal access for a partner
- **THEN** the page submits the matching operation, renders safe failures in the partner surface, and refreshes affected partner rows and public/partner display data after success.

#### Scenario: Admin members tab mutates live members
- **WHEN** an admin refreshes member rows, expands details, freezes or unfreezes a member, or adjusts credits
- **THEN** the page uses authorized live data and refreshes affected member, profile, ledger, and eligibility views after success.
