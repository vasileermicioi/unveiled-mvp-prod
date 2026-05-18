# Playwright Testing

This project uses Playwright for browser-level parity smoke coverage under [tests/parity](/root/dev/deepcode/unveiled-mvp-prod/tests/parity).

## What Playwright Covers

- public route smoke checks
- member route redirects and seeded content
- partner and admin route smoke checks
- venue check-in route behavior
- demo-only label absence on production routes

The Playwright config lives in [playwright.config.ts](/root/dev/deepcode/unveiled-mvp-prod/playwright.config.ts).

## Prerequisites

Before running Playwright:

1. Load your environment variables into the current shell:

```bash
set -a
source .env
set +a
```

2. Make sure these variables are set:

- `PARITY_TEST_DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `PUBLIC_APP_URL`
- `BETTER_AUTH_URL` or `PUBLIC_BETTER_AUTH_URL`

3. Create the schema in the parity database.

For a fresh disposable parity database, the most direct option is:

```bash
DATABASE_URL="$PARITY_TEST_DATABASE_URL" bunx drizzle-kit push
```

4. Seed the parity fixture world:

```bash
bun run parity:seed
```

5. Install browsers once if needed:

```bash
bunx playwright install
```

## Main Commands

Run the full Playwright parity smoke suite:

```bash
bun run test:parity:smoke
```

List discovered Playwright tests:

```bash
bunx playwright test --list
```

Run one file:

```bash
bunx playwright test tests/parity/public-member.spec.ts
```

Run one test by name:

```bash
bunx playwright test -g "renders member routes with seeded data after login"
```

Run in headed mode:

```bash
bunx playwright test --headed
```

Run with the Playwright UI:

```bash
bunx playwright test --ui
```

## How It Runs In This Repo

When you run the smoke suite:

- Playwright uses [playwright.config.ts](/root/dev/deepcode/unveiled-mvp-prod/playwright.config.ts)
- `.env` is loaded by the Playwright config
- the app server is started through [scripts/start-parity-dev.ts](/root/dev/deepcode/unveiled-mvp-prod/scripts/start-parity-dev.ts)
- the base URL defaults to `http://127.0.0.1:4322`
- `PARITY_TEST_DATABASE_URL` is copied to `DATABASE_URL` for the Playwright process and app server
- `PARITY_TEST_MODE=1` makes the app env resolver prefer `PARITY_TEST_DATABASE_URL`
- the parity dev launcher writes a generated `.env.local` for Wrangler, and [scripts/run-parity-smoke.ts](/root/dev/deepcode/unveiled-mvp-prod/scripts/run-parity-smoke.ts) removes it after the run
- global setup seeds the parity fixture world via [tests/parity/global-setup.ts](/root/dev/deepcode/unveiled-mvp-prod/tests/parity/global-setup.ts)

Relevant files:

- [tests/parity/public-member.spec.ts](/root/dev/deepcode/unveiled-mvp-prod/tests/parity/public-member.spec.ts)
- [tests/parity/operations.spec.ts](/root/dev/deepcode/unveiled-mvp-prod/tests/parity/operations.spec.ts)
- [tests/parity/helpers.ts](/root/dev/deepcode/unveiled-mvp-prod/tests/parity/helpers.ts)

## Typical Full Flow

```bash
set -a
source .env
set +a

DATABASE_URL="$PARITY_TEST_DATABASE_URL" bunx drizzle-kit push
bun run parity:seed
bun run test:parity:smoke
```

If you also want the Bun-side regression tests:

```bash
bun run test:parity:contracts
```

Or everything:

```bash
bun run test:parity
```

## Debugging Failures

Run headed:

```bash
bunx playwright test tests/parity/public-member.spec.ts --headed
```

Open a trace:

```bash
bunx playwright show-trace test-results/<trace-dir>/trace.zip
```

Useful things to check:

- the parity database was pushed or migrated before seeding
- `bun run parity:seed` completed successfully
- the landing page hydrated before the test tried to click the login button
- the page content matches the text selectors used in the specs
- the browser console does not show a frontend runtime error

## Common Failure Modes

`relation "user" does not exist`

- the parity database schema was not created yet
- run:

```bash
DATABASE_URL="$PARITY_TEST_DATABASE_URL" bunx drizzle-kit push
```

Login button not found

- the page may not have hydrated yet
- rerun with `--headed`
- inspect the trace and browser console

Seeded parity rows are missing on `/discover`

- another dev server may already be running with a different database
- the parity config uses port `4322` by default to avoid reusing the normal dev server
- stop any stale process on the parity port, then rerun `bun run test:parity:smoke`

Playwright browsers missing

- run:

```bash
bunx playwright install
```

## Related Docs

- [parity-suite.md](/root/dev/deepcode/unveiled-mvp-prod/docs/testing/parity-suite.md)
- [legacy-parity-matrix.md](/root/dev/deepcode/unveiled-mvp-prod/docs/testing/legacy-parity-matrix.md)
