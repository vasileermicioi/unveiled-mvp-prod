## 1. Extend the legacy-UI-references allowlist

- [x] 1.1 Add `openspec/specs/design-system-package/` to `ALLOWED_PATH_FRAGMENTS` in `scripts/check-legacy-ui-references.ts` (preserving the trailing `/` convention for directory entries).
- [x] 1.2 Add `openspec/specs/heroui-ladle-design-system/` to `ALLOWED_PATH_FRAGMENTS` in `scripts/check-legacy-ui-references.ts`.
- [x] 1.3 Add `openspec/changes/allowlist-heroui-replica-references/` to `ALLOWED_PATH_FRAGMENTS` so the change's own `proposal.md` / `design.md` / `specs/` text (which legitimately names `mantine`/`shadcn` to describe what the gate forbids) is not flagged. Update the header comment's `Allowed exceptions:` block to match.

## 2. Update the header comment

- [x] 2.1 Update the `Allowed exceptions:` block in the header comment of `scripts/check-legacy-ui-references.ts` to name `openspec/specs/design-system-package/` and `openspec/specs/heroui-ladle-design-system/` alongside the existing entries.

## 3. Verify

- [x] 3.1 Run `bun run scripts/check-legacy-ui-references.ts` and confirm the command exits 0 with `[legacy-ui-refs] OK — no mantine/shadcn/replica references in tracked files`.
- [x] 3.2 Run `openspec validate allowlist-heroui-replica-references` and confirm zero errors.
