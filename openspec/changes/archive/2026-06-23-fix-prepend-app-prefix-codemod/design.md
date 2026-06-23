## Context

`scripts/codemod-prepend-app-prefix.ts` is a `bun run` script that walks every `.feature` file under `tests/features/` and rewrites gherkin step URLs that are missing the `/app` prefix. It is invoked with `--apply` (rewrite in place) or `--verify` (exit non-zero if any un-prefixed URL remains). The script is wired into `bun run check` (`scripts/codemod-prepend-app-prefix.ts --verify`).

The script's per-line walk currently:
1. matches a `^\s*(Given|When|Then|And|But)\b(.*)$` pattern and extracts the URL candidate via `/(\/[a-z][\w./?=&%-]*)/gi`,
2. replaces each match through `rewriteUrl`, which appends `/app` unless the URL already starts with `/app`, `/_`, `/api/`, `http://`, or `https://`.

The URL regex is too permissive — it matches any `/` substring, including the `/` inside `http://`, inside `application/json`, and inside content-type strings like `application/json; charset=utf-8`. The exclusion list in `rewriteUrl` covers `http(s)://` but not content-type prefixes and not orchestrator-owned paths like `/healthz` and `/readyz`. The combined effect is:

- `http://localhost:4320` → matches at the `/localhost:...` substring; `rewriteUrl` then sees `localhost:4320`, which does not start with `http://`, and prepends `/app` → `http://app/localhost:4320` (false positive).
- `application/json; charset=utf-8` → matches at the `/json` substring; `rewriteUrl` then sees `json`, which does start with `/` and is not excluded → `/app/json`, embedded back into the string → `application/app/json; charset=utf-8` (false positive).
- `/healthz` and `/readyz` → matched and rewritten to `/app/healthz`, `/app/readyz` (false positives; these are orchestrator-owned).
- `?tab=metrics` → no match (no leading `/`), so this is not a real false positive in practice.

The constraint set: the codemod is a `bun run` script (no build step), runs in plain Node/Bun without dependencies, and its behavior is pinned by `bun run check`. The unit tests live next to the script (`scripts/codemod-prepend-app-prefix.test.ts`) and are picked up by the existing `bun test tests/unit/` script.

## Goals / Non-Goals

**Goals:**

- Tighten the URL-detection regex to match only path-shaped tokens not preceded by `:` or `/`, so `http://`, `https://`, and content-type prefixes (`application/`, `text/html`, etc.) are skipped automatically.
- Extend the `rewriteUrl` exclusion list with the orchestrator-owned paths the gate must not touch (`/healthz`, `/readyz`, `/ladle/`, `/favicon.ico`, `/favicon.svg`).
- Add per-scenario context so the codemod skips URL rewrites inside normalization-test scenarios (titles matching `/normalizes|does not normalize/i`).
- Cover the script's behavior with a `bun:test` unit suite (`scripts/codemod-prepend-app-prefix.test.ts`) that pins the regex, the exclusion list, and the per-scenario skip.
- Wire the unit suite into the existing `bun run test:unit` (`bun test tests/unit/`) by either co-locating it under `tests/unit/` or by adding an explicit `bun test scripts/...` step in `package.json`'s `test:unit`.

**Non-Goals:**

- Rewriting the per-line walk into an AST-based parser (gherkin is line-oriented; the regex approach is sufficient and matches the existing style).
- Extending the exclusion list to every conceivable orchestrator endpoint. The list is closed at the orchestrator's currently-known endpoints; a new endpoint is a one-line edit.
- Adding a `--dry-run` mode. `--apply` already rewrites; `--verify` already checks. A third mode would be redundant.
- Touching the gherkin feature files themselves. The codemod is the only writer; the feature files are its inputs.

## Decisions

- **Replace the URL regex with `(?<![:/])\/[a-z][\w-]*(?:\/[\w-]+)*(?:\.\w+)?(?:\?[\w=&%-]*)?(?=#|\s|$|[),;.])`.** The negative lookbehind `(?<![:/])` rejects any `/` that is preceded by `:` or `/`, which eliminates `http://` and `application/`-style false positives. The leading `[a-z]` plus `[\w-]*` plus optional `(?:/[\w-]+)*` matches a normal path segment (e.g. `/en/admin`). The trailing lookahead `(?=#|\s|$|[),;.])` ends the match at a word boundary so we don't swallow trailing punctuation.
  - *Alternatives considered:*
    - **Use a positive list of allowed characters** (`(?<![\w:])\/(?![\w]*\/\/)...`). Rejected — more complex, no benefit over the negative lookbehind.
    - **Split URL detection from URL rewriting** with two passes (first identify URLs, then rewrite them). Rejected — adds a state machine for no observable benefit; the regex is correct.
- **Extend `rewriteUrl`'s exclusion list, not the regex.** `/healthz`, `/readyz`, `/api/...`, `/ladle/...`, `/favicon.ico`, `/favicon.svg` are not paths the codemod should ever rewrite; treating them as a closed allow-list inside `rewriteUrl` keeps the regex simple and the policy explicit.
  - *Alternatives considered:*
    - **Add an exclusion regex** (e.g. negative lookahead `(?!\/(healthz|readyz|api|ladle|favicon))`). Rejected — duplicates the existing string-prefix checks in `rewriteUrl` and is harder to extend.
    - **Hard-code the exclusion list in the regex itself** (`(?<![:/])(?!\/(?:healthz|readyz|api|ladle|favicon))\/...`). Rejected — the regex becomes hard to read and the exclusion list lives in two places (regex and `rewriteUrl`).
- **Per-scenario context is a `let` flag, not a class field.** The codemod is currently a top-level script with `let rewrites = 0; let violations = 0;` module-level state. Adding `let skipScenarioRewrites = false;` follows the same pattern and avoids introducing a wrapper function.
  - *Alternatives considered:*
    - **Refactor the codemod into a class.** Rejected — out of scope; the script's procedural style matches the rest of `scripts/`.
- **Unit tests use `bun:test`, the existing test runner.** The repo's `bun run test:unit` already runs `bun test tests/unit/`, but `scripts/codemod-prepend-app-prefix.test.ts` lives next to the script (matching the convention of `scripts/check-architecture-drift.ts` → `scripts/check-architecture-drift.test.ts` if it exists). Either co-locate or move under `tests/unit/`; the design leaves that as a one-line `package.json` edit.
  - *Alternatives considered:*
    - **Add a new `bun test scripts/codemod-prepend-app-prefix.test.ts` line to `package.json` `test:unit`.** Chosen — keeps the test next to the script, follows the pattern of other `scripts/*.test.ts` files if any exist. Will confirm during implementation.
- **Scenario-title regex is `/normalizes|does not normalize/i`.** The two phrasings cover the active scenarios in `tests/features/core-platform/orchestrator/feature.feature` (`Scenario: GET /app preserves the original query string on the redirect` is *not* skipped — only normalization scenarios are). Extending the regex is a one-character edit if a new phrasings is added.
  - *Alternatives considered:*
    - **Add a `@no-prefix` gherkin tag** for opt-out scenarios. Rejected — adds a new tag schema for a temporary need; the title regex is sufficient and self-documenting.
    - **Use a `Background:` style flag** (`# codemod: no-prefix`). Rejected — gherkin does not support arbitrary comments; the tag approach is the conventional way to do this and we deliberately rejected it.

## Risks / Trade-offs

- **Regex over-restricts and misses a genuine app route** (e.g. a path with `_` or uppercase). → Mitigation: the regex uses `[\w-]*` which covers underscores and alphanumerics; the unit tests cover the documented patterns. If a future path breaks the regex, the unit test for that path is added in the same PR.
- **Exclusion list drifts out of sync with the orchestrator's actual surface.** → Mitigation: the list is co-located with `rewriteUrl` and asserted by unit tests; adding `/metrics` (or similar) is a one-line edit.
- **Per-scenario regex misses a phrasing** (e.g. `Scenario: GET /admin normalises to /app/en/admin` — British spelling). → Mitigation: the regex is case-insensitive (`i` flag) but English-only; the spec scenario pins the title regex, so any future phrasing has to add a test, not a silent code edit.
- **`bun test tests/unit/` does not currently pick up scripts co-located test files.** → Mitigation: the implementation step explicitly wires `scripts/codemod-prepend-app-prefix.test.ts` into `bun run test:unit` (either by extending the `bun test` glob or by adding a second `bun test` line).

## Migration Plan

This change is purely additive to the codemod script plus a new test file. No data migrations. Roll-out:

1. Edit `scripts/codemod-prepend-app-prefix.ts`:
   - Replace the URL regex with the tightened form.
   - Extend `rewriteUrl` with the exclusion list.
   - Add a `skipScenarioRewrites` flag, reset on every `Scenario:` / `Background:` line, and set when the title matches the regex.
2. Create `scripts/codemod-prepend-app-prefix.test.ts` with `bun:test` cases that pin the regex, the exclusion list, and the per-scenario skip.
3. Extend `bun run test:unit` (or `package.json`) so the new test file is picked up.
4. Run `bun run scripts/codemod-prepend-app-prefix.ts --verify` and confirm it passes against the existing feature tree with zero changes (no `--apply` is needed because the false-positive rewrites never landed — they were reverted during this proposal's discovery).
5. Add a one-line note to `AGENTS.md` §7 next to `codemod:prepend-app-prefix` describing the gate and the orchestrator-exclusion list.
6. Run `bun run check` to confirm the umbrella gate stays green.

Rollback: revert `scripts/codemod-prepend-app-prefix.ts`, the new test file, and the `AGENTS.md` line. The feature files are unchanged (the gate was previously broken, not silently rewriting anything).

## Open Questions

- **Should the unit test live at `scripts/codemod-prepend-app-prefix.test.ts` (next to the script) or `tests/unit/codemod-prepend-app-prefix.test.ts`?** Both conventions exist in the repo. Implementation will pick whichever `bun run test:unit` picks up most easily; if both need an edit, the co-located location wins because the test exercises internal helpers that aren't exported.