## Context

The repo has DE/EN dictionaries in `packages/api/src/i18n.ts` and the
app surfaces them via `copyFor(language).<dot.path>`. The current
shape of the dictionary is type-enforced for `shell.*`, the auth form
bundles, and the Better Auth error bundle (see
`openspec/specs/i18n-copy/spec.md` → "i18n Dictionary Has a Declared
Shape"), so adding or removing a key in those bundles fails
`bun run check`. Every other bundle — most notably `auth.*` (the
non-form keys like `auth.openApp`, `auth.alreadySignedIn`),
`admin.staleData`, `partner.alreadyUsed`, `partner.checkInFailed`, and
`readyz.failingProbe` — has no compile-time parity guarantee.

After iterations 12–13 new copy shipped in the auth landing form, the
admin operations tabs, and the partner portal without being added to
the `DE` bundle, so the German build leaks English strings. The
existing per-bundle type safety doesn't help because (a) those keys
sit in un-typed branches of `appCopy` and (b) the `PartnerPortal`,
`AdminPanel`, and `visual-system-app` components fall back to inline
`selectedLanguage === "DE" ? "..." : "..."` ternaries that bypass the
dictionary entirely.

We need a runtime gate that walks every `copyFor(language).<path>`
reference in `packages/app/src/**` and `packages/landing/src/**`,
walks the `DE` and `EN` branches of `appCopy`, and fails the build
when a key is missing in either language.

## Goals / Non-Goals

**Goals:**

- One Bun-runnable gate (`scripts/i18n-coverage.ts`) that exits
  non-zero when any `copyFor(language).<path>` access points at a key
  missing in `DE` or `EN`, and prints the missing key + the file that
  referenced it.
- Zero hardcoded user-facing English strings reachable from
  `packages/app/src/**` and `packages/landing/src/**` outside the
  design-system semantic-class surface.
- The gate is wired into `bun run check` so CI catches drift on every
  PR.
- A permanent unit test (`tests/unit/i18n-coverage.test.ts`) asserts
  the three spec scenarios (missing DE, missing EN, all present).

**Non-Goals:**

- A full copy audit of marketing strings on `/membership` (already
  shipped in DE; out of scope for this change).
- A copy review workflow / human-translation pipeline.
- A full AST walk of the codebase — the existing `copyFor(...)`
  call-site pattern is consistent enough to grep for.
- Adding new typed-parity rules to other branches of `appCopy` (e.g.
  `admin.*`, `partner.*`, `readyz.*`); this change ships a runtime
  gate, not a static-type upgrade for those branches.

## Decisions

### 1. Grep-based extraction rather than a full AST walk

`copyFor(language).<path>` is the only call shape used in the app
(see `packages/app/src/lib/auth-display.ts`,
`packages/app/src/components/unveiled/context.tsx`, the data-access
mappers, etc.). A simple `rg` (or `grep -E`) pass over
`packages/app/src/**` and `packages/landing/src/**` with a regex of
the form `copyFor\(\s*[^)]+\s*\)\.([a-zA-Z][a-zA-Z0-9.]*)` is enough
to enumerate the referenced paths.

- **Alternative considered: a TypeScript compiler API walk.** Rejected
  because the gate runs as a plain Bun script with no project graph
  available; a compiler-based walk would need to bootstrap `tsc` and
  walk the type-checker, which is overkill for what is essentially a
  dot-path lookup table.
- **Alternative considered: an ESLint rule.** Rejected because the
  existing linting surface is Biome, not ESLint; introducing a new
  tool surface for one rule is more expensive than a stand-alone Bun
  script.

### 2. Walk `appCopy` by importing it as ESM

The dictionary is a plain `export const appCopy = { DE: {...}, EN: {...} }`
literal. Importing it via the existing `@unveiled/api/i18n` alias
from a Bun script lets us recurse through the object tree and collect
the flat set of `<path>` keys for each language.

- **Alternative considered: regex-parse the `i18n.ts` source file.**
  Rejected because the dictionary has comments, multi-line string
  values, and template literals that are easy to mis-tokenise; ESM
  import is the canonical consumer path.

### 3. Wire into `bun run check`, not a new CI job

`bun run check` already fans out to `biome`, `astro check`, `specs:check`,
`tokens:check`, `ladle:coverage`, `check:atomic-layers`,
`check:styling-ownership`, and `wrangler:check-env`. Adding
`check:i18n-coverage` keeps a single local command and a single CI
gate.

### 4. Use a small `bun:test` harness, not a Vitest spec

The repo's `bun run test:unit` runner is `bun test`, not Vitest. The
new `tests/unit/i18n-coverage.test.ts` follows the existing
`tests/unit/*.test.ts` shape (see
`tests/unit/design-system-hero-ui-boundary.test.ts`).

### 5. Add `shell.nav.becomeMember` already present in i18n.ts — preserve

`shell.nav.becomeMember` already exists in both `DE` and `EN`
(see `i18n.ts:100` / `i18n.ts:607`); the gate will keep it
green. The change only needs to *use* the existing key from the
app-shell view-model layer (`packages/app/src/lib/auth-display.ts`)
and `context.tsx` so the inline ternary is removed. The tasks.md
treats this as a "use existing key" item rather than a "add new key"
item.

## Risks / Trade-offs

- **Grep matches inside comments or template strings produce false
  positives.** → Mitigation: the regex requires the match to start
  with `copyFor(`, the path to match
  `^[a-zA-Z][a-zA-Z0-9.]*$`, and the gate ignores paths that resolve
  to a non-leaf object (e.g. `copyFor(language).shell` is a
  dictionary branch, not a leaf, and is filtered out).
- **Ladle stories and test fixtures under
  `packages/design-system/src/**` are not covered by the gate** —
  the gate only walks `packages/app/src/**` and
  `packages/landing/src/**`. → Mitigation: the design-system
  components own their own `*.mock.tsx` dictionaries (e.g.
  `signup-form.mock.tsx`) which are local to the story and are
  exercised by the Ladle harness, not the runtime app.
- **The new keys (`auth.openApp`, `auth.alreadySignedIn`, etc.) are
  not yet typed** as a dedicated shape the way `ShellCopy` is. →
  Mitigation: the runtime gate covers them. A future iteration can
  add a `PartnerCopy` / `AdminCopy` typed shape and remove the
  runtime check, but that's out of scope for this change.
- **`readyz.failingProbe` is only consumed by the JSON
  `ReadinessEnvelope` shape** (no human-readable UI surfaces it). →
  Mitigation: the key is still added to both `DE` and `EN` so future
  surfaces (e.g. an operator dashboard) have a place to land; the
  gate then enforces DE/EN parity for it as well.

## Migration Plan

1. Land the dictionary additions in `packages/api/src/i18n.ts` in a
   single commit.
2. Land the call-site refactors (`PartnerPortal.tsx`,
   `AdminPanel.tsx`, `visual-system-app.tsx`,
   `venue-check-in/[partnerId].astro`) in a single follow-up commit.
3. Land the gate script and the unit test in a third commit.
4. Wire the gate into `bun run check` and update `AGENTS.md` to
   reflect the new command in the toolchain table.

No rollback concerns: each commit is independently green; reverting
any one commit leaves the previous behaviour intact.
