## MODIFIED Requirements

### Requirement: `check-legacy-ui-references` allowlist covers legitimate spec references

The `check-legacy-ui-references` gate in `scripts/check-legacy-ui-references.ts` MUST allowlist the capability spec folders that legitimately describe the `heroui-replica/` folder (or the broader `mantine`/`shadcn`/`*-replica/` rule set) as the boundary for the design-system isolation guard: `openspec/specs/design-system-package/`, `openspec/specs/heroui-ladle-design-system/`, and `openspec/specs/monorepo-tooling/`. The gate MUST continue to fail on genuine `mantine`, `shadcn`, or other `*-replica/` references in every other tracked file.

#### Scenario: Legitimate spec references do not trip the gate

- **WHEN** `bun run scripts/check-legacy-ui-references.ts` is run
- **THEN** the command exits 0 and reports `[legacy-ui-refs] OK — no mantine/shadcn/replica references in tracked files`
- **AND** no false positive is reported for any line in `openspec/specs/design-system-package/spec.md`, `openspec/specs/heroui-ladle-design-system/spec.md`, or `openspec/specs/monorepo-tooling/spec.md` that names the `heroui-replica/` folder (or the `mantine`/`shadcn`/`*-replica/` rule set) to describe the isolation rule.

#### Scenario: Genuine Mantine or shadcn reference still fails the gate

- **WHEN** a tracked file outside the allowlist (`openspec/specs/design-system-package/`, `openspec/specs/heroui-ladle-design-system/`, `openspec/specs/monorepo-tooling/`, `openspec/specs/ui-system-heroui-parity/`, `openspec/changes/archive/`, `openspec/changes/heroui-parity-and-docs/`, `scripts/check-legacy-ui-references.ts`, `tests/unit/no-ladle-replica-in-production.test.ts`) contains the literal substring `mantine` or `shadcn` that is not negated by the `NEGATION_CUE_RE` guard
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
- **THEN** the `Allowed exceptions:` list names `openspec/specs/design-system-package/`, `openspec/specs/heroui-ladle-design-system/`, and `openspec/specs/monorepo-tooling/` alongside the existing allowlist entries.

## ADDED Requirements

### Requirement: Biome lint and config gate is green and schema-synced

The root `package.json` `scripts.check` gate MUST include `biome check .` and the command MUST exit 0 with zero errors and zero (or only documented baseline) warnings. The `biome.json` `$schema` field MUST match the installed Biome CLI version pinned in `package.json`. The `biome.json` file MUST NOT use the deprecated `linter.rules.recommended: true` field; it MUST use the modern `preset` syntax (or rely on the default recommended ruleset without the deprecated field).

#### Scenario: `biome check .` exits zero

- **WHEN** a contributor runs `bun run check` from the repo root
- **THEN** the `biome check .` sub-step exits 0
- **AND** the umbrella `bun run check` exits 0
- **AND** Biome reports zero errors.

#### Scenario: `biome.json` `$schema` matches the installed CLI version

- **WHEN** a contributor inspects `biome.json`
- **THEN** the `$schema` URL points at the same major.minor.patch as the Biome CLI version reported by `bunx biome --version`
- **AND** no `biome.json` schema-version warning is emitted by `bunx biome check .`.

#### Scenario: Deprecated `recommended` field is replaced

- **WHEN** a contributor reads `biome.json`
- **THEN** the deprecated `linter.rules.recommended: true` field is absent
- **AND** the file uses the modern `preset` syntax (for example `linter.rules.preset.recommended: true` or an equivalent Biome 2.5.0 idiom) OR relies on the default recommended ruleset without the deprecated field.

#### Scenario: Contributor workflow keeps the gate green

- **WHEN** a contributor makes a change that introduces auto-fixable formatting or import-sort drift
- **THEN** running `bun run format` resolves the drift
- **AND** running `bun run check` afterwards still exits 0.
