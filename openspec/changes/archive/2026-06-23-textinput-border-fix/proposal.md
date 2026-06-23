## Why

The `TextInput` design system primitive in `packages/design-system/src/unveiled-primitives.tsx` is rendered without a visible border on every form that consumes it (login, signup, etc.), even though the design system spec requires a 4px solid brand-dark border per `design-tokens.json:258-272`. The root cause is a Tailwind CSS gotcha: the `inputWrapper` className declares `!border-4 !border-brand-dark` but never sets `border-style`, which defaults to `none` — so width + color with no style renders as no border at all. The earlier switch to HeroUI's `variant="flat"` correctly stopped HeroUI's own border from fighting the override, but in doing so it also dropped the implicit `border-style: solid`. The fix is to add `!border-solid` to the `inputWrapper` so width, style, and color are all present and the design system border is the only visible border.

## What Changes

- Update `packages/design-system/src/unveiled-primitives.tsx:193` so the `TextInput`'s `inputWrapper` className is `!min-h-12 !h-12 !bg-white !border-4 !border-solid !border-brand-dark !rounded-none !px-4 !py-3 focus-within:!ring-0 focus-within:!ring-offset-0 focus-within:!shadow-none data-[focus=true]:!border-brand-dark data-[focus-visible=true]:!outline-none`. All three of `!border-4`, `!border-solid`, `!border-brand-dark` are required for the border to render.
- Verify `SelectInput` and `Textarea` in the same file are not affected; they continue to use `variant="bordered"` (HeroUI renders its own border on those).
- Update `openspec/specs/design-system-package/spec.md` with a `## MODIFIED Requirements` block that pins the `inputWrapper` classes and the HeroUI variant.
- Add a manual visual check to `.development-plan/12-iteration/manual-test.md` for the login form input border.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `design-system-package`: the `TextInput` primitive's `inputWrapper` SHALL include `!border-4 !border-solid !border-brand-dark` (width, style, and color — all three required) and SHALL use HeroUI `variant="flat"`. The visible 4px solid brand-dark border per `design-tokens.json:258-272` SHALL render on every consumer of `TextInput`.

## Impact

- **Modified code:**
  - `packages/design-system/src/unveiled-primitives.tsx:193` — add `!border-solid` to the `TextInput` `inputWrapper` className. Confirm `SelectInput`/`Textarea` retain `variant="bordered"`.
- **Modified specs:**
  - `openspec/specs/design-system-package/spec.md` — `## MODIFIED Requirements` block for the `TextInput` primitive.
- **Modified docs:**
  - `.development-plan/12-iteration/manual-test.md` — add a manual visual check that the login form inputs render a visible 4px solid black border.
- **Dependencies changed:** _none._
- **Visual consumers affected:** every form that imports `TextInput` from `@unveiled/design-system` (login form, any future signup / password-recovery / admin forms). They will now render the design-system border consistently — this is the intended behavior.
- **Risks:** HeroUI `variant="flat"` removes HeroUI's default focus ring; the existing `focus-within:!ring-0` override and the `data-[focus=true]:!border-brand-dark` styling already accommodate that. Border color is unchanged on focus (always brand-dark), so there is no visible focus-state regression.