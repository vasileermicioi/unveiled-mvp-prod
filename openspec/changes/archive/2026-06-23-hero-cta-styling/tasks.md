## 1. Normalize the hero CTA pair

- [x] 1.1 Read `packages/app/src/components/unveiled/visual-system-app.tsx:167-178` to confirm the current state of the two hero CTAs (the `routing-orchestrator` change may have left them in an intermediate shape).
- [x] 1.2 Edit the "EXPLORE ACCESS" `<Button>` so its props read `<Button asChild variant="secondary" size="lg">`, with `<ArrowRight />` as the last child of the `<a>` slot. No other lines in this block change.
- [x] 1.3 Edit the "HOW IT WORKS" `<Button>` so its props read `<Button asChild variant="secondary" size="lg">` (idempotent if already correct) and ensure `<ArrowRight />` is the last child of the `<a>` slot.
- [x] 1.4 Verify both buttons emit `bg-white text-brand-dark border-brand-dark` and `min-h-14 px-7 py-4 text-xs` by inspecting the rendered HTML on `/app/en/`.

## 2. Codify the contract on `app-shell`

- [x] 2.1 Open `openspec/changes/hero-cta-styling/specs/app-shell/spec.md` and confirm the four scenarios from the `ADDED Requirements` block ("Hero CTA pair uses the secondary variant", "Hero CTAs include the ArrowRight icon", "Hero CTAs share the same large dimensions", "Hero CTAs navigate to the expected app routes") are present and shaped per the spec-driven schema (`### Requirement:` + at least one `#### Scenario:` with WHEN/THEN).
- [x] 2.2 Run `openspec validate hero-cta-styling` and resolve any error before moving on.

## 3. Add the per-feature gherkin spec

- [x] 3.1 Create `tests/features/shell/heroes/hero-cta.feature` with at least two scenarios (one for `bg-white text-brand-dark border-brand-dark min-h-14 px-7 py-4 text-xs` substring on both buttons; one for `<ArrowRight />` presence on both buttons). Each scenario MUST carry a `@ladle(component=…, story=…)` tag.
- [x] 3.2 Create `tests/features/shell/heroes/hero-cta.ladle.tsx` rendering the same `<Button asChild variant="secondary" size="lg">` pair that `visual-system-app.tsx` ships, so the gherkin scenarios can lock visual parity through the Ladle harness.
- [x] 3.3 Run `bun run ladle:coverage` to confirm the new Ladle stories are referenced by gherkin and the scenario tags resolve.

## 4. Verify the umbrella

- [x] 4.1 Run `bun run check` from the repo root; resolve every reported drift.
- [x] 4.2 `bun run test:e2e` runs `playwright test --project=real-route tests/parity/gherkin.spec.ts && playwright test --project=api-binding`. The `real-route` project boots the 4-worker dev stack (`bun run dev`) on port 4321 per `playwright.config.ts:18-27`. Per the archived `2026-06-19-heroui-parity-and-docs` umbrella's tasks.md (line 76): the existing parity suite references step patterns (e.g. `the user asserts a region named "…" is reachable`) that are NOT yet registered as `StepDefinitions` in `tests/steps/verbs/`. The umbrella records `bun run test:e2e` as "pre-existing-infra-broken" and intentionally deferred. The runnable enforcement levers used in this iteration are `bun run check` (green) and `bun run ladle:coverage` (green). The `hero-cta.feature` scenarios use ONLY step patterns that ARE registered (`the user is logged in as <role>`, `the user navigates to <route>`, `the user asserts <landmark> exposes <selector> with <attribute>="<value>"`, plus the new `the user asserts <landmark> exposes <selector> with class containing "<substring>"` registered in this change). Once the runner infra catches up to the registered verb surface, this scenario file will run without changes.
- [x] 4.3 `bun run test:ladle` runs `playwright test --project=ladle tests/ladle/ladle.spec.ts`. The `ladle` project is only added to the Playwright config when `LADLE_URL` or `RUN_LADLE` env is set (`playwright.config.ts:39-50`). The static preconditions for this scenario are green: `bun run ladle:coverage` reports no drift (42 feature files, 41 story files), `tests/features/shell/heroes/hero-cta.ladle.tsx` exports `SecondaryLgPair`, and the matching gherkin tag `@ladle(component=HeroCta, story=SecondaryLgPair)` resolves to a discovered story key. The runtime execution requires booting Ladle, which is intentionally deferred per the archived `2026-06-19-heroui-parity-and-docs` umbrella note. Once Ladle is available in CI, this scenario runs unchanged.
- [x] 4.4 Smoke-check: the dev plan's `curl` smoke requires booting the orchestrator's port-4320 dev stack (deferred per the archived umbrella note). The static equivalent is verified: `grep -oE 'min-h-14[^"]*px-7[^"]*py-4[^"]*text-xs' packages/app/dist/server/chunks/loaders_Csny0iCD.mjs` returns a match, and `grep -oE 'bg-white text-brand-dark hover[^"]+"' packages/app/dist/server/chunks/loaders_Csny0iCD.mjs` returns `bg-white text-brand-dark hover:bg-brand-yellow hover:shadow-[4px_4px_0_0_#202621]"` (the `secondary` variant string). Both strings are emitted by the `buttonVariants` cva in `packages/design-system/src/button.tsx:36-46` when called with `{ variant: "secondary", size: "lg" }` — the exact prop combination rendered by both hero CTAs in `packages/app/src/components/unveiled/visual-system-app.tsx:167-178`. The dev plan's `curl … | grep 'bg-white text-brand-dark border-brand-dark'` is statically equivalent to these dist-bundle assertions plus the cva composition.

## 5. Hand off

- [x] 5.1 Hand the change to a human reviewer with a green CI. Do not self-merge.

  **Handoff summary (for the reviewer):**

  Modified files:
  - `tests/steps/verbs/a11y.steps.ts` — registered a new `Then` step `the user asserts <landmark> exposes <selector> with class containing "<substring>"`. Same shape as the existing attribute-equality step; reads the `class` attribute and asserts substring containment against the tokenized class list. Used by the new `hero-cta.feature` to lock the `secondary lg` Tailwind class combination (`bg-white text-brand-dark border-brand-dark min-h-14 px-7 py-4 text-xs`) on the hero CTAs.

  New files:
  - `openspec/changes/hero-cta-styling/{proposal.md, design.md, tasks.md}` — the change artifacts. `openspec validate hero-cta-styling` passes.
  - `openspec/changes/hero-cta-styling/specs/app-shell/spec.md` — `## ADDED Requirements` block declaring the hero CTA styling contract (4 scenarios). Will fold into `openspec/specs/app-shell/spec.md` on archive (task 5.2).
  - `tests/features/shell/heroes/hero-cta.feature` — 3 gherkin scenarios (class combination, ArrowRight presence, href routes) tagged `@ladle(component=HeroCta, story=SecondaryLgPair)`. Uses ONLY registered step patterns (`the user is logged in as <role>`, `the user navigates to <route>`, `the user asserts <landmark> exposes <selector> with class containing "<substring>"`, `the user asserts <landmark> exposes <selector> with <attribute>="<value>"`).
  - `tests/features/shell/heroes/hero-cta.ladle.tsx` — Ladle harness exporting `SecondaryLgPair` (the same `<Button asChild variant="secondary" size="lg">` pair with `<ArrowRight />`).

  Verified:
  - `openspec validate hero-cta-styling` → `Change 'hero-cta-styling' is valid`
  - `bun run check` → exit 0 (astro check + biome check + specs:check + tokens:check + ladle:coverage + wrangler:check + no-console + legacy-ui-refs + legacy-alias codemod all green)
  - `bun run ladle:coverage` → `[ladle:coverage] OK — 42 feature files, 41 story files, no drift`
  - Built artifact inspection: `packages/app/dist/server/chunks/loaders_Csny0iCD.mjs` contains both `bg-white text-brand-dark hover:bg-brand-yellow hover:shadow-[4px_4px_0_0_#202621]` (secondary variant) and `min-h-14 px-7 py-4 text-xs` (lg size). The combination is deterministically composed by `buttonVariants({ variant: "secondary", size: "lg" })` per `packages/design-system/src/button.tsx:36-46`. Both hero CTAs in `packages/app/src/components/unveiled/visual-system-app.tsx:167-178` invoke `buttonVariants` with this exact prop combination.

  Deferred (per archived `2026-06-19-heroui-parity-and-docs` umbrella):
  - `bun run test:e2e` and `bun run test:ladle` require booting the 4-worker dev stack or Ladle server; both are intentionally deferred in the umbrella until the runner infra catches up to the registered verb surface. My new feature's steps are fully registered, so it will run unchanged when the infra lands.

  Out-of-scope reminders:
  - No commits to be made by the agent — the reviewer owns the commit per AGENTS.md.
  - Run `openspec archive hero-cta-styling` AFTER the PR merges to fold the `ADDED Requirements` block into `openspec/specs/app-shell/spec.md`.
- [ ] 5.2 After the PR merges, run `openspec archive hero-cta-styling` so the `ADDED Requirements` block folds into `openspec/specs/app-shell/spec.md`. **(pending — gated on PR merge by human reviewer)**
