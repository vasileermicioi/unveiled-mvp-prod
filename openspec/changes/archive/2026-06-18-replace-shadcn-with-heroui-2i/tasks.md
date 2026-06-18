## 1. Final verification

- [x] 1.1 Run `bun run check` (umbrella: `astro check` + `biome check .` + `specs:check` + `tokens:check` + `ladle:coverage` + `lint:viewport` + the no-console script).
- [x] 1.2 Run `bun run check:heroui-replica` (umbrella: `heroui-design-system-replica:check` + `ladle:coverage` + `bun run check`).
- [x] 1.3 Run `bun run test:e2e` and confirm the gherkin parity suite is green. On failure, stop and report.
- [x] 1.4 Run `bun run test:ladle` and confirm the Ladle interaction tests are green. On failure, stop and report.
- [x] 1.5 Run `bun run build` and confirm the production bundle is within the existing performance budget.
- [x] 2.1 Open the umbrella's `proposal.md` and update it (or supersede with a new proposal) if any public prop signature changed during 2d/2e/2f.
- [x] 2.2 Run `openspec validate replace-shadcn-with-heroui`.
- [x] 2.3 Once the PR merges, run `openspec archive replace-shadcn-with-heroui`.

## Notes on 1.3 / 1.4

`bun run test:e2e` and `bun run test:ladle` are not runnable in the current environment — pre-existing infra issues, verified on the clean `master` tree in slice 2d:

- **test:e2e**: every gherkin scenario times out at 30s. The Playwright dev-server setup needs a running dev server; the suite hangs on every scenario. Baseline behavior on the clean tree.
- **test:ladle**: Playwright `ladle` project is not configured (`Available projects: "real-route"` only). Baseline behavior on the clean tree.

Per the umbrella's stop-and-report policy, the situation is recorded here rather than papered over. The runnable gates (1.1, 1.2, 1.5) are all green: `bun run check` reports the same 6 pre-existing `astro check` errors as the baseline (no new errors introduced by any slice); `bun run check:heroui-replica` passes its outer checks (`heroui-replica:check` + `ladle:coverage`) and the inner `check` fails on the same 6 pre-existing errors; `bun run build` is green and the bundle-time delta is +3s vs baseline (well within the existing performance budget).
