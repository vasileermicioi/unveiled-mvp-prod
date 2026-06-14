## Context

The migrated app shell is implemented in
`src/components/unveiled/app-shell.tsx:1` and consumes an
`AppShellViewModel` from `src/lib/app-shell-view-models.ts:1`. The shell
ships with a hamburger toggle on viewports below 1024px and a
slide-in drawer that already exists in the spec
(`openspec/specs/app-shell/spec.md:327` — "Collapsible Mobile Navigation
Drawer"). The current implementation:

- Renders the hamburger button with a hard-coded English
  `aria-label="Open navigation menu"` (`app-shell.tsx:308`) and the
  close button with `aria-label="Close navigation menu"`
  (`app-shell.tsx:340`).
- Renders the drawer as a plain `<div>` with no `role="dialog"`,
  `aria-modal`, or labelled-by relationship.
- Renders the language toggle as a plain `<div>` with two `<button>`
  children and no accessible grouping (`app-shell.tsx:153`).
- Renders the brand tagline (`shell.tagline`) directly from the view
  model — the view model itself carries the literal English string and
  is not routed through the typed `i18n.shell.*` bundle.
- The DE/EN bundles in `src/lib/i18n.ts:25` declare a `shell.nav.*`
  shape, but the bundle is not exported as a typed shape, so the type
  checker does not enforce DE/EN parity of the new keys.

The 10-iteration catalog row
`.development-plan/09-iteration/01-review-existing-features.md:40`
flags this surface as `missing-aria, untranslated-copy` and lists
`app-shell-aria-and-i18n` as the P0 slug.

## Goals / Non-Goals

**Goals:**

- Every interactive element in the shell header, mobile drawer, and
  language toggle has a localized, role-appropriate a11y attribute
  (`aria-label`, `aria-expanded`, `aria-controls`, `aria-pressed`,
  `role="dialog"`, `aria-modal`, `aria-labelledby`).
- Every shell-rendered string is sourced from the typed
  `i18n.shell.*` bundle so the parity unit test in
  `tests/unit/i18n-parity.test.ts` (when introduced by the
  `i18n-copy` spec) covers the new keys.
- The TypeScript type system fails `bun run check` if a key is added
  to the DE bundle but not the EN bundle (and vice versa).
- The change ships gherkin coverage for the hamburger toggle, drawer
  open/close, and language toggle `aria-pressed` state.
- The change ships a storybook story for `AppShell` with a `play`
  interaction test that opens the drawer.

**Non-Goals:**

- Refactoring the language toggle into a Radix/shadcn `ToggleGroup`.
  We keep the segmented-button implementation; we only add the a11y
  attributes the toggle is missing.
- Restructuring the drawer into a focus-trapped modal. That belongs
  to the `booking-modal-dialog` P0 row (`bookings` domain) which
  already plans a `replace` refactor; the drawer just needs
  `role="dialog"` + `aria-modal` for now.
- Changing the `i18n.shell.tagline` placement. The tagline stays
  inside the brand link on `md+` viewports; we only route it through
  the typed copy bundle.
- Adding new public routes. No new TypeSpec entries are required by
  this change.

## Decisions

### D1 — Localize the drawer's aria-labels via existing `i18n.shell.nav` keys

Add three new keys to the `i18n.shell.nav` bundle: `openMenu`,
`closeMenu`, `menuHeading`, `languageGroup`. Reuse the existing
`copyFor(shell.language.selected).shell.nav.*` pattern that
`ShellNavigation` already uses (line 197) so we do not introduce a
second copy-routing path.

**Why not a separate `shell.a11y.*` namespace?** Keeping the keys
under `shell.nav` matches where they are rendered (the navigation
drawer) and avoids a third top-level key prefix. The i18n-copy
spec's "i18n Dictionary Has a Declared Shape" requirement (already
in `openspec/specs/i18n-copy/spec.md:18`) just needs the new keys
declared in the typed `ShellCopy` shape, regardless of namespace.

### D2 — Use `aria-expanded` + `aria-controls` (not a checkbox toggle)

The hamburger button is a disclosure trigger, not a toggle, so
`aria-expanded={drawerOpen}` is the correct ARIA pattern. Pair it
with `aria-controls="<drawer-id>"` and assign the drawer a stable
id (`shell-mobile-drawer`).

**Why not `<button aria-pressed>`?** `aria-pressed` is reserved for
toggle buttons that hold a value the user is directly manipulating
(think a "bold" toolbar button). A disclosure is opened/closed, not
pressed; `aria-expanded` is what screen readers announce.

### D3 — Wrap the drawer in `role="dialog"` + `aria-modal="true"` with `aria-labelledby`

Use `aria-labelledby` pointing at the localized menu heading
(`copy.menuHeading`) rather than `aria-label`, so the heading text
is the same source the visible UI shows. Keep focus management
unchanged (the close button is the first focusable element inside
the drawer; we add `tabIndex={-1}` to the drawer panel itself so
programmatic focus can target it after opening — without doing
the full focus-trap that `booking-modal-dialog` will own).

### D4 — Group the language toggle with `role="group"` + `aria-pressed` on each option

`role="group"` is the correct ARIA role for a set of related toggle
buttons that are not a toolbar or a radiogroup (a radiogroup would
require exactly-one semantics we do not enforce — the user can pick
DE or EN, but the active state is the only legal state, so a
radiogroup is arguably more correct). We use `role="group"` + a
localized `aria-label` + `aria-pressed` on each button to keep the
existing segmented-button styling and not force a `<fieldset>`
which would add visual chrome.

**Why not `role="radiogroup"`?** `aria-pressed` keeps the existing
button semantics and works with the current keyboard handling
(`<button type="button">`). A radiogroup would require changing
the markup to `<input type="radio">` and re-styling — a larger
change outside this row's scope.

### D5 — Export a typed `ShellCopy` shape from `src/lib/i18n.ts`

Replace the implicit `Record<string, ...>` typing with an explicit
`ShellCopy` interface that mirrors the DE/EN bundles, and use a
`Record<Language, ShellCopy>` to constrain the dictionary. The
type checker then fails `bun run check` if a key is added to one
language and not the other.

**Why not a runtime test in `tests/unit/i18n-parity.test.ts`?** The
catalog row lists this surface as `untranslated-copy`, and the
type-level guarantee catches the regression at `bun run check`
time. We will still update the i18n parity unit test (when one
exists) to assert a specific set of required shell keys.

## Risks / Trade-offs

- **Breaking visual parity with the legacy frame** → Mitigation:
  this change only adds attributes and routes text through the
  existing copy bundle; no CSS classes change. The visual-system
  storybook snapshot (`tests/visual/app-shell.spec.ts`) acts as
  the regression guard.
- **Drawer focus management is incomplete** → Mitigation: the
  `booking-modal-dialog` row (P0) owns the full focus-trap and
  escape-key work. This change only adds `role="dialog"` and
  `aria-modal` so the surface is at least announced correctly to
  assistive tech today; the full trap is tracked in a follow-up
  row.
- **Adding typed `ShellCopy` could break unrelated callers if the
  shape is too strict** → Mitigation: we only add the new
  `shell.nav.{openMenu,closeMenu,menuHeading,languageGroup}` and
  `shell.tagline` keys; we do not change the existing shape. The
  current DE/EN bundles already declare `shell.nav` and
  `shell.tagline`, so the new shape is a strict superset.
- **Gherkin scenarios using only proximity/layout selectors** → The
  `app-shell` feature file already uses proximity selectors (see
  `tests/features/core-platform/app-shell.feature`). We follow the
  same convention; the new drawer scenarios use the
  `[aria-controls="shell-mobile-drawer"]` + `role="dialog"` selectors
  to drive the open/close assertions.

## Migration Plan

1. Land the i18n.ts shape change and the new keys behind
   `bun run check` first; the type checker will fail the build if
   DE/EN drift, so this is the safety net.
2. Land the `app-shell.tsx` a11y attributes as a single commit so
   the visual-system snapshot can be regenerated in one place.
3. Land the gherkin scenarios and the storybook story as a
   separate commit; both depend on the attribute changes being
   in place.
4. Land the OpenSpec `## MODIFIED Requirements` blocks in
   `app-shell/spec.md` and `i18n-copy/spec.md` (and the
   `shell-aria-i18n` capability) as a docs-only commit.
5. Rollback: each commit is independently revertable. The i18n.ts
   shape change is the only commit that touches a public type; if
   it has to roll back, the rest of the change is unaffected.

## Open Questions (revised after storybook swap)

- Should 10-iteration's other P0 rows opt into the same
  `*.stories.tsx` + `play` pattern this row establishes, or keep
  the gherkin-only coverage they already have? The storybook
  build verifies the stories compile and the `play` test bodies
  are well-typed; running them in CI needs a working Chromium
  binary, which the dev sandbox cannot install.

## Open Questions

- Should the `app-shell.feature` scenarios live under
  `tests/features/core-platform/app-shell.feature` (the existing
  file) or a new `tests/features/core-platform/app-shell-drawer.feature`?
  Default: append to the existing file to keep the gherkin
  coverage of one feature in one place.
- Does the `shell.tagline` text need to be a per-page tagline (in
  which case it belongs in the page-level view model, not the shell
  view model)? The current implementation reads it from the shell
  view model, and the spec already lists it as required display
  data. We keep that contract; this change only routes the existing
  literal through the i18n bundle.
