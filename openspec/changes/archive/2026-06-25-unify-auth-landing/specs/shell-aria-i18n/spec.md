## ADDED Requirements

### Requirement: Public Nav Primary Action Tracks Viewer Auth State

The public nav primary CTA SHALL be driven by the viewer's auth state.
For guests, the CTA MUST read "Become a member" (DE: "Mitglied werden")
and point at `/<lang>/membership`. For authenticated viewers, the CTA
MUST read "Open app" (DE: "App öffnen") and point at the
role-appropriate product surface (`/app/<lang>/app`,
`/app/<lang>/admin`, `/app/<lang>/partner`) derived from
`viewer.viewerContext`.

#### Scenario: Guest sees "Become a member" CTA

- **WHEN** a guest viewer renders a public nav
- **THEN** the primary CTA reads "Become a member" (DE: "Mitglied
  werden")
- **AND** the CTA's `href` is `/<lang>/membership`

#### Scenario: Authenticated viewer sees "Open app" CTA

- **WHEN** an authenticated viewer renders a public nav
- **THEN** the primary CTA reads "Open app" (DE: "App öffnen")
- **AND** the CTA's `href` is the role-appropriate product surface
  derived from `viewer.viewerContext`