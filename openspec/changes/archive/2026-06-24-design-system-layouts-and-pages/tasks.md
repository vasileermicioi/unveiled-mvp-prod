## 1. AppLayout

- [x] 1.1 Create `packages/design-system/src/layouts/app-layout/app-layout.types.ts`
      with `AppLayoutProps` (props for `user`, `creditBalance`, `navItems`,
      `currentPath`, `pageHeader`, `pageBody`, `pageAside`).
- [x] 1.2 Implement `packages/design-system/src/layouts/app-layout/app-layout.tsx`
      that composes `AppShellPresentational` + `PageShell` per the design.
- [x] 1.3 Add `packages/design-system/src/layouts/app-layout/app-layout.mock.ts`
      exporting `makeMockAppLayoutProps(overrides?)` with the documented
      defaults (sample user, credit balance 12, four nav items,
      `currentPath: "/discover"`).
- [x] 1.4 Add `packages/design-system/src/layouts/app-layout/app-layout.ladle.tsx`
      with a `Default` story that renders the layout's bare frame
      (no organism inside the body) and a `WithMockBody` variant that
      uses the mock fixture.
- [x] 1.5 Re-export the layout from
      `packages/design-system/src/layouts/app-layout/index.ts` and from
      `packages/design-system/src/layouts/index.ts` (the `Layouts`
      namespace barrel).

## 2. LandingLayout

- [x] 2.1 Create `packages/design-system/src/layouts/landing-layout/landing-layout.types.ts`
      with `LandingLayoutProps` (props for `navItems`, `footerLinks`,
      `currentPath`, optional `hero`, `children`).
- [x] 2.2 Implement `packages/design-system/src/layouts/landing-layout/landing-layout.tsx`
      that composes `LandingHeaderPresentational` + optional
      `LandingHeroPresentational` + `<main>{children}</main>` +
      `LandingFooterPresentational` per the design.
- [x] 2.3 Add `packages/design-system/src/layouts/landing-layout/landing-layout.mock.ts`
      exporting `makeMockLandingLayoutProps(overrides?)` with the
      documented defaults (four nav items, three footer link groups,
      `currentPath: "/"`).
- [x] 2.4 Add `packages/design-system/src/layouts/landing-layout/landing-layout.ladle.tsx`
      with `Default` (bare frame) and `WithHero` (canonical hero
      composition) stories.
- [x] 2.5 Re-export the layout from
      `packages/design-system/src/layouts/landing-layout/index.ts` and
      from `packages/design-system/src/layouts/index.ts`.

## 3. Demo pages — auth

- [x] 3.1 Implement `packages/design-system/src/pages/auth/login.page.ladle.tsx`
      composing `AppLayout` + `LoginFormPresentational` with mock data.
- [x] 3.2 Implement `packages/design-system/src/pages/auth/signup.page.ladle.tsx`
      composing `AppLayout` + `SignupFormPresentational` with mock data.
- [x] 3.3 Implement `packages/design-system/src/pages/auth/password-recovery.page.ladle.tsx`
      composing `AppLayout` + `PasswordRecoveryFormPresentational` with
      mock data.

## 4. Demo pages — discovery, members, bookings

- [x] 4.1 Implement `packages/design-system/src/pages/discovery/discover.page.ladle.tsx`
      composing `AppLayout` + `PublicDiscoverPresentational` +
      `DiscoveryFilterPanelPresentational` + `DiscoveryMapPresentational`.
- [x] 4.2 Implement `packages/design-system/src/pages/members/member-feed.page.ladle.tsx`
      composing `AppLayout` + `MemberFeedPresentational`.
- [x] 4.3 Implement `packages/design-system/src/pages/bookings/booking-modal.page.ladle.tsx`
      composing `AppLayout` + `BookingModalPresentational`.

## 5. Demo pages — admin, partner

- [x] 5.1 Implement `packages/design-system/src/pages/admin/admin-panel.page.ladle.tsx`
      composing `AppLayout` + `AdminPanelPresentational`.
- [x] 5.2 Implement `packages/design-system/src/pages/partner/partner-portal.page.ladle.tsx`
      composing `AppLayout` + `PartnerPortalPresentational`.

## 6. Demo pages — payments

- [x] 6.1 Implement `packages/design-system/src/pages/payments/admin-freeze-unfreeze.page.ladle.tsx`
      composing `AppLayout` + `AdminFreezeUnfreezeFormPresentational`.
- [x] 6.2 Implement `packages/design-system/src/pages/payments/credit-ledger.page.ladle.tsx`
      composing `AppLayout` + `CreditLedgerTablePresentational`.
- [x] 6.3 Implement `packages/design-system/src/pages/payments/stripe-checkout.page.ladle.tsx`
      composing `AppLayout` + `StripeCheckoutRedirectButtonPresentational`.
- [x] 6.4 Implement `packages/design-system/src/pages/payments/subscription-portal.page.ladle.tsx`
      composing `AppLayout` + `SubscriptionPortalLinkPresentational`.

## 7. Demo pages — landing

- [x] 7.1 Implement `packages/design-system/src/pages/landing/landing.page.ladle.tsx`
      composing `LandingLayout` + `LandingHeroPresentational` +
      `LandingFooterPresentational` with mock data; set
      `viewport: { defaultViewport: "desktop" }` on the story.
- [x] 7.2 Verify every demo page story's `Default.parameters.layout`
      equals `"fullscreen"` (set the property explicitly on every
      story).

## 8. Barrel re-exports

- [x] 8.1 Update `packages/design-system/src/index.ts` to re-export
      the `Layouts` namespace from `./layouts` and the flat
      `AppLayout` / `LandingLayout` symbols.
- [x] 8.2 Confirm the pages folder is NOT re-exported from the runtime
      barrel (the pages folder is Ladle-only).

## 9. Gate — atomic layers

- [x] 9.1 Extend
      `packages/design-system/scripts/check-atomic-layers.ts` with
      `R-LAYOUTS-NO-PAGE-IMPORT` (no `./pages/...` imports under
      `layouts/`).
- [x] 9.2 Extend the same script with `R-LAYOUTS-NO-HEROUI` (no
      `@nextui-org/react` / `@heroui/*` imports under `layouts/`;
      already implied by the existing
      `checkHigherLayersDoNotImportHeroUI` walker; restated for
      clarity).
- [x] 9.3 Extend the same script with `R-PAGES-LADLE-ONLY` (every
      file under `pages/` ends in `.page.ladle.tsx`).
- [x] 9.4 Extend the same script with `R-PAGES-USE-MOCK` (every file
      under `pages/` imports at least one `*.mock` helper; the script
      greps for `from .*\.mock"` in each file).
- [x] 9.5 Confirm `bun run check:atomic-layers` exits 0 after the
      new rules are added.

## 10. Gate — permanent unit test

- [x] 10.1 Create `tests/unit/design-system-pages.test.ts` that walks
      `packages/design-system/src/pages/**`, asserts every `.tsx`
      file ends in `.page.ladle.tsx`, and asserts every file imports
      a path matching `.*\.mock"`.
- [x] 10.2 Confirm the test fails when a contributor adds a
      `pages/<name>.tsx` runtime file or a page that does not import
      a mock fixture.

## 11. Astro wrappers

- [x] 11.1 Update `packages/app/src/layouts/base-layout.astro` to
      import `AppLayout` from
      `@unveiled/design-system/layouts/app-layout` and wrap the
      existing `<slot />` with `<AppLayout ...>`.
- [x] 11.2 Update `packages/landing/src/layouts/landing-layout.astro`
      to import `LandingLayout` from
      `@unveiled/design-system/layouts/landing-layout` and wrap the
      existing `<slot />` with `<LandingLayout ...>`.
- [x] 11.3 Render every Astro page in `packages/app/src/pages/` and
      `packages/landing/src/pages/` with `bun run dev` and confirm
      the visible output is unchanged.

## 12. Verification

- [x] 12.1 Run `bun run check` (covers `astro check`, `biome check`,
      `specs:check`, `tokens:check`, `ladle:coverage`,
      `wrangler:check`, `arch:check`, and the updated
      `check:atomic-layers`).
- [x] 12.2 Run `bun run test:unit` and confirm the new
      `design-system-pages.test.ts` and the existing
      `no-ladle-replica-in-production.test.ts` both pass.
- [x] 12.3 Run `bun ladle` and confirm the `Layouts` and `Pages`
      groups list every new layout and every demo page.
- [x] 12.4 Run `bun run dev` and confirm every Astro page in
      `packages/app/src/pages/` and `packages/landing/src/pages/`
      renders unchanged.
- [x] 12.5 Run `bun run check:atomic-layers` directly and confirm
      the four new rules pass.

> Iteration-13 e2e obligations: gherkin parity per `design-system-e2e-tests-collect` (call sites are wired by the app-migration proposal; visual regression and dev/readyz smoke not required for the move itself).
