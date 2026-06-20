# Contributing to Unveiled MVP

Thanks for contributing. This file is the human-only counterpart to
[`AGENTS.md`](./AGENTS.md). Read `AGENTS.md` first for the tech stack, file
layout, coding conventions, OpenSpec workflow, iteration cycle, toolchain
commands, and definition of done — the rest of this file assumes that
context.

This file covers the three things that do not apply to AI agents: the
**pull request template**, the **review checklist**, and the **release
process**. Keep this doc ≤ 80 lines; defer everything else to `AGENTS.md`.

## 1. Pull request template

Open every PR from a feature branch off `main` and use the
[`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md)
template (create the file in this PR if it does not exist). At minimum the
PR description must include:

- **Why** — link the OpenSpec change (`openspec/changes/<name>/proposal.md`).
- **What** — bullet list of user-visible changes and the capability specs
  they touch.
- **Test plan** — `bun run check`, `bun run test:e2e`, and any visual or
  gherkin commands named in the proposal.
- **Risk / rollback** — one sentence on what could regress and how to
  revert.

## 2. Review checklist

Reviewers walk the change top-to-bottom against this list. A PR is not
mergeable until every box can be checked.

- [ ] The OpenSpec change folder exists and `openspec validate <name>` is
      green.
- [ ] `AGENTS.md` is updated if the stack, file layout, toolchain commands,
      or definition of done changed.
- [ ] `bun run check` is green on the PR commit (CI re-runs it; do not skip).
- [ ] `bun run test:e2e` is green, and any new gherkin scenarios are wired
      into the Playwright parity spec.
- [ ] `bun run specs:check` is green; TypeSpec sources and committed
      generated artifacts are in sync.
- [ ] `bun run arch:check` is green; the LikeC4 model still compiles and
      has no drift.
- [ ] `bun run tokens:check` is green; design-token CSS is in sync with
      `design-tokens.json`.
- [ ] No imports from `_old_app/`, no hand-edited Mermaid, no hand-edited
      files under `typespec/output/` or `src/lib/generated/`.
- [ ] Mutation paths go through `packages/app/src/actions/index.ts`, never
      through HTTP endpoints directly.
- [ ] The change is small enough to revert in one revert commit if it
      breaks production.

## 3. Release process

Releases are cut from `main` after the OpenSpec change is archived
(`openspec archive <name>`). The high-level flow:

1. Confirm `main` is green and the latest iteration summary is referenced
   in the release notes.
2. Tag the release (`git tag vX.Y.Z`) and push the tag.
3. `bun run deploy:cloudflare` ships the SSR app; `bun run deploy:jobs`
   ships the cron/queue workers.
4. Smoke-test the production URL against the gherkin parity suite.
5. Update the iteration summary in `.development-plan/0N-iteration/` with
   the deploy timestamp and any follow-up tasks.

For hotfixes, branch from the deployed commit, write a one-task
OpenSpec change (`hotfix-<slug>`), and fast-track the review checklist
above.
