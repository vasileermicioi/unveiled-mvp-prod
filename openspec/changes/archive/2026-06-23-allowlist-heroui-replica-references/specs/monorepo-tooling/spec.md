## ADDED Requirements

### Requirement: `check-legacy-ui-references` allowlist covers legitimate spec references

The `check-legacy-ui-references` gate in `scripts/check-legacy-ui-references.ts` MUST allowlist the two capability spec folders that legitimately describe the `heroui-replica/` folder as the boundary for the design-system isolation guard: `openspec/specs/design-system-package/` and `openspec/specs/heroui-ladle-design-system/`. The gate MUST continue to fail on genuine `mantine`, `shadcn`, or other `*-replica/` references in every other tracked file.

#### Scenario: Legitimate spec references do not trip the gate

- **WHEN** `bun run scripts/check-legacy-ui-references.ts` is run
- **THEN** the command exits 0 and reports `[legacy-ui-refs] OK — no mantine/shadcn/replica references in tracked files`
- **AND** no false positive is reported for any line in `openspec/specs/design-system-package/spec.md` or `openspec/specs/heroui-ladle-design-system/spec.md` that names the `heroui-replica/` folder to describe the isolation rule.

#### Scenario: Genuine Mantine or shadcn reference still fails the gate

- **WHEN** a tracked file outside the allowlist (`openspec/specs/design-system-package/`, `openspec/specs/heroui-ladle-design-system/`, `openspec/specs/ui-system-heroui-parity/`, `openspec/changes/archive/`, `openspec/changes/heroui-parity-and-docs/`, `scripts/check-legacy-ui-references.ts`, `tests/unit/no-ladle-replica-in-production.test.ts`) contains the literal substring `mantine` or `shadcn` that is not negated by the `NEGATION_CUE_RE` guard
- **THEN** the command exits 1 and names the offending file and line.

#### Scenario: Genuine `*-replica/` reference still fails the gate

- **WHEN** a tracked file outside the allowlist contains a path matching `\/[^"'`\s]*-replica\/` that is not negated by the `NEGATION_CUE_RE` guard
- **THEN** the command exits 1 and names the offending file and line.

#### Scenario: Allowlist data structure is a list of fragments

- **WHEN** a contributor reads `scripts/check-legacy-ui-references.ts`
- **THEN** the `ALLOWED_PATH_FRAGMENTS` constant is a single `string[]` array
- **AND** the `isAllowed` helper walks the array with a `for...of` loop
- **AND** every entry is a repo-relative path or path prefix that ends with `/` for directories.

#### Scenario: Header comment documents the allowlist

- **WHEN** a contributor reads the header comment at the top of `scripts/check-legacy-ui-references.ts`
- **THEN** the `Allowed exceptions:` list names `openspec/specs/design-system-package/` and `openspec/specs/heroui-ladle-design-system/` alongside the existing allowlist entries.
