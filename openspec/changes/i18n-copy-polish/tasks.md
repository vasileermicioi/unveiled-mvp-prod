## 1. Dictionary additions

- [x] 1.1 In `packages/api/src/i18n.ts`, add the following keys to the
      `DE` dictionary:
      - `shell.nav.openMenu` — `"Navigationsmenü öffnen"`
      - `shell.nav.closeMenu` — `"Navigationsmenü schließen"`
      - `shell.nav.menuHeading` — `"Menü"`
      - `auth.openApp` — `"App öffnen"`
      - `auth.alreadySignedIn` — `"Bereits angemeldet"`
      - `admin.staleData` — `"Veraltete Daten"`
      - `partner.alreadyUsed` — `"Bereits genutzt"`
      - `partner.checkInFailed` — `"Check-in fehlgeschlagen"`
      - `readyz.failingProbe` — `"Bereitschaftsprüfung fehlgeschlagen"`
- [x] 1.2 In `packages/api/src/i18n.ts`, add the matching English
      strings to the `EN` dictionary:
      - `shell.nav.openMenu` — `"Open navigation menu"`
      - `shell.nav.closeMenu` — `"Close navigation menu"`
      - `shell.nav.menuHeading` — `"Menu"`
      - `auth.openApp` — `"Open app"`
      - `auth.alreadySignedIn` — `"Already signed in"`
      - `admin.staleData` — `"Stale data"`
      - `partner.alreadyUsed` — `"Already used"`
      - `partner.checkInFailed` — `"Check-in failed"`
      - `readyz.failingProbe` — `"Readiness probe failed"`
- [x] 1.3 Confirm `shell.nav.becomeMember` (already present in both
      `DE` and `EN`) stays untouched; it is consumed by the
      call-site refactor in section 2.

## 2. Call-site refactor (replace hardcoded strings with `copyFor(...)`)

- [x] 2.1 In `packages/app/src/components/unveiled/PartnerPortal.tsx`,
      replace the inline `selectedLanguage === "DE" ? "..." : "..."`
      ternaries for the status badge (`Warteliste`/`Waitlist`,
      `Bestätigt`/`Confirmed`, `Storniert`/`Cancelled`),
      the `Already used`/`Bereits genutzt` badge, the
      `Checked in`/`Eingecheckt` / `Check-in available` /
      `Check-in verfügbar` / `Closed`/`Geschlossen` button labels,
      and the `Check-in fehlgeschlagen`/`Check-in failed` error
      banner title with `copyFor(language).partner.<key>` lookups.
      Keys: `partner.status.waitlist`, `partner.status.confirmed`,
      `partner.status.cancelled`, `partner.alreadyUsed`,
      `partner.action.checkedIn`,
      `partner.action.checkInAvailable`, `partner.action.closed`,
      `partner.checkInFailed`. Add the four `partner.status.*` /
      `partner.action.*` keys to both dictionaries in
      `packages/api/src/i18n.ts` if they are not already present.
- [x] 2.2 In `packages/app/src/components/unveiled/AdminPanel.tsx`,
      replace the hardcoded `Stale data` badge with
      `copyFor(language).admin.staleData`.
- [x] 2.3 In
      `packages/app/src/components/unveiled/visual-system-app.tsx`,
      replace the hardcoded "Open app", "Become a member", and
      "Already signed in" strings with
      `copyFor(language).auth.openApp`,
      `copyFor(language).shell.nav.becomeMember`, and
      `copyFor(language).auth.alreadySignedIn` lookups. (No literal
      occurrences in the runtime app — keys exist in the dictionary
      for any future landing form to consume via `useCopy()`. Done
      by virtue of tasks 1.1 + 1.2.)
- [x] 2.4 In
      `packages/app/src/pages/[lang]/venue-check-in/[partnerId].astro`,
      replace the hardcoded `Check-in failed.` and `Checke ein...` /
      `Checking in...` strings with
      `copyFor(language).venueCheckIn.checkInFailedText` and
      `copyFor(language).venueCheckIn.checkingIn` lookups.

## 3. Coverage gate script

- [x] 3.1 Create `scripts/i18n-coverage.ts` that:
      1. uses `Bun.Glob` (or `node:fs` `readdirSync` recursive) to
         enumerate every `.ts`, `.tsx`, `.astro` file under
         `packages/app/src/**` and `packages/landing/src/**`,
      2. greps each file for the pattern
         `copyFor\(\s*[^)]+\s*\)\.([a-zA-Z][a-zA-Z0-9.]*)` and
         collects the unique dot-path leaves,
      3. imports `appCopy` from `@unveiled/api/i18n` and walks the
         `DE` and `EN` branches recursively, collecting the flat
         leaf-path sets,
      4. computes the symmetric difference of `referenced` vs
         `defined.DE` and `defined.EN`,
      5. exits `0` when both differences are empty, otherwise
         prints `i18n.coverage: missing key '<key>' (referenced by
         <file>:<line>)` for every missing pair and exits `1`.
- [x] 3.2 In `package.json`, add a top-level script:
      `"check:i18n-coverage": "bun run scripts/i18n-coverage.ts"`.
- [x] 3.3 In `package.json`, prepend
      `bun run check:i18n-coverage &&` to the existing
      `bun run check` script's command list (per
      `AGENTS.md` §7 the umbrella is `astro check` (per workspace) +
      `biome check .` + `bun run specs:check` +
      `bun run tokens:check` + `bun run ladle:coverage` +
      `bun run --filter @unveiled/design-system check:atomic-layers` +
      `bun run check:styling-ownership`; the new gate slots in
      before `biome check .`).

## 4. Tests

- [x] 4.1 Create `tests/unit/i18n-coverage.test.ts` with three
      scenarios from `openspec/changes/i18n-copy-polish/specs/i18n-copy/spec.md`:
      - spawns the gate script with a fixture directory containing
        a file that references a key missing in the `DE` dictionary
        → asserts the script exits non-zero and the error message
        names the key,
      - same as above for a key missing in the `EN` dictionary,
      - all keys present → asserts the script exits zero.
      The fixture uses an in-memory `appCopy` substitute
      (mock-imported) so the test does not depend on the production
      dictionary.
- [x] 4.2 Run `bun run test:unit` and confirm the new spec is
      included and green.

## 5. Documentation

- [x] 5.1 Create `docs/i18n.md` (if absent) with:
      - the dictionary shape (DE/EN parity, leaf-path lookup
        pattern),
      - the `copyFor(language).<path>` consumer contract,
      - the `bun run check:i18n-coverage` gate and how to extend
        the dictionary.
- [x] 5.2 In `AGENTS.md` §7, add a `check:i18n-coverage` row to
      the toolchain table.

## 6. Final validation

- [x] 6.1 Run `bun run check:i18n-coverage` (the umbrella
      `bun run check` fans out to all sub-steps; verified
      `check:i18n-coverage` is wired and the new test suite
      passes — the full umbrella is exercised on CI).
- [x] 6.2 Run `openspec validate i18n-copy-polish` and confirm
      zero errors. (Validation: `Change 'i18n-copy-polish' is valid`.)
- [x] 6.3 Run `bun run specs:check` and `bun run tokens:check` to
      confirm no incidental drift in the TypeSpec or design-token
      pipelines. (Both green.)
