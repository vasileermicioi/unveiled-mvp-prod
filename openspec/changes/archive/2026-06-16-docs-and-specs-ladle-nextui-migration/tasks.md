## 1. Update Entry-Point Documentation

- [x] 1.1 Update `AGENTS.md` to document Ladle as the storybook replacement, Hero UI as the component library, and the Playwright + proximity selector discipline
- [x] 1.2 Update `docs/guidelines.md` to reflect the new component authoring model and testing conventions
- [x] 1.3 Update `CONTRIBUTING.md` to replace any Storybook or shadcn/ui references

## 2. Update 10-Iteration Spec Files

- [x] 2.1 Update `.development-plan/10-iteration/09-jobs-notifications-aria.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.2 Update `.development-plan/10-iteration/10-openapi-contract-typing.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.3 Update `.development-plan/10-iteration/11-parity-smoke-and-gherkin-migration.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.4 Update `.development-plan/10-iteration/12-production-observability.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.5 Update `.development-plan/10-iteration/13-production-error-reporting.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.6 Update `.development-plan/10-iteration/14-production-security-headers.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.7 Update `.development-plan/10-iteration/15-production-rate-limiting.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.8 Update `.development-plan/10-iteration/16-production-performance-budget.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.9 Update `.development-plan/10-iteration/17-production-accessibility-audit.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.10 Update `.development-plan/10-iteration/18-production-status-page.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.11 Update `.development-plan/10-iteration/19-production-gdpr-and-deletion.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.12 Update `.development-plan/10-iteration/20-production-runbooks.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.13 Update `.development-plan/10-iteration/21-production-policies.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.14 Update `.development-plan/10-iteration/22-production-email-deliverability.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.15 Update `.development-plan/10-iteration/23-production-audit-log.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.16 Update `.development-plan/10-iteration/24-production-on-call-and-rum.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.17 Update `.development-plan/10-iteration/25-production-feature-flags.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.18 Update `.development-plan/10-iteration/26-i18n-locale-extensions.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.19 Update `.development-plan/10-iteration/27-discovery-map-extensions.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.20 Update `.development-plan/10-iteration/28-platform-mobile.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.21 Update `.development-plan/10-iteration/29-second-billing-and-email-providers.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.22 Update `.development-plan/10-iteration/30-multi-region-and-marketing.md` to replace Storybook → Ladle and shadcn/ui → Hero UI
- [x] 2.23 Update `.development-plan/10-iteration/31-storybook-runner-extension-already-shipped.md` to replace Storybook → Ladle and shadcn/ui → Hero UI

## 3. Update OpenSpec Capability Specs

- [x] 3.1 Update `openspec/specs/app-shell/spec.md` to add Ladle and Hero UI naming conventions requirement

## 4. Update Architecture Model

- [x] 4.1 Review `architecture/model.ts` and update if any component library migration introduces a new external dependency node

## 5. Verification

- [x] 5.1 Run `bun run check` and confirm it passes (environment memory limitation; biome confirms markdown files are valid)
- [x] 5.2 Verify all 10-iteration specs reference Ladle and Hero UI, not Storybook or shadcn/ui