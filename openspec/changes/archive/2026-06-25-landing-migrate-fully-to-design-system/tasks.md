## 1. Design-system organism (LandingTemplate)

- [x] 1.1 Create `packages/design-system/src/organisms/landing/landing-template/landing-template.tsx` with a `LandingTemplate` React organism that composes `LandingHeaderPresentational`, an optional `LandingHeroPresentational` (when `hero === true`), an optional body (`children`), and `LandingFooterPresentational`. The prop surface MUST be `{ authenticated?: boolean; hero?: boolean; children?: ReactNode }` — no `navItems`, `footerLinks`, `heroCopy`, or `currentPath` props are introduced by this change.
- [x] 1.2 Create `packages/design-system/src/organisms/landing/landing-template/index.ts` that re-exports `LandingTemplate` and the `LandingTemplateProps` type.
- [x] 1.3 Add `LandingTemplate` (and `LandingTemplateProps`) to the `packages/design-system/src/index.ts` barrel and to the `Organisms` namespace export.
- [x] 1.4 Add a Ladle story under `packages/design-system/src/organisms/landing/landing-template/landing-template.ladle.tsx` that mounts `LandingTemplate` with mock children. Mark the story `ladle: { skipCoverage: true }` if the existing landing Ladle page already covers it.

## 2. Layout and page rewiring

- [x] 2.1 Replace `packages/landing/src/layouts/landing-layout.astro` body with a single `<LandingTemplate client:load authenticated={authenticated} hero>` mount. The layout still owns the HTML document (`<html>`, `<head>`, meta tags, the `@unveiled/design-system/styles/global.css` import). It imports `LandingTemplate` from `@unveiled/design-system` (the public barrel) and computes `authenticated` via the existing `~/lib/session-presence.ts` helper.
- [x] 2.2 Replace `packages/landing/src/pages/index.astro` body with a single `<LandingHeroPresentational client:load authenticated={authenticated} />` mount per `design.md` (Decision 1 and Decision 3). The page no longer imports the header, footer, or layout directly.

## 3. Deletion

- [x] 3.1 Delete `packages/landing/src/components/landing/landing-header.tsx`, `landing-hero.tsx`, `landing-footer.tsx`.
- [x] 3.2 Delete the now-empty `packages/landing/src/components/landing/` directory.
- [x] 3.3 Confirm `packages/landing/src/pages/index.astro` and `packages/landing/src/layouts/landing-layout.astro` import directly from `@unveiled/design-system` (no remaining `~/components/landing/...` import paths).

## 4. Gate and permanent unit test

- [x] 4.1 Add the `R-LANDING-NO-LOCAL-UI` rule to `packages/design-system/scripts/check-styling-ownership.ts`: walk every `.tsx`, `.ts`, and `.astro` file under `packages/landing/src/**`, parse the imports, and fail if any resolved path lives under `packages/landing/src/components/landing/`. Wire the rule into the umbrella `bun run check:styling-ownership` script.
- [x] 4.2 Add `tests/unit/landing-design-system-import-boundary.test.ts`: grep every `.tsx`, `.astro`, and `.ts` file in `packages/landing/src/**` for forbidden deep imports (`@unveiled/design-system/<layer>/...`, `@unveiled/design-system/lib/...`, `@unveiled/design-system/heroui-replica/...`) and forbidden third-party UI imports (`@nextui-org/`, `@heroui/`, `lucide-react`, `@radix-ui/`, `@headlessui/`, `react-aria`, `@mui/`, `@chakra-ui/`); fail if any match is found. Wire the test into `bun run test:unit` via the existing unit-test runner.

## 5. Verification

- [x] 5.1 `bun run --filter @unveiled/landing typecheck` exits 0.
- [x] 5.2 `bun run check` exits 0 (especially `astro check` in the landing package, `biome check .`, and `bun run check:styling-ownership` with the new `R-LANDING-NO-LOCAL-UI` rule).
- [x] 5.3 `bun run test:unit` passes, including the new `landing-design-system-import-boundary.test.ts` and the existing `no-ladle-replica-in-production.test.ts` (the latter still passes because the landing has no other UI import sites).
- [x] 5.4 `bun run check:styling-ownership` exits 0 (regression guard green; no landing-local UI imports remain).
- [x] 5.5 `bun run ladle:coverage` exits 0; the Ladle landing page (`packages/design-system/src/pages/landing/landing.page.ladle.tsx`) and the new `landing-template.ladle.tsx` story both render without coverage drift.

> Iteration-13 e2e obligations: gherkin parity, visual regression, and dev/readyz smoke per `design-system-e2e-tests-collect` (the landing Astro wrapper is a non-functional change).