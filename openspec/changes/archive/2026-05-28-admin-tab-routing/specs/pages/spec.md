## MODIFIED Requirements

### Requirement: Admin Page Uses Live Operations Data
The admin page SHALL render dashboard, event, partner, and member management surfaces from authorized live admin data. The mounted view SHALL be determined by the URL query parameter state.

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

#### Scenario: Admin page URL tab state synchronizes
- **WHEN** an admin clicks an admin navigation tab, or deep-links directly to `/admin?tab=partners`
- **THEN** the browser URL parameter reflects the selected tab (e.g. `tab=partners`) and only the active tab's view component is mounted.
