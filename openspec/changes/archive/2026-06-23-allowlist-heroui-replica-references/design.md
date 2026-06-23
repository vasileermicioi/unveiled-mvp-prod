## Context

`scripts/check-legacy-ui-references.ts` is the drift gate that runs as part of `bun run check` to ensure no tracked file reintroduces Mantine, shadcn, or a `*-replica/` folder reference. The gate scans `tests/`, `docs/`, `openspec/`, `AGENTS.md`, `CONTRIBUTING.md`, and `components.json`, and uses an `ALLOWED_PATH_FRAGMENTS` array to carve out known-legitimate exceptions.

Two canonical capability specs legitimately reference the `heroui-replica/` folder:

- `openspec/specs/design-system-package/spec.md` (the `### Requirement: @unveiled/design-system owns the Ladle-only HeroUI replica` block) describes the isolation boundary.
- `openspec/specs/heroui-ladle-design-system/spec.md` describes the entire replica lifecycle and isolation guarantee.

These specs MUST name the folder to be a faithful contract; without them in the allowlist the gate fires on every `bun run check`, making the gate a false positive that masks its own purpose.

## Goals / Non-Goals

**Goals:**

- Make `bun run check` green today by adding the two design-system spec folders to `ALLOWED_PATH_FRAGMENTS`.
- Keep the gate a **true** gate: it continues to fail on genuine `mantine`, `shadcn`, or `*-replica/` references outside the allowlist.
- Document the allowlist in the script's header comment so the next contributor understands why the entries exist.

**Non-Goals:**

- No new gates or rules. No new scan roots.
- No removal of any existing allowlist entry.
- No refactor of `scanFile`, `isAllowed`, or `collectFiles`.

## Decisions

- **Allowlist entry shape: directory prefix with trailing `/`.** The `isAllowed` helper matches `rel === fragment || rel.startsWith(fragment)`, so trailing `/` on a directory entry is required to avoid false positives on a same-named file. The existing convention is followed exactly.
- **Two entries, not one wildcard.** Adding `openspec/specs/` would silently allowlist every spec, defeating the gate. Two narrow entries keep the surface explicit and reviewable.
- **Header comment stays in sync with `ALLOWED_PATH_FRAGMENTS`.** The header comment is the human-readable contract; divergence between comment and code is a documentation bug. The header comment update happens in the same change as the array update.
- **No negation-cue tweak.** The existing `NEGATION_CUE_RE` already handles prose like "no references to Mantine". The allowlist entries handle the structural case (a path appearing in spec text). Both layers are kept.

## Risks / Trade-offs

- **Over-allowlisting.** A future contributor could add `openspec/specs/anything/` to the allowlist and silently disarm the gate. Mitigation: the change review must reject any allowlist entry that is not a spec textually describing `heroui-replica/` as part of the isolation contract. Any new entry MUST come with a one-line comment in the script explaining the legitimate reference.
- **Header-comment drift.** If a future contributor adds an entry to `ALLOWED_PATH_FRAGMENTS` without updating the header comment, the documentation becomes stale. Mitigation: the `### Requirement: header comment documents the allowlist` scenario in the spec makes this drift detectable manually; a future iteration can add a unit test that asserts the two stay in sync.

## Migration Plan

- Land the change as a single PR. No deploy ordering required — the gate runs at `bun run check` time, not at runtime.
- Rollback: revert the PR. The gate returns to its previous false-positive state, which is the documented pre-change behavior.

## Open Questions

- _None._ The two spec paths are the only known legitimate structural references to `heroui-replica/` outside the already-allowlisted `heroui-parity-and-docs/` change folder and the `archive/` tree.
