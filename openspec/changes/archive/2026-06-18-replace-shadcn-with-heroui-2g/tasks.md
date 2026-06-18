## 1. Walk every consumer of the old primitives

- [x] 1.1 Walk `src/components/unveiled/` and convert every import from `@/components/ui/button` and `@/components/ui/unveiled-primitives` to the new HeroUI-backed primitives.
- [x] 1.2 Walk `src/components/payments/` and do the same.
- [x] 1.3 Walk `src/components/providers/` and do the same.
- [x] 1.4 Walk `src/pages/` and `src/layouts/` and convert every remaining shadcn-specific import pattern.
- [x] 1.5 Resolve prop mismatches (`tone`, `shadow`, `interactive`, `state`) at the call site, mapping to the new style-prop surface.
- [x] 2.1 Run `rg "@/components/ui/(button|unveiled-primitives)" src/` and confirm every remaining hit is inside `src/components/ui/` itself.
- [x] 2.2 Run `bun run check`, `bun run test:e2e`, and `bun run test:ladle`. On any test failure, stop and report (do not silently rewrite gherkin scenarios or wrappers).
