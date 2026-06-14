## 1. Folder & Catalog

- [x] 1.1 Create `.development-plan/09-iteration/` directory
- [x] 1.2 Author `09-iteration/00-summary.md` with the per-feature folder format, the 10-item definition of done, the selector discipline, the storybook-is-per-feature rule, the out-of-scope list, the recommended work order, and a "Next step" section that links to both catalog files
- [x] 1.3 Author `09-iteration/01-review-existing-features.md` with one row per existing surface that needs an improvement spec, including `domain`, `surface`, `openspec-capability`, `current-state`, `issues`, `priority`, `expected-slug`, and `status` columns
- [x] 1.4 Author `09-iteration/02-remaining-features-to-prod.md` with one row per net-new feature, including `domain`, `feature`, `openspec-capability`, `rationale`, `priority` (P0 / P1 / P2), `expected-slug`, and `status` columns, plus a header explaining the priority tiers
- [x] 1.5 Create `09-iteration/discovered-during-10-iteration.md` as an empty placeholder appendix (header only)

## 2. Project Wire-Up

- [x] 2.1 Add a one-line pointer to `09-iteration/00-summary.md` under the "Iteration cycle" section in `AGENTS.md`
- [x] 2.2 Add a "Next iteration" section to `.development-plan/08-iteration/summary.md` pointing at `09-iteration/00-summary.md` and noting that 10-iteration is where the per-feature specs are authored
- [x] 2.3 Update `.development-plan/08-iteration/07-review-and-improve-existing-features.md` to point at the catalog (`09-iteration/01-review-existing-features.md`) instead of the old full spec
- [x] 2.4 Update `.development-plan/08-iteration/08-remaining-features-to-prod.md` to point at the catalog (`09-iteration/02-remaining-features-to-prod.md`) instead of the old full spec
- [x] 2.5 Update `.development-plan/08-iteration/09-gherkin-storybook-interaction-tests.md` to point at the "Storybook is per-feature" rule in `09-iteration/00-summary.md` (no separate storybook spec exists; storybook is per-feature in 10-iteration)

## 3. Spec

- [x] 3.1 Create `openspec/specs/iteration-09-catalog/spec.md` (new capability) with the catalog format, the three files in the folder, the rules for adding a row to either catalog, and the rule that no per-feature work happens in 09-iteration
- [x] 3.2 Add `## MODIFIED Requirements` to `openspec/specs/architecture-and-guidelines/spec.md` requiring `09-iteration/00-summary.md` to exist, be ≤ 200 lines, and be the entry point for 10-iteration
- [x] 3.3 Add `## MODIFIED Requirements` to `openspec/specs/gherkin-domain-features/spec.md` requiring every gherkin scenario that targets a component to carry a `@story(component=…, story=…)` tag, with the story authored per-feature in 10-iteration

## 4. Verification

- [x] 4.1 `.development-plan/09-iteration/00-summary.md` exists, is ≤ 200 lines, and links to both catalog files
- [x] 4.2 `.development-plan/09-iteration/01-review-existing-features.md` exists and has a row for every existing surface (run `bun scripts/check-catalog-coverage.ts` to auto-verify, when the script exists in 10-iteration)
- [x] 4.3 `.development-plan/09-iteration/02-remaining-features-to-prod.md` exists and every row has a non-empty `priority` and `expected-slug`
- [x] 4.4 Every cross-link from the 09-iteration docs resolves (scripted check: `bun scripts/check-internal-links.ts .development-plan/09-iteration/`, when the script exists in 10-iteration)
- [x] 4.5 `bun run check` still passes
- [x] 4.6 An agent can answer: "Where do I start a 10-iteration task?" — by reading `09-iteration/00-summary.md` and finding the per-feature folder format, the 10-item definition of done, the catalog links, and the work order
- [x] 4.7 `openspec validate add-09-iteration-catalog` passes (the new `iteration-09-catalog` capability and the two MODIFIED requirements parse without errors)
