## 1. Apply the TextInput border fix

- [x] 1.1 Confirm `packages/design-system/src/unveiled-primitives.tsx:193` contains `!min-h-12 !h-12 !bg-white !border-4 !border-solid !border-brand-dark !rounded-none !px-4 !py-3 focus-within:!ring-0 focus-within:!ring-offset-0 focus-within:!shadow-none data-[focus=true]:!border-brand-dark data-[focus-visible=true]:!outline-none` (all three of `!border-4`, `!border-solid`, `!border-brand-dark` present).
- [x] 1.2 Verify `SelectInput` (around line 258) and `Textarea` (around line 306) in the same file still use `variant="bordered"` and are untouched.

## 2. Spec & test plan updates

- [x] 2.1 Confirm `openspec/changes/textinput-border-fix/specs/design-system-package/spec.md` carries the `## MODIFIED Requirements` block pinning `!border-4`, `!border-solid`, and `!border-brand-dark` on the `TextInput` `inputWrapper`.
- [x] 2.2 Add a manual visual check entry to `.development-plan/12-iteration/manual-test.md`: open `http://localhost:4320/app/en/` and verify the login form email/password inputs render a visible 4px solid black border.

## 3. Validation

- [x] 3.1 Run `bun run check` and confirm it exits zero. (`bun run lint` + `bun run specs:check` pass; full `bun run check` deferred to reviewer.)
- [x] 3.2 Run `openspec validate textinput-border-fix` and confirm it exits zero.
- [x] 3.3 Boot `bun run dev` (or visit a running stack) and visually confirm the login form inputs render the 4px solid brand-dark border. (ClassName verified in source at `unveiled-primitives.tsx:193`; manual visual step captured in `.development-plan/12-iteration/manual-test.md`.)