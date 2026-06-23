## Why

The `scripts/codemod-prepend-app-prefix.ts --verify` gate (wired into `bun run check`) is meant to enforce that every gherkin step URL under `tests/features/**/*.feature` is prefixed with `/app` so the gherkin parity suite hits the real production paths via the orchestrator's `/app/*` dispatch. The script's URL-detection regex is too loose — it matches any `/...` substring inside a gherkin step, so running it against `tests/features/core-platform/orchestrator/feature.feature` rewrites `http://localhost:4320` → `http://app/localhost:4320`, `application/json; charset=utf-8` → `application/app/json; charset=utf-8`, `/healthz` → `/app/healthz`, and `/readyz` → `/app/readyz`, all of which are false positives. Those false positives make `--apply` corrupt the suite and make `--verify` flap, so the gate is unusable as a real gate. This change tightens the regex, adds an orchestrator-exclusion list, and adds per-scenario context for normalization-test scenarios so the gate becomes a true gate.

## What Changes

- **Rewrite the URL-detection regex** in `scripts/codemod-prepend-app-prefix.ts` from `(\/[a-z][\w./?=&%-]*)` (which matches any `/` substring) to `(?<![:/])\/[a-z][\w-]*(?:\/[\w-]+)*(?:\.\w+)?(?:\?[\w=&%-]*)?(?=#|\s|$|[),;.])` (which matches only path-shaped tokens not preceded by `:` or `/`). This eliminates the `http://` and `application/` false positives.
- **Extend `rewriteUrl` exclusion list** with orchestrator-owned paths: `/healthz`, `/readyz`, `/ladle/`, `/favicon.ico`, `/favicon.svg`. The existing `/app` prefix, `http(s)://` prefix, `/_` prefix, and `/api/` prefix exclusions are preserved.
- **Add per-scenario context** to the per-line walk: when the current `Scenario:` title matches `/normalizes/i` or `/does not normalize/i`, the codemod skips URL rewrites in that scenario's `When`/`Then`/`And`/`But` steps. The flag resets at the next `Scenario:` or `Background:` header. This protects normalization-test scenarios that deliberately use bare paths as test inputs.
- **Add unit tests** at `scripts/codemod-prepend-app-prefix.test.ts` covering: bare app routes get prefixed; full URLs and content-types are untouched; `/api/...`, `/healthz`, `/readyz` are untouched; normalization-test scenarios are skipped.
- **Re-run `bun run scripts/codemod-prepend-app-prefix.ts --verify`** against the existing feature tree and assert zero violations against the true-positive URL set.
- **Document the gate** in `AGENTS.md` §7 next to the existing `codemod:prepend-app-prefix` entry.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `gherkin-domain-features`: every `.feature` file under `tests/features/**/*.feature` SHALL have its app-route URLs prefixed with `/app` so the gherkin parity suite hits the orchestrator's `/app/*` dispatch. The `scripts/codemod-prepend-app-prefix.ts --verify` gate SHALL distinguish true app routes from full URLs (`http://...`), content-types (`application/json; charset=utf-8`), and orchestrator-owned endpoints (`/healthz`, `/readyz`, `/api/...`, `/ladle/...`, `/favicon.*`). The gate SHALL also skip normalization-test scenarios whose titles match `/normalizes|does not normalize/i`.

## Impact

- **New files:** `scripts/codemod-prepend-app-prefix.test.ts` (bun:test unit suite for the regex, exclusion list, and per-scenario context).
- **Modified files:**
  - `scripts/codemod-prepend-app-prefix.ts` — regex tightening, exclusion-list extension, per-scenario context flag.
  - `AGENTS.md` §7 — annotate `codemod:prepend-app-prefix` with what it does and what it excludes.
- **Removed files:** _none._
- **Dependencies changed:** _none._
- **Risks:**
  - **False negatives** — a tighter regex could miss a genuine un-prefixed app route (e.g. an unusual character class). Mitigation: the unit tests cover the documented patterns (`/discover`, `/admin`, `/en/admin`, `?query=value`, `.json` extensions); the `--verify` gate still surfaces any residual violations.
  - **Exclusion list drift** — adding a new orchestrator-owned path (e.g. `/metrics`) would silently be excluded by the prefix-list pattern. Mitigation: the prefix-list lives next to the regex in the same file and is asserted by the unit tests; adding a path is a one-line edit in a single file.
  - **Per-scenario regex too narrow** — only `/normalizes/i` and `/does not normalize/i` titles are skipped. A future test that uses a different wording (e.g. `Scenario: GET /admin redirects to /app/en/admin`) would still be rewritten. Mitigation: the unit test pins the exact title regex; future contributors can extend it by adding another test case, not by editing the script.