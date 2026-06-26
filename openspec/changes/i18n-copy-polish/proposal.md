## Why

After iterations 12–13 the auth landing form, admin operations tabs, and partner portal ship new copy that is not in the `DE`/`EN` dictionary in `packages/api/src/i18n.ts`, so hardcoded English strings leak into the German build. There is no automated gate that catches a missing DE/EN pair before merge, so each new feature has to be manually re-audited. We need a typed `copyFor(...)` lookup contract and a CI gate that fails the build the moment a production file references a key that is missing in either language.

## What Changes

- Add the following keys to both `DE` and `EN` dictionaries in `packages/api/src/i18n.ts`:
  `shell.nav.openMenu`, `shell.nav.closeMenu`, `shell.nav.menuHeading`,
  `shell.nav.becomeMember` (already present, see Impact),
  `auth.openApp`, `auth.alreadySignedIn`,
  `admin.staleData`, `partner.alreadyUsed`, `partner.checkInFailed`,
  `readyz.failingProbe`.
- Replace the hardcoded English strings in
  `packages/app/src/components/unveiled/PartnerPortal.tsx`,
  `packages/app/src/components/unveiled/AdminPanel.tsx`,
  `packages/app/src/components/unveiled/visual-system-app.tsx`, and
  `packages/app/src/pages/[lang]/venue-check-in/[partnerId].astro`
  with `copyFor(language).<path>` lookups so every user-facing string
  is sourced from the dictionary.
- Add a new `bun run check:i18n-coverage` Bun script
  (`scripts/i18n-coverage.ts`) that:
  1. greps `packages/app/src/**` and `packages/landing/src/**` for
     `copyFor(language).<dot.path>` style accesses,
  2. walks the `DE` and `EN` branches of `appCopy` in
     `packages/api/src/i18n.ts`,
  3. fails with a non-zero exit code when any referenced key is
     missing in either language, listing the key and the file that
     referenced it.
- Wire `bun run check:i18n-coverage` into the existing `bun run check`
  umbrella so drift is caught in CI and locally on every commit.
- Add a permanent unit test (`tests/unit/i18n-coverage.test.ts`) that
  exercises the three spec scenarios (missing DE, missing EN, all
  present) and is part of `bun run test:unit` (and therefore
  `bun run check`).
- Document the dictionary shape and the gate in `docs/i18n.md` (create
  if absent).

No breaking changes; only additive dictionary keys and a new
build-time script.

## Capabilities

### New Capabilities

(none — this change only modifies an existing capability.)

### Modified Capabilities

- `i18n-copy`: extend the **Translation Coverage Is Enforced** rule so
  every key referenced from a production code path via
  `copyFor(...)` MUST be present in both the `DE` and `EN` dictionaries,
  and the new `bun run check:i18n-coverage` script MUST fail the build
  otherwise. The rule's `#### Scenario:` blocks are updated to assert
  the runtime gate in addition to the existing type-level parity rule.

## Impact

- **Touched files (estimated):**
  - `packages/api/src/i18n.ts` — add the missing `DE`/`EN` keys.
  - `packages/app/src/components/unveiled/PartnerPortal.tsx` —
    replace the inline `selectedLanguage === "DE" ? "Bereits genutzt"
    : "Already used"` ternary (and the matching `Waitlist` /
    `Confirmed` / `Cancelled` / `Checked in` / `Check-in available` /
    `Closed` / `Check-in fehlgeschlagen` / `Check-in failed`
    ternaries) with `copyFor(language).partner.*` lookups.
  - `packages/app/src/components/unveiled/AdminPanel.tsx` — replace
    the hardcoded `Stale data` badge with
    `copyFor(language).admin.staleData`.
  - `packages/app/src/components/unveiled/visual-system-app.tsx` —
    replace the "Open app" / "Become a member" / "Already signed in"
    hardcoded strings with `copyFor(language).auth.*` /
    `shell.nav.*` lookups.
  - `packages/app/src/pages/[lang]/venue-check-in/[partnerId].astro` —
    replace the hardcoded `Check-in failed.` with
    `copyFor(language).partner.checkInFailed`.
  - `scripts/i18n-coverage.ts` (new) — the gate script.
  - `package.json` — register `check:i18n-coverage` and wire it into
    `bun run check`.
  - `tests/unit/i18n-coverage.test.ts` (new) — Bun-test harness for
    the three spec scenarios.
  - `docs/i18n.md` (new) — dictionary shape + gate description.
- **Dependencies:** none added.
- **Test impact:** `bun run test:unit` gains a new file; `bun run
  check` gains an extra sub-step.
- **Spec impact:** the existing `openspec/specs/i18n-copy/spec.md`
  receives a modified `Translation Coverage Is Enforced` requirement
  (delta only — the typed-parity rule stays untouched).
