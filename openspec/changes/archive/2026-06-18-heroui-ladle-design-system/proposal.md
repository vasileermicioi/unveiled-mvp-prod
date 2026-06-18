## Why

The codebase currently maintains a Mantine 9-based Ladle-only design-system replica under `src/components/ui/mantine-replica/` so the team can review look-and-feel in isolation. The product decision is to move the design system to HeroUI, so we need an equivalent HeroUI replica that renders every production primitive in Ladle without touching the production app.

## What Changes

- Delete `src/components/ui/mantine-replica/` and remove `@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, and the Mantine replica check scripts from `package.json`.
- Add HeroUI React 19-compatible packages as `devDependencies` for Ladle-only use.
- Create `src/components/ui/heroui-replica/` with a HeroUI theme wired to `design-tokens.json`, a provider, a `Hero<Name>.tsx` wrapper and matching `Hero<Name>.ladle.tsx` story for every production primitive, a design-system overview page, and an import-graph test that proves the replica is unreachable from production.
- Add `heroui-design-system-replica:check` and `check:heroui-replica` scripts to enforce co-location, theme coverage, Ladle coverage, and `bun run check`.

## Capabilities

### New Capabilities

- `heroui-ladle-design-system`: a brand-faithful HeroUI rendering of every primitive in `src/components/ui/`, viewable in Ladle and not imported by the production app. Enforces Ladle-only isolation, brand-token-driven theming, look-and-feel parity with the current shadcn surfaces, and the design-system overview as the Ladle landing page.

### Modified Capabilities

- `design-system-replica`: retired. The Mantine replica is removed and superseded by the HeroUI replica.

## Impact

- **New files:** `src/components/ui/heroui-replica/theme.ts`, `provider.tsx`, `Hero<Name>.tsx`, `Hero<Name>.ladle.tsx`, `design-system-overview.ladle.tsx`, `replica-not-imported.test.ts`, plus the OpenSpec change artifacts.
- **Modified files:** `package.json` — swaps Mantine dev dependencies for HeroUI dev dependencies and swaps the replica check scripts.
- **Removed files:** `src/components/ui/mantine-replica/` and `scripts/check-design-system-replica.ts` if it only validated the Mantine replica.
- **Dependencies:** `@mantine/core`, `@mantine/hooks`, `@mantine/notifications` removed from `devDependencies`; HeroUI packages added under `devDependencies` at React 19-compatible versions.
- **Risks:** HeroUI React 19 support is still maturing; mitigation is to pin a verified release, keep HeroUI in `devDependencies`, and gate the replica on `bun run check` and `bun run test:ladle`. Accidental production import is mitigated by `// @ladle-only` headers, the import-graph test, and the new check script.
