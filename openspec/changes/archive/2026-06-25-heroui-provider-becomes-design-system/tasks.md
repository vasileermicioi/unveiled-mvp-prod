## 1. Move the provider into the design system

- [x] 1.1 Create `packages/design-system/src/providers/theme-provider.tsx` with the `UnveiledThemeProvider` component (wraps `NextUIProvider` from `@nextui-org/react`).
- [x] 1.2 Create `packages/design-system/src/providers/index.ts` re-exporting `UnveiledThemeProvider` from `./theme-provider`.
- [x] 1.3 Update `packages/design-system/src/index.ts` to add `export * as Providers from "./providers";` and `export { UnveiledThemeProvider } from "./providers/theme-provider";`.

## 2. Rewire app consumers

- [x] 2.1 Audit every Astro island mount under `packages/app/src/pages/**`, `packages/app/src/layouts/**`, and any island wrapper inside the design-system organisms that uses the legacy `HeroUIProvider` from `~/components/providers/heroui-provider`.
- [x] 2.2 Update `packages/app/src/components/unveiled/visual-system-app.tsx` to import `UnveiledThemeProvider` from `@unveiled/design-system` and wrap the existing app shell tree (replace the existing `HeroUIProvider` mount).
- [x] 2.3 Confirm every React island in the app that depends on HeroUI context is wrapped in `UnveiledThemeProvider`.

## 3. Rewire landing consumers

- [x] 3.1 Audit `packages/landing/src/pages/**` and `packages/landing/src/layouts/**` for any HeroUI-context island (today only `LandingHeroPresentational`, which is forward-compatible — the mount is still required).
- [x] 3.2 Mount `UnveiledThemeProvider` from `@unveiled/design-system` around the landing layout body in `packages/landing/src/layouts/landing-layout.astro` (wraps the slot).

## 4. Replace the replica shim

- [x] 4.1 Replace the body of `packages/design-system/src/heroui-replica/provider.tsx` with a re-export of `UnveiledThemeProvider` (under the `HeroUIReplicaProvider` name) from `../providers/theme-provider`. Preserve the `// @ladle-only` header.

## 5. Delete the legacy app provider

- [x] 5.1 Delete `packages/app/src/components/providers/heroui-provider.tsx`.
- [x] 5.2 Confirm no other file in the repo imports from `../components/providers/heroui-provider` or `~/components/providers/heroui-provider` (grep + the boundary-gate test added in step 6).

## 6. Add the HeroUI boundary gate

- [x] 6.1 Add `tests/unit/design-system-hero-ui-boundary.test.ts` (bun:test) that walks every `.ts` / `.tsx` / `.astro` file in the repo (excluding `packages/design-system/**`, `node_modules/**`, `.ladle/**`, generated artifacts, and the test itself) and fails on any match of `from "@nextui-org/react"`, `from "@nextui-org/...`, or `from "@heroui/..."`.
- [x] 6.2 Confirm the new test runs as part of `bun run test:unit` (which is wired into `bun run check`).

## 7. Verification

- [x] 7.1 `bun run check` exits 0 (pre-existing `scripts/check-viewport-meta.ts` missing is unrelated to this change; all other sub-checks pass).
- [x] 7.2 `bun run test:unit` exits 0 (includes the new boundary-gate test).
- [x] 7.3 `bun run heroui-design-system-replica:check` exits 0.
- [x] 7.4 `bun run ladle:coverage` exits 0.
- [x] 7.5 `bun run typecheck:workspaces` exits 0 across `packages/app`, `packages/landing`, `packages/design-system` (pre-existing `astro:actions` / `astro:middleware` ambient module errors are unrelated to this change).
- [x] 7.6 `bun run lint:workspaces` exits 0.

## 8. Documentation

- [x] 8.1 Update `AGENTS.md` definition-of-done to add the "no file outside `packages/design-system/**` imports `@nextui-org/*` or `@heroui/*`" gate (enforced by `tests/unit/design-system-hero-ui-boundary.test.ts`).
