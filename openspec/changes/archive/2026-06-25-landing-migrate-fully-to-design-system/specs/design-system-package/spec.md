## ADDED Requirements

### Requirement: Landing package consumes the design system, not its internals

The landing package SHALL consume UI surfaces — atoms, molecules, organisms, layouts, semantic CSS classes, and the `cn` helper — exclusively from `@unveiled/design-system` (the public barrel). Every file under `packages/landing/src/**` (Astro pages, Astro layouts, and any future React island) MUST import those surfaces from `@unveiled/design-system` and MUST NOT import from `@unveiled/design-system/lib/*` (the internal path), `@unveiled/design-system/<layer>/<file>` (the per-folder deep imports that skip the barrel), `@nextui-org/react`, `@heroui/*`, `lucide-react`, `@radix-ui/*`, `@headlessui/*`, `react-aria`, `@mui/*`, `@chakra-ui/*`, or any other third-party UI library. The landing package MUST NOT import from a local `packages/landing/src/components/landing/...` path because that path is deleted; any future re-introduction of the folder SHALL be rejected by the gate.

The rule is enforced by:

1. The existing `bun run check:styling-ownership` script (the
   raw-Tailwind-utility and reverse-import gate).
2. A new `R-LANDING-NO-LOCAL-UI` rule added to
   `packages/design-system/scripts/check-styling-ownership.ts`:
   the rule walks every `.tsx`, `.ts`, and `.astro` file in
   `packages/landing/src/**` and fails if any file imports from
   a relative path that resolves under
   `packages/landing/src/components/landing/`. The rule is a
   forward-looking regression guard; the path no longer exists
   after the change lands, so the rule has no hits in the
   current source tree.
3. A new permanent unit test under
   `tests/unit/landing-design-system-import-boundary.test.ts`
   that greps every `.tsx`, `.astro`, and `.ts` file in
   `packages/landing/src/**` for `from "@unveiled/design-system/`
   followed by a forbidden continuation, for
   `from "@nextui-org/"`, `from "@heroui/"`,
   `from "lucide-react"`, `from "@radix-ui/"`,
   `from "@headlessui/"`, `from "react-aria"`, `from "@mui/"`,
   `from "@chakra-ui/"`, and for any import whose path resolves
   under `packages/landing/src/components/landing/`.

#### Scenario: Landing imports flow through the public design-system barrel

- **WHEN** `tests/unit/landing-design-system-import-boundary.test.ts` greps `packages/landing/src/**/*.{ts,tsx,astro}` for `from "@unveiled/design-system/`
- **THEN** every match is followed by an allowed continuation (only the public barrel `@unveiled/design-system";` or `@unveiled/design-system/styles/global.css";` — both of which are reachable through the package's `exports` map)
- **AND** no match points at `@unveiled/design-system/lib/*`, `@unveiled/design-system/atoms/*`, `@unveiled/design-system/molecules/*`, `@unveiled/design-system/organisms/*`, `@unveiled/design-system/layouts/*`, `@unveiled/design-system/pages/*`, or `@unveiled/design-system/heroui-replica/*`.

#### Scenario: Landing has no third-party UI imports

- **WHEN** `tests/unit/landing-design-system-import-boundary.test.ts` greps `packages/landing/src/**/*.{ts,tsx,astro}` for `from "@nextui-org/"`, `from "@heroui/"`, `from "lucide-react"`, `from "@radix-ui/"`, `from "@headlessui/"`, `from "react-aria"`, `from "@mui/"`, `from "@chakra-ui/"`
- **THEN** zero hits are returned.

#### Scenario: Landing has no local landing/ component imports

- **WHEN** `tests/unit/landing-design-system-import-boundary.test.ts` greps `packages/landing/src/**/*.{ts,tsx,astro}` for any import whose resolved path is under `packages/landing/src/components/landing/`
- **THEN** zero hits are returned (the folder is deleted).

#### Scenario: Styling-ownership gate rejects re-introduced landing-local UI

- **WHEN** a contributor re-creates `packages/landing/src/components/landing/landing-header.tsx` (or any file under `packages/landing/src/components/landing/`) and a consumer imports from it
- **THEN** the `R-LANDING-NO-LOCAL-UI` rule in `packages/design-system/scripts/check-styling-ownership.ts` exits non-zero and names the offending file
- **AND** `bun run check:styling-ownership` exits non-zero as a result
- **AND** `bun run check` exits non-zero as a result.

#### Scenario: Styling-ownership check is part of bun run check

- **WHEN** a contributor runs `bun run check`
- **THEN** `bun run check:styling-ownership` runs as one of its steps and the `R-LANDING-NO-LOCAL-UI` rule is part of the script's checks
- **AND** if any forbidden landing-import pattern is present, `bun run check` exits non-zero.