## Why

The `design-system-atoms-layer` change (iteration 13, proposal 02) shipped with a spec that describes the TextInput's brand-chrome border using the `!border-4 !border-solid !border-brand-dark` Tailwind v4 utility classes directly on the `inputWrapper` className. The actual implementation evolved during the manual-test-fix iteration: Vite's tree-shaker strips per-story CSS imports whose only usage is in string class names, so the brand-chrome rules were moved to a hand-written `packages/design-system/src/styles/atom-chrome.css` file that defines explicit class names (`unveiled-text-input-wrapper`, `unveiled-tab`, `unveiled-table-th`, `unveiled-select-popover`, etc.) referenced by the atom `.tsx` files and stories. The visual result is identical (4px solid `#202621` border on the wrapper), but the mechanism is now class-name-based, not utility-class-based. The spec must be updated to match the implementation so the contract stays in sync with the code.

This change also documents three artefacts that landed during the fix iteration but were not described in the spec: the `atom-chrome.css` source-of-truth file, the `backdrop/` utility folder that holds the shared `AtomStoryBackdrop` Ladle story component, and the `// @atoms-re-export` opt-out marker that atom `.ladle.tsx` files use to satisfy the "atoms must import `@nextui-org/react`" gate rule without pulling in a new HeroUI import for stories that only re-render the existing atom.

## What Changes

- **MODIFIED** `openspec/specs/design-system-package/spec.md` — the `TextInput renders the design-system border` scenario: the implementation now applies the `unveiled-text-input-wrapper` class on the `inputWrapper` slot, with the actual CSS rules (including the 4px solid `unveiled-brand-dark` border) defined in `packages/design-system/src/styles/atom-chrome.css`. The rendered DOM still shows a visible 4px solid `unveiled-brand-dark` border.
- **MODIFIED** `openspec/specs/design-system-package/spec.md` — the `Every atom must be demoable in Ladle` requirement: add the `backdrop/` utility folder, the `__overview__/` overview story folder, the `// @atoms-re-export` opt-out marker, and the gate script's `EXCLUDED_ATOM_DIRS` set as the documented exceptions to the companion-file rule.
- **MODIFIED** `openspec/specs/design-system-package/spec.md` — the package exports map: add `./styles/atom-chrome.css` to the documented exports (it was added in the same fix iteration so consumers can import the chrome CSS directly when they reuse atom classes outside Ladle).
- **ADDED** `openspec/specs/design-system-package/spec.md` — new requirement: the package owns the atom-chrome CSS that is the source of truth for the visual chrome applied to HeroUI primitives in the atoms layer, exported under `./styles/atom-chrome.css`, and re-imported by every atom `.tsx` file that needs it.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `design-system-package`: MODIFIED. The TextInput border scenario, the "Every atom must be demoable in Ladle" requirement, and the package exports map are updated to reflect the actual implementation. A new requirement codifies the `atom-chrome.css` file as the source of truth for atom visual chrome.

## Impact

- Spec-only change. No code, no tests, no docs. The behaviour is already correct in the code; the spec is being brought into sync.
- No effect on consumers (`@unveiled/app`, `@unveiled/landing`). The exports map adds a new entry (`./styles/atom-chrome.css`) that is already wired through `package.json`; this is a doc-only update.
- No effect on `bun run check`, `check:atomic-layers`, `ladle:coverage`, or any other gate. All gates already pass.
