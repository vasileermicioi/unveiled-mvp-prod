## Context

The `design-system-atoms-layer` change (iteration 13, proposal 02) shipped with a spec that describes the TextInput's brand-chrome border using the `!border-4 !border-solid !!border-brand-dark` Tailwind v4 utility classes directly on the `inputWrapper` className, and that does not document the `backdrop/`, `__overview__/`, or `atom-chrome.css` artefacts that landed during the manual-test-fix iteration.

The visual result of the implementation is correct, but the spec is out of sync with the code. This change is a spec-only patch: no code, no tests, no docs. The contract is updated to reflect the actual implementation, and the new artefacts are documented so a future contributor can find them.

## Goals / Non-Goals

**Goals:**

- Update the TextInput border scenario in the `exposes the production UI primitives` requirement so the implementation contract matches the code.
- Document the `backdrop/`, `__overview__/`, `// @atoms-re-export`, and `EXCLUDED_ATOM_DIRS` exceptions in the `Every atom must be demoable in Ladle` requirement.
- Document the new `atom-chrome.css` file as the source of truth for atom visual chrome in a new requirement.
- Add `./styles/atom-chrome.css` to the package exports map documented in the `is a Bun workspace package` requirement.

**Non-Goals:**

- No code changes.
- No test changes.
- No doc changes (AGENTS.md, README.md).
- No design-token changes.
- No architecture (LikeC4) changes.

## Decisions

### D1 — Spec reflects actual implementation, not the other way around

The manual-test-fix iteration evolved the chrome mechanism from `!`-prefix Tailwind utility classes on the HeroUI slot to a hand-written `atom-chrome.css` file with explicit class names. The decision is to update the spec to match the implementation because:
- Reverting the implementation to match the spec would re-introduce the Vite tree-shaking bug that broke the user-facing Ladle stories.
- The implementation is the user-validated contract (the user has visually confirmed the chrome renders correctly).
- The spec change is a documentation update, not a behavior change.

### D2 — `atom-chrome.css` is documented as a new requirement, not a paragraph in the existing chrome description

The new requirement is a standalone block in the spec, not a sentence added to the TextInput scenario. This is because `atom-chrome.css` is a reusable CSS contract that any future atom (or any consumer that re-uses the chrome classes outside Ladle) will need. Codifying it as a requirement makes it discoverable when a contributor asks "what is `atom-chrome.css`?".

### D3 — Utility folder exemptions are listed explicitly

The `backdrop/` and `__overview__/` folders are not atoms but live under `atoms/` for layout reasons (they are shared utilities and the atoms overview story). Documenting the `EXCLUDED_ATOM_DIRS` exception in the spec ensures a future contributor who adds a third utility folder knows to add it to the gate's exclusion set AND to this spec.

## Risks / Trade-offs

- [Spec is more verbose] → The chrome section now spans multiple scenarios. Trade-off accepted: the implementation has more moving parts than the original spec assumed, and the spec should reflect that.
- [Spec describes an internal CSS file] → The `atom-chrome.css` file is a Vite/Ladle implementation detail, not a public contract. Codifying it in the spec ties the spec to a specific bundler. Trade-off accepted: the chrome is shipped via `package.json` `exports`, so it IS a public surface (consumers can import it). Documenting it in the spec gives the contract for the export.

## Migration Plan

No migration. This is a doc-only change. Run `openspec validate update-design-system-atoms-chrome` to confirm the spec delta is well-formed, then `openspec archive update-design-system-atoms-chrome` to fold the delta into `openspec/specs/design-system-package/spec.md`.

## Open Questions

None.
