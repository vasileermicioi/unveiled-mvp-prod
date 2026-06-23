## Context

The `routing-orchestrator` change shipped the landing page hero section in `packages/app/src/components/unveiled/visual-system-app.tsx:167-178` with two CTAs that were visually inconsistent. Manual testing (`opencode-error-prompt.txt`) flagged that "EXPLORE ACCESS" rendered with the default black-filled variant while "HOW IT WORKS" rendered with `variant="secondary"`, and the two buttons were not at the same size. The user feedback explicitly asked for both CTAs to share styling and for both to carry the `<ArrowRight />` icon.

The design-system Button primitive (`packages/design-system/src/button.tsx`) is the source of truth for the visual variants. The `secondary` variant (`bg-white text-brand-dark` with a `border-brand-dark` and the brand-yellow hover) is already the variant used by the app-shell nav buttons in `packages/app/src/components/unveiled/app-shell.tsx:300-308`, so reusing it for the hero CTAs keeps the page chrome consistent. The `size="lg"` dimension (`min-h-14 px-7 py-4 text-xs`) is the largest size offered by the primitive and is the size used by the hero CTAs in the legacy reference. The `<ArrowRight />` icon (lucide-react) is already imported and used as a trailing glyph on the existing buttons.

This is a cosmetic, single-file change. It does not touch routing, data access, schema, billing, or auth. It does not add a new dependency. The only durable artifact is the parity spec on `app-shell` and a gherkin/ladle feature spec.

## Goals / Non-Goals

**Goals:**
- Make the two hero CTAs visually consistent: same variant (`secondary`), same size (`lg`), same icon (`<ArrowRight />`).
- Reuse the production design-system Button primitive as-is — no new variants, no new sizes, no inline overrides.
- Codify the styling contract in the `app-shell` capability spec so future regressions are caught by `openspec validate` and the gherkin parity suite.
- Ship a gherkin feature under `tests/features/shell/heroes/` with a Ladle harness so the parity test can run via `bun run test:e2e` and the Ladle harness can be inspected via `bun run test:ladle`.

**Non-Goals:**
- No new Button variant, no new Button size, no new design-system primitive.
- No change to the Button API or to the `secondary`/`lg` class combination.
- No change to the `<a href>` targets, no change to the route surface, no change to the language toggle or any other shell surface.
- No new dependency, no `package.json` bump, no token regeneration, no TypeSpec change, no migration.
- No change to the legacy `_old_app/` reference (it is read-only).

## Decisions

- **Use the existing `secondary` variant + `lg` size instead of a new variant.** The design system already exposes the exact visual treatment that matches the legacy hero CTAs and the app-shell nav buttons. Adding a new `hero` variant would duplicate `secondary`, bloat the cva matrix, and drift from the rest of the shell. Alternatives considered: (a) introduce a `hero` variant — rejected, duplicates `secondary`; (b) inline arbitrary classes on the existing `<Button>` — rejected, bypasses the design-system primitive and breaks `bun run tokens:check` parity.
- **Use the existing `Button asChild` slot instead of a raw `<a>`.** The hero CTA pair renders an `<a>` inside the `<Button>` via `asChild`, matching the nav buttons (`app-shell.tsx:300-308`) and every other CTA on the page. Switching to a raw `<a>` would lose the `data-slot="button"` selector hook, the focus ring, and the design-system hover treatment.
- **Add `<ArrowRight />` to both buttons instead of replacing one icon.** The icon signals forward navigation. Re-using the same icon on both keeps the pair visually consistent. The icon is already imported from `lucide-react` (`ArrowRight, Check`) and is consumed by the Button through the `[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4` rule in the base class, so no per-button size override is needed.
- **Codify the contract as an ADDED Requirement on `app-shell` (not a MODIFIED of an existing requirement).** No existing `app-shell` requirement changes its behavior — only a new sibling requirement is added declaring the hero CTA pair's variant/icon/size contract. This keeps the diff small and avoids rewriting scenarios that other feature specs reference.
- **Place the gherkin feature under `tests/features/shell/heroes/` (a new per-feature folder).** `AGENTS.md` §2 specifies the `tests/features/<domain>/<surface>/{feature.feature, <component>.ladle.tsx}` layout. The hero CTA pair is a `shell/heroes` surface, so the new folder follows the convention. The Ladle harness renders the same `<Button asChild variant="secondary" size="lg">` pair so the gherkin scenarios can lock visual parity.

## Risks / Trade-offs

- [Risk] The gherkin feature reads `data-slot="button"` and asserts on a substring of the class attribute, which is brittle to Tailwind class reordering. → Mitigation: limit the assertion to substring containment (`bg-white text-brand-dark border-brand-dark min-h-14 px-7 py-4 text-xs` must all be present) rather than asserting exact class equality; this matches the dev plan's `curl | grep` smoke check.
- [Risk] The dev plan's `routing-orchestrator` change may have left an intermediate state in `visual-system-app.tsx` where one CTA is already `secondary lg` and the other is not. → Mitigation: the implementation task reads the current file at `packages/app/src/components/unveiled/visual-system-app.tsx:167-178` first and edits both buttons to the canonical `secondary lg + <ArrowRight />` shape, regardless of the starting state. No data loss possible — the edit is bounded to 12 lines.
- [Risk] Adding a new requirement to `app-shell` increases the spec's surface area. → Mitigation: the new requirement is scoped to the hero CTA pair only (one variant + one icon + one size) and references the design-system Button primitive by name, so it does not duplicate the design-system spec.
- [Trade-off] Cosmetic-only change → low blast radius but also low-value signal for the changelog. Acceptable because the dev plan explicitly tracks this as a discrete iteration item (`.development-plan/12-iteration/18-hero-cta-styling.md`) and the parity spec is durable evidence.
