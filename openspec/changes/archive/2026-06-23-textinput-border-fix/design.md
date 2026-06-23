## Context

`@unveiled/design-system` ships a `TextInput` primitive (`packages/design-system/src/unveiled-primitives.tsx`) built on HeroUI's `Input`. The design system contract (and the `design-tokens` spec at `design-tokens.json:258-272`) requires every `TextInput` consumer to render a 4px solid `unveiled-brand-dark` border. Manual review of the login form (`packages/app/src/components/unveiled/auth/LoginForm.tsx`) and the `LandingPage` (`packages/app/src/components/unveiled/visual-system-app.tsx`) showed the inputs rendering borderless — a regression introduced when HeroUI's `variant="bordered"` was replaced with `variant="flat"` to stop HeroUI's own border from fighting the override. That switch correctly removed the conflicting border but also removed the implicit `border-style: solid` that HeroUI was providing. The current `inputWrapper` className sets `border-width` and `border-color` but never sets `border-style`, so the browser falls back to `border-style: none` and renders no border at all.

## Goals / Non-Goals

**Goals:**

- Restore the visible 4px solid `unveiled-brand-dark` border on every consumer of `TextInput` without re-introducing HeroUI's conflicting border.
- Pin the `inputWrapper` className and the HeroUI variant in the design system spec so this regression cannot silently reappear.
- Add a manual visual check to the iteration's test plan so future form regressions surface during manual testing.

**Non-Goals:**

- No new primitive, no design token change, no HeroUI upgrade.
- No changes to `SelectInput`, `Textarea`, or any other primitive.
- No change to the focus styling (border color is intentionally constant across rest and focus states, matching the existing design system).

## Decisions

- **Use HeroUI `variant="flat"` and declare the border via Tailwind `!important` utilities.** `variant="flat"` gives us a clean canvas; the design-system border (`!border-4 !border-solid !border-brand-dark`) is the only border on the input. The `!important` declarations are required to defeat HeroUI's residual focus/hover styling.
- **Pin the className triple `!border-4 !border-solid !border-brand-dark` in the spec.** Width, style, and color are all required for the border to render. Pinning all three in `openspec/specs/design-system-package/spec.md` prevents a future contributor from omitting `!border-solid` again.
- **Leave `SelectInput` and `Textarea` on `variant="bordered"`.** Those primitives rely on HeroUI's native border; the focus/hover styling on them has not regressed. We only add inline rationale comments next to their `variant="bordered"` lines so future contributors don't propagate the flat/utility-border treatment where it does not belong.
- **Manual visual check, not a new automated test.** Visual regression of a single Tailwind className is cheaper to spot by eye against the existing login form than to express as a unit test. The check goes in `.development-plan/12-iteration/manual-test.md` and runs as part of the iteration's manual QA.

## Risks / Trade-offs

- [A future refactor drops `!border-solid` again] → The spec pins the className triple; review against `openspec/specs/design-system-package/spec.md` on any change to `unveiled-primitives.tsx`.
- [HeroUI `variant="flat"` has additional side effects beyond the border] → The existing overrides already handle background (`!bg-white`), focus ring (`focus-within:!ring-0`), and shadow (`!shadow-none`). No new side effect is introduced by adding `!border-solid`.
- [Other forms importing `TextInput` (signup, password recovery, admin) change appearance] → This is the intended behavior. All consumers are expected to render the design-system border; the manual test plan covers the login form explicitly and the visual treatment is consistent across the system.

## Migration Plan

No data migration, no deploy ordering. Rollout is a single package edit + a spec update + a test-plan update. If the change has to be reverted, revert the className edit and the spec delta together.

## Open Questions

_None — the fix is a single-className edit and the spec delta pins it._