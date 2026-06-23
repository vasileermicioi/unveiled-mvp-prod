## Why

The `bun run check` script includes a `check-legacy-ui-references` gate (`scripts/check-legacy-ui-references.ts`) that scans tracked files for references to `mantine`, `shadcn`, or a `*-replica/` folder. The gate is meant to catch any future contributor who reintroduces a Mantine/shadcn import or a Ladle-only replica folder. Two capability specs in `openspec/specs/` (`design-system-package/spec.md` and `heroui-ladle-design-system/spec.md`) legitimately describe the `heroui-replica/` folder as the boundary for the design-system isolation guard, so without an allowlist the gate fires a false positive on every `bun run check`. This change adds the legitimate spec paths to the allowlist so the gate is a **true** gate: it fails on genuine Mantine/shadcn/legacy-replica references but does not produce false positives for spec text that names `heroui-replica/` to describe the isolation rule.

## What Changes

- Extend the `ALLOWED_PATH_FRAGMENTS` array in `scripts/check-legacy-ui-references.ts` to include `openspec/specs/design-system-package/` and `openspec/specs/heroui-ladle-design-system/` so the canonical design-system specs are not flagged for naming the `heroui-replica/` folder.
- Update the script's header comment so the documented allowlist stays in sync with the implementation.
- Re-run `bun run check-legacy-ui-references` and assert zero violations.

## Capabilities

### New Capabilities

_None._ This change is a tooling refinement; it introduces no new user-visible behavior.

### Modified Capabilities

- `monorepo-tooling`: the `check-legacy-ui-references` gate is a true gate — it fails on genuine Mantine/shadcn/legacy-replica references but does not produce false positives for the legitimate spec references in `openspec/specs/design-system-package/` and `openspec/specs/heroui-ladle-design-system/`.

## Impact

- **New files:** _none._
- **Modified files:**
  - `scripts/check-legacy-ui-references.ts` — extend `ALLOWED_PATH_FRAGMENTS` to include `openspec/specs/design-system-package/` and `openspec/specs/heroui-ladle-design-system/`; update the header comment to document the allowlist.
- **Removed files:** _none._
- **Dependencies changed:** _none._
- **Risks:**
  - **Over-allowlisting.** Adding too many paths to the allowlist defeats the purpose of the gate. Mitigation: the allowlist is restricted to the two design-system capability spec folders and the existing entries (`scripts/check-legacy-ui-references.ts`, `tests/unit/no-ladle-replica-in-production.test.ts`, `openspec/changes/archive/`, `openspec/changes/heroui-parity-and-docs/`, `openspec/specs/heroui-ladle-design-system/`, `openspec/specs/ui-system-heroui-parity/`, `openspec/specs/design-system-package/`). Any new spec that legitimately references `heroui-replica/` must be added explicitly with a comment explaining why.
