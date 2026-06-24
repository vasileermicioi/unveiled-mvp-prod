## 1. Spec update

- [x] 1.1 Update the TextInput chrome scenario in the `exposes the production UI primitives` requirement to reference `unveiled-text-input-wrapper` and the `atom-chrome.css` rules (`border: 4px solid #202621 !important; border-style: solid !important; border-color: #202621 !important`).
- [x] 1.2 Update the `SelectInput and TextArea retain HeroUI bordered variant` scenario to clarify that TextArea's chrome comes from `unveiled-textarea-wrapper` (defined in `atom-chrome.css`), not from the `!border-*` utility classes.
- [x] 1.3 Update the `Every atom must be demoable in Ladle` requirement to document the `backdrop/` and `__overview__/` exemptions, the `// @atoms-re-export` opt-out marker, and the `EXCLUDED_ATOM_DIRS = ["__overview__", "backdrop"]` gate exception.
- [x] 1.4 Add the `atom-chrome.css is owned by the package` requirement with three scenarios: the CSS file is exported and re-imported, uses concrete values (not Tailwind utilities) with `!important` overrides, and applies when atoms render.
- [x] 1.5 Update the `is a Bun workspace package` requirement's `Package is discoverable as a workspace member` scenario to include `./styles/atom-chrome.css` in the documented exports map, and the `Package scripts exist and resolve` scenario to include `check:atomic-layers` in the documented scripts.

## 2. Validation and archive

- [x] 2.1 Run `openspec validate update-design-system-atoms-chrome` and confirm the delta is well-formed.
- [x] 2.2 Run `openspec archive update-design-system-atoms-chrome` to fold the delta into `openspec/specs/design-system-package/spec.md`.

## 3. Post-archive

- [x] 3.1 Confirm the archived change is in `openspec/changes/archive/` and the `design-system-package` spec is updated in place.
- [x] 3.2 Confirm `bun run --filter @unveiled/design-system check:atomic-layers`, `bun run --filter @unveiled/design-system test:unit`, `bun run ladle:coverage`, and `bun run check` still pass (the spec change is doc-only and MUST NOT change behaviour).
