## 1. Rebuild Button on HeroUI

- [x] 1.1 Rewrite `src/components/ui/button.tsx` to compose HeroUI's `Button` as the base element.
- [x] 1.2 Preserve the `variant` matrix (`default`, `primary`, `secondary`, `yellow`, `active`, `copied`, `destructive`, `ghost`, `outline`, `muted`, `link`) and the `size` matrix (`default`, `sm`, `lg`, `icon`, `icon-sm`).
- [x] 1.3 Preserve the `loading` and `asChild` props and the `data-testid` values used by the gherkin suite.
- [x] 1.4 Run `bun run check`, the matching Ladle story, and the matching gherkin scenario.
