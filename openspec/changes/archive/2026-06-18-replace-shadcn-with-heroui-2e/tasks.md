## 1. Rebuild unveiled-primitives on HeroUI

- [x] 1.1 Rewrite `src/components/ui/unveiled-primitives.tsx` so `Panel`, `Card`, `Badge`, `StatPanel`, `Field`, `TextInput`, `SelectInput`, `TextArea`, `Divider`, `StatePanel`, `TableShell`, and `TableRow` compose the corresponding HeroUI components (or thin HeroUI-styled wrappers where no direct HeroUI equivalent exists).
- [x] 1.2 Preserve the public `variant`, `tone`, `shadow`, `interactive`, and `state` props by translating them to HeroUI style props internally.
- [x] 1.3 Preserve the `data-testid` values and the proximity + layout selector contract used by the gherkin suite.
- [x] 1.4 Run `bun run check`, the matching Ladle stories, and the matching gherkin scenarios after each primitive lands.
